import os
import traceback
import fiona
import logging
import datetime
import json
from pathlib import Path
from typing import Any

import numpy as np
from sqlalchemy.orm import Session
import pandas as pd
from pyproj import Transformer

from app import crud
from app.models import GeoFile, GeoFileStatus, Tree
from app.api import deps
from .create_mbtiles import create_mbtiles


def create_tree(geofile: GeoFile, x: float, y: float, properties: Any) -> Tree:
    properties_tree = {}

    if geofile.mapping_fields:
        mapping_fields = json.loads(geofile.mapping_fields)

        for key in mapping_fields:
            properties_key = mapping_fields[key]
            properties_tree[key] = properties[properties_key]

    tree = Tree(
        geofile_id=geofile.id,
        user_id=geofile.user_id,
        organization_id=geofile.organization_id,
        geom=f'POINT({x} {y})',
        properties=properties_tree
    )  # type: ignore

    return tree


def import_from_fiona(db: Session, path: Path, geofile: GeoFile):
    transformer = None

    if geofile.crs != 'epsg:4326':
        transformer = Transformer.from_crs(
            geofile.crs.lower(),
            "epsg:4326",
            always_xy=True)

    with fiona.open(path) as c:
        for i, feature in enumerate(c):
            x, y = feature["geometry"]["coordinates"]

            if transformer:
                x, y = transformer.transform(x, y)

            properties = feature["properties"]
            tree = create_tree(geofile, x, y, properties)
            db.add(tree)

            if i % 1000 == 0 and i > 0:
                db.commit()
        db.commit()


def import_from_dataframe(db: Session, df: pd.DataFrame, path: Path, geofile: GeoFile):
    if not geofile.longitude_column:
        raise Exception(f"unknow longitude_column in {geofile.name} file")

    if not geofile.latitude_column:
        raise Exception(f"unknow latitude_column in {geofile.name} file")

    transformer = None

    if geofile.crs.lower() != 'epsg:4326':
        transformer = Transformer.from_crs(
            int(geofile.crs.lower().split(':')[1]),
            4326)

    for i in df.index:
        x = df.loc[i, geofile.longitude_column]
        y = df.loc[i, geofile.latitude_column]

        if np.isnan(x) or np.isnan(y):
            continue

        if transformer:
            x, y = transformer.transform(x, y)

        properties = df.loc[i]
        tree = create_tree(geofile, x, y, properties)
        db.add(tree)

        if i % 1000 == 0 and i > 0:
            db.commit()
    db.commit()


def import_geofile(db: Session, geofile: GeoFile):
    logging.info('running geofile import task')
    try:
        geofile.status = GeoFileStatus.IMPORTING.value
        geofile.importing_start = datetime.datetime.utcnow()
        db.commit()

        if geofile.extension in ['geojson', 'zip']:
            import_from_fiona(db, geofile.get_filepath(), geofile)

        if geofile.extension in ['xlsx', 'xls']:
            df = pd.read_excel(geofile.get_filepath())
            import_from_dataframe(db, df, geofile.get_filepath(), geofile)

        if geofile.extension == 'csv':
            df = pd.read_csv(geofile.get_filepath())
            import_from_dataframe(db, df, geofile.get_filepath(), geofile)

        organization = crud.organization.get(db=db, id=geofile.organization_id)
        create_mbtiles(db=db, organization=organization)

        geofile.imported_date = datetime.datetime.utcnow()
        geofile.status = GeoFileStatus.IMPORTED.value
        db.commit()

        logging.info(f"imported {geofile.name} geofile")
    except:
        traceback.print_exc()

        geofile.status = 'error'
        db.commit()
