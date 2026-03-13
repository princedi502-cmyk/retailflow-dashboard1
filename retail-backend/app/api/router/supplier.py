from typing import List
import re
from fastapi import APIRouter,Depends, HTTPException, Path, Query, Request
from app.schemas.supplier_schema import CreateSupplier,SupplierResponse
from app.api.router.dependency import get_current_user,require_employee,require_owner
from app.services.supplier_service import create_supplier_service, get_supplier_service,update_supplier_service,delete_supplier_service
from app.core.rate_limit import limiter


router = APIRouter(
    prefix="/supplier",
    tags=["suppliers"]
)

@router.post("/",response_model=SupplierResponse)
@limiter.limit("30/minute")
async def create_supplier(
    request: Request,
    supplier: CreateSupplier, 
    user=Depends(require_owner)
):
    # Validate supplier data
    if not supplier.name or not supplier.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Supplier name is required"
        )
    
    if len(supplier.name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Supplier name must be at least 2 characters long"
        )
    
    if supplier.email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', supplier.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )
    
    if supplier.phone and not re.match(r'^[+]?[\d\s\-\(\)]{10,}$', supplier.phone):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number format"
        )

    return await create_supplier_service(supplier)


@router.get("/",response_model=List[SupplierResponse])
async def get_supplier(user=Depends(get_current_user)):

    return await get_supplier_service()

@router.put("/{supplier_id}",response_model=SupplierResponse)
@limiter.limit("40/minute")
async def update_supplier(
    request: Request,
    supplier: CreateSupplier,
    supplier_id: str = Path(..., min_length=24, max_length=24, description="Supplier ID"),
    user=Depends(require_owner)
):
    # Validate ObjectId format
    if not re.match(r'^[0-9a-fA-F]{24}$', supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID format"
        )
    
    # Validate supplier data
    if not supplier.name or not supplier.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Supplier name is required"
        )
    
    if len(supplier.name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Supplier name must be at least 2 characters long"
        )
    
    if supplier.email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', supplier.email):
        raise HTTPException(
            status_code=400,
            detail="Invalid email format"
        )
    
    if supplier.phone and not re.match(r'^[+]?[\d\s\-\(\)]{10,}$', supplier.phone):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number format"
        )
    
    return await update_supplier_service(supplier_id, supplier)

@router.delete("/{supplier_id}")
@limiter.limit("20/minute")
async def delete_supplier(
    request: Request,
    supplier_id: str = Path(..., min_length=24, max_length=24, description="Supplier ID"),
    user=Depends(require_owner)
):
    # Validate ObjectId format
    if not re.match(r'^[0-9a-fA-F]{24}$', supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid supplier ID format"
        )
    
    return await delete_supplier_service(supplier_id)