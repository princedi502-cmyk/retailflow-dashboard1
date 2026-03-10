from pydantic import BaseModel,Field,EmailStr
from typing import Optional
from bson import ObjectId

class ProdcuctData(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    price: float
    stock : int
    barcode: str
    category: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True