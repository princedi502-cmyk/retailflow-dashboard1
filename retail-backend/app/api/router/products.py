from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId

from app.api.router.dependency import get_current_user, require_owner, require_employee
from app.db.mongodb import db_manager
from app.schemas.product_schema import ProductCreate, ProductResponse,LowStockProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    user=Depends(require_owner)
):

    product_dict = product.model_dump()

    result = await db_manager.db["products"].insert_one(product_dict)

    new_product = await db_manager.db["products"].find_one({"_id": result.inserted_id})

    new_product["id"] = str(new_product["_id"])
    del new_product["_id"]

    return new_product

@router.get("/", response_model=list[ProductResponse])
async def get_products( page: int = Query(1, ge=1),limit: int = Query(10, ge=1),user=Depends(get_current_user)):
    
    skip_value = (page - 1) * limit 
    products = []
    async for product in db_manager.db["products"].find().skip(skip_value).limit(limit):
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)

    return products

@router.get("/low-stock",response_model=List[LowStockProductResponse])
async def get_product(user=Depends(get_current_user)):
    products = []
    
    async for product in db_manager.db["products"].find({
        "$expr": { "$lt": ["$stock", "$low_stock_threshold"] }
    }):
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)

    return products

@router.get("/search",response_model=List[ProductResponse])
async def get_product(q :str | None = None,user=Depends(get_current_user)):
    products = []

    async for product in db_manager.db["products"].find({ "name": { "$regex": f"^{q}", "$options": "i" } }):
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)

    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, user=Depends(get_current_user)):

    product = await db_manager.db["products"].find_one({"_id": ObjectId(product_id)})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["id"] = str(product["_id"])
    del product["_id"]

    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product: ProductCreate,
    user=Depends(require_owner)
):

    updated = await db_manager.db["products"].find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": product.model_dump()},
        return_document=True
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")

    updated["id"] = str(updated["_id"])
    del updated["_id"]

    return updated
@router.delete("/{product_id}")
async def delete_product(product_id: str, user=Depends(require_owner)):

    product_collection = db_manager.db["products"]

    result = await product_collection.delete_one({"_id": ObjectId(product_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted"}

@router.get("/barcode/{barcode}",response_model=ProductResponse)
async def get_product(barcode: str, user=Depends(get_current_user)):
    
    product = await db_manager.db["products"].find_one({"barcode": str(barcode)})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["id"] = str(product["_id"])
    
    return product





