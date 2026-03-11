from typing import List

from fastapi import APIRouter,Depends
from app.schemas.supplier_schema import CreateSupplier,SupplierResponse
from app.api.router.dependency import get_current_user,require_employee,require_owner
from app.services.supplier_service import create_supplier_service, get_supplier_service,update_supplier_service,delete_supplier_service


router = APIRouter(
    prefix="/supplier",
    tags=["suppliers"]
)

@router.post("/",response_model=SupplierResponse)
async def create_supplier(supplier: CreateSupplier, user=Depends(require_owner)):

    return await create_supplier_service(supplier)


@router.get("/",response_model=List[SupplierResponse])
async def get_supplier(user=Depends(get_current_user)):

    return await get_supplier_service()

@router.put("/{supplier_id}",response_model=SupplierResponse)
async def update_supplier(supplier_id: str, supplier: CreateSupplier,user=Depends(require_owner)):
    return await update_supplier_service(supplier_id,supplier)

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id:str,user=Depends(require_owner)):
    return await delete_supplier_service(supplier_id)