import datetime
import hashlib
from json import dumps, loads
from typing import TYPE_CHECKING
from pathlib import Path

from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    Enum,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship
import fiona
import pandas as pd

from app.core.config import settings
from app.db.base_class import Base
from app.schemas import GeoFileStatus


class GeoFile(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    organization_id = Column(Integer, ForeignKey("organization.id"))
    name = Column(String, index=True, unique=True, nullable=False)
    original_name = Column(String, nullable=False)
    extension = Column(String, nullable=False)
    checksum = Column(String, nullable=False)
    count = Column(Integer, nullable=False, default=0)
    driver = Column(String, nullable=True)
    crs = Column(String, nullable=True, default=None)
    longitude_column = Column(String, nullable=True)
    latitude_column = Column(String, nullable=True)
    properties = Column(JSON, nullable=True)
    mapping_fields = Column(JSON, nullable=True)
    status = Column(
        Enum(GeoFileStatus, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default=GeoFileStatus.UPLOADED.value,
    )
    uploaded_date = Column(DateTime, nullable=True, default=datetime.datetime.utcnow)
    imported_date = Column(DateTime, nullable=True)
    importing_start = Column(DateTime, nullable=True)
    public = Column(Boolean, nullable=False, default=False)

    user = relationship("User")
    organization = relationship("Organization")

    def __init__(
        self,
        user_id: int,
        organization_id: int,
        name: str,
        extension: str,
        original_name: str,
    ):
        self.user_id = user_id
        self.organization_id = organization_id
        self.name = name
        self.extension = extension
        self.original_name = original_name
        self.get_metadata()
        self.get_checksum()
        super().__init__()

    def get_filepath(self, extended: bool = True):
        if self.extension == "zip" and extended:
            return (
                f"zip://{settings.UPLOADED_FILES_FOLDER}/{self.name}.{self.extension}"
            )
        else:
            return f"{settings.UPLOADED_FILES_FOLDER}/{self.name}.{self.extension}"

    def get_longitude_latitude_columns(self):
        properties = loads(self.properties)

        if not self.longitude_column:
            for i in properties:
                if i in ["longitude", "long", "lon", "lng", "x"]:
                    self.longitude_column = i

        if not self.latitude_column:
            for i in properties:
                if i in ["latitude", "lat", "y"]:
                    self.latitude_column = i

    def get_metadata(self):
        if self.extension in ["geojson", "zip"]:
            with fiona.open(self.get_filepath()) as c:
                self.count = len(c)
                self.driver = c.driver
                self.crs = c.crs["init"]
                self.properties = dumps(c.schema["properties"])

        if self.extension in ["xlsx", "xls"]:
            engine = "xlrd"

            if self.extension == "xlsx":
                engine = "openpyxl"

            df = pd.read_excel(self.get_filepath(), engine=engine)
            self.count = len(df.index)
            self.driver = "Excel"
            self.crs = "epsg:4326"
            self.properties = dumps(df.dtypes.astype(str).to_dict())
            self.get_longitude_latitude_columns()

        if self.extension == "csv":
            df = pd.read_csv(self.get_filepath())
            self.count = len(df.index)
            self.driver = "CSV"
            self.crs = "epsg:4326"
            self.properties = dumps(df.dtypes.astype(str).to_dict())
            self.get_longitude_latitude_columns()

    def get_checksum(self):
        with open(self.get_filepath(extended=False), "rb") as f:
            file_hash = hashlib.md5()
            file_hash.update(str(self.organization_id).encode('ASCII'))
            while chunk := f.read(8192):
                file_hash.update(chunk)

        self.checksum = file_hash.hexdigest()

    def is_valid(self):
        try:
            if self.extension == "geojson":
                return self.driver == "GeoJSON"

            if self.extension == "zip":
                return self.driver == "ESRI Shapefile"

            if self.extension == "csv":
                df = pd.read_csv(self.get_filepath())
                return len(df.columns) > 0 and not df.empty

            if self.extension == "xls" or self.extension == "xlsx":
                engine = "xlrd"

                if self.extension == "xlsx":
                    engine = "openpyxl"
                
                df = pd.read_excel(self.get_filepath(), engine=engine)
                return len(df.columns) > 0 and not df.empty
        except:
            return False
