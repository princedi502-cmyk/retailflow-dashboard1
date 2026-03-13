from fastapi import APIRouter, Depends, HTTPException, Path, Request
from app.schemas.order_schema import OrderCreate, OrderResponse
from app.api.router.dependency import get_current_user, require_employee, require_owner
from app.services.order_service import create_order_service, get_orders_service
from app.core.rate_limit import limiter
import re

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=OrderResponse)
@limiter.limit("60/minute")
async def create_order(
    request: Request,
    order: OrderCreate, 
    current_user: dict = Depends(get_current_user)
):
    # Validate order data
    if not order.items or len(order.items) == 0:
        raise HTTPException(
            status_code=400,
            detail="Order must contain at least one item"
        )
    
    # Validate each item
    for item in order.items:
        # Check that either barcode or productId is provided
        if not item.barcode and not item.productId:
            raise HTTPException(
                status_code=400,
                detail="Either barcode or productId must be provided for each item"
            )
        
        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Item quantity must be greater than 0"
            )

    return await create_order_service(order, current_user)


@router.get("/", response_model=list[OrderResponse])
async def get_orders(user=Depends(get_current_user)):

    return await get_orders_service()