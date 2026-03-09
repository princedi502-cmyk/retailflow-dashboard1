from pydantic import BaseModel
from typing import Optional


class ProductBase(BaseModel):
    name: str
    price: float
    stock: int
    barcode: str


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    barcode: Optional[str] = None


class ProductResponse(ProductBase):
    id: str

    class Config:
        from_attributes = True