import fiona
import logging
import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import GeoFile, GeoFileStatus, Tree


def import_from_fiona(db: Session, path: Path, geofile_id: int):
    with fiona.open(path) as source:
        print('total', len(source))
        for i, feature in enumerate(source):
            x, y = feature["geometry"]["coordinates"]
            tree = Tree(
                geofile_id=geofile_id,
                geom=f'POINT({x} {y})'
            )

            db.add(tree)

            if i % 1000 == 0 and i > 0:
                db.commit()
        db.commit()


def import_geofile(db: Session, geofile: GeoFile):
    geofile.status = GeoFileStatus.IMPORTING.value
    geofile.importing_start = datetime.datetime.utcnow()
    db.commit()

    if geofile.extension == 'geojson':
        import_from_fiona(db, geofile.get_filepath(), geofile.id)

    if geofile.extension == 'zip':
        import_from_fiona(db, f'zip://{geofile.get_filepath()}', geofile.id)

    geofile.imported_date = datetime.datetime.utcnow()
    geofile.status = GeoFileStatus.IMPORTED.value
    db.commit()
    logging.info(f"imported {geofile.name} geofile")
