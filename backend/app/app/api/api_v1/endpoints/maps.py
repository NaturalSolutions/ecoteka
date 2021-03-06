from typing import Dict, Optional, List
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from bokeh import palettes

from app.api import get_db
from app.core import (
    authorization,
    set_policies
)

router = APIRouter()

policies = {
    "maps:get_filters": ["owner", "manager", "contributor", "reader"],
    "maps:get_bbox": ["owner", "manager", "contributor", "reader"]
}

set_policies(policies)


@router.get("/style/")
def generate_style(
    db: Session = Depends(get_db),
    theme: Optional[str] = "dark",
    background: Optional[str] = "map"
) -> Dict:
    """
    Generate style
    """
    with open(f"/app/app/assets/styles/{theme}.json") as style_json:
        style = json.load(style_json)

        if background == "satellite":
            satellite = [index for index, layer in enumerate(style["layers"]) if layer["id"] == "satellite"]
            
            if len(satellite) > 0:
                style["layers"][satellite[0]]["layout"]["visibility"] = "visible"


        style["sources"]["cadastre-france"] = {
            "type": "vector",
            "tiles": [
                "https://openmaptiles.geo.data.gouv.fr/data/cadastre/{z}/{x}/{y}.pbf"
            ],
            "minzoom": 11,
            "maxzoom": 16,
        }

        style["layers"].insert(
            len(style["layers"]),
            {
                "id": "cadastre-france-parcelles",
                "type": "fill",
                "source": "cadastre-france",
                "source-layer": "parcelles",
                "paint": {
                    "fill-color": "#5a3fc0",
                    "fill-opacity": 0.3
                },
                "layout": {"visibility": "none"}
            }
        )

        style["layers"].insert(
            len(style["layers"]),
            {
                "id": "cadastre-france-batiments",
                "type": "fill",
                "source": "cadastre-france",
                "source-layer": "batiments",
                "paint": {
                    "fill-color": "#5a3fc0",
                    "fill-opacity": 0.3
                },
                "layout": {"visibility": "none"}
            }
        )

        style["layers"].insert(
            len(style["layers"]),
            {
                "id": "cadastre-france-sections",
                "type": "fill",
                "source": "cadastre-france",
                "source-layer": "sections",
                "paint": {
                    "fill-color": "#5a3fc0",
                    "fill-opacity": 0.3
                },
                "layout": {"visibility": "none"}
            }
        )

        return style

def hex_to_rgb(hex):
        hex = hex.lstrip('#')
        hlen = len(hex)
        return tuple(int(hex[i:i + hlen // 3], 16) for i in range(0, hlen, hlen // 3))

@router.get("/filter", dependencies=[Depends(authorization("maps:get_filters"))])
def get_filters(
    organization_id: int,
    db: Session = Depends(get_db)
) -> Dict:
    """
    Get filters 
    """
    fields = ["canonicalName", "vernacularName"]
    filter: Dict = {}

    for field in fields:
        rows = db.execute(f"""
            select distinct properties ->> '{field}' as value, count(properties) as total
            from tree
            where organization_id = {organization_id}
            group by properties ->> '{field}'
            order by total desc;""")
        colors = palettes.viridis(rows.rowcount)
        filter[field] = [{ 
            'value': row.value, 
            'total': row.total, 
            'color': hex_to_rgb(colors[i]) 
        } for i, row in enumerate(rows) if row[0] not in ["", None]]
    
    return filter

@router.get("/bbox", dependencies=[Depends(authorization("maps:get_bbox"))])
def get_bbox(
    organization_id: int,
    db: Session = Depends(get_db)
) -> List:
    """
    Get the bounding box of all active trees within a organization
    """

    rows = db.execute(f"""
        SELECT 
            ST_XMIN(ST_EXTENT(geom)) as xmin, 
            ST_YMIN(ST_EXTENT(geom)) as ymin, 
            ST_XMAX(ST_EXTENT(geom)) as xmax, 
            ST_YMAX(ST_EXTENT(geom)) as ymax
        FROM tree 
        WHERE organization_id = {organization_id}
        AND status NOT IN ('delete', 'import');
    """)

    return rows.first()
