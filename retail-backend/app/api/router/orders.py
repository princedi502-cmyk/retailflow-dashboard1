from fastapi import APIRouter, Depends
from app.schemas.order_schema import OrderCreate, OrderResponse
from app.api.router.dependency import require_employee, require_owner
from app.services.order_service import create_order_service, get_orders_service

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, user=Depends(require_employee)):

    return await create_order_service(order)


@router.get("/", response_model=list[OrderResponse])
async def get_orders(user=Depends(require_owner)):

    return await get_orders_service()