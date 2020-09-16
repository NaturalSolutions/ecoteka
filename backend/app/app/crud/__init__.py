from .base import (
    CRUDBase
)
from .crud_user import (
    user
)
from .crud_contact import (
    contact
)
from .crud_registration_link import (
    registration_link
)
from .crud_geo_file import (
    geo_file
)
from .crud_tree import (
    tree
)
from .crud_organization import (
    organization
)

__all__ = [
    "contact",
    "CRUDBase",
    "geo_file",
    "organization"
    "registration_link",
    "tree",
    "user",
]

# For a new basic set of CRUD operations you could just do

# from .base import CRUDBase
# from app.models.item import Item
# from app.schemas.item import ItemCreate, ItemUpdate

# item = CRUDBase[Item, ItemCreate, ItemUpdate](Item)
