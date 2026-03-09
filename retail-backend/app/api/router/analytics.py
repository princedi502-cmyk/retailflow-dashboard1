from fastapi import APIRouter, Depends
from app.db.mongodb import db_manager
from app.api.router.dependency import get_current_user, require_employee, require_owner
from datetime import datetime, timezone,timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/revenue")
async def total_revenue(user=Depends(require_owner)):

    order_collection = db_manager.db["orders"]

    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_price"}
            }
        }
    ]

    result = await order_collection.aggregate(pipeline).to_list(1)

    if result:
        return {"total_revenue": result[0]["total_revenue"]}

    return {"total_revenue": 0}


@router.get("/orders-count")
async def total_orders(user=Depends(require_owner or require_employee)):

    order_collection = db_manager.db["orders"]

    count = await order_collection.count_documents({})

    return {"total_orders": count}


@router.get("/top-products")
async def top_products(user=Depends(get_current_user)):

    order_collection = db_manager.db["orders"]

    pipeline = [
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.name",
                "total_sold": {"$sum": "$items.quantity"}
            }
        },
        {"$sort": {"total_sold": -1}},
        {"$limit": 5}
    ]

    result = await order_collection.aggregate(pipeline).to_list(5)

    return result

@router.get("/worst-products")
async def worst_products(user=Depends(get_current_user)):

    order_collection = db_manager.db["orders"]

    pipeline = [
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.name",
                "total_sold": {"$sum": "$items.quantity"}
            }
        },
        {"$sort": {"total_sold": 1}},
        {"$limit": 5}
    ]

    result = await order_collection.aggregate(pipeline).to_list(5)

    return result

@router.get("/sales-summary")
async def sales_summary(user=Depends(get_current_user)):

    order_collection = db_manager.db["orders"]

    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=today_start.weekday())

    pipeline = [
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": None,
                "today": {
                    "$sum": {
                        "$cond": [
                            {"$gte": ["$created_at", today_start]},
                            "$items.quantity",
                            0
                        ]
                    }
                },
                "week": {
                    "$sum": {
                        "$cond": [
                            {"$gte": ["$created_at", week_start]},
                            "$items.quantity",
                            0
                        ]
                    }
                }
            }
        }
    ]

    result = await order_collection.aggregate(pipeline).to_list(1)

    if result:
        return {
            "items_sold_today": result[0]["today"],
            "items_sold_week": result[0]["week"]
        }

    return {
        "items_sold_today": 0,
        "items_sold_week": 0
    }
# @router.get("/items-today")
# async def items_today(user=Depends(get_current_user)):
#     order_collection = db_manager.db["orders"]

#     today = datetime.now(timezone.utc).date()

#     pipeline =[
#         {
#             "$match": {
#                 "created_at":{
#                     "$gte": datetime(today.year , today.month , today.day)
#                 }
#             }
#         },
#         {"$unwind":"$items"},
#         {
#             "$group":{
#                 "_id":None,
#                 "items_sold":{"$sum":"$items.quantity"}
#             }
#         }
#     ]
#     result = await order_collection.aggregate(pipeline).to_list(1)
    
#     return {"items_sold_today":result[0]["items_sold"]if result else 0}


# @router.get("/items-week")
# async def items_sold_week(user=Depends(get_current_user)):

#     order_collection = db_manager.db["orders"]
#     now = datetime.now(timezone.utc)
#     # today = datetime.now(timezone.utc).date()
#     today = now.replace(hour=0, minute=0, second=0, microsecond=0)

#     week_start = today - timedelta(days=today.weekday())

#     pipeline = [
#         {
#             "$match": {
#                 "created_at": {
#                     "$gte": week_start
#                 }
#             }
#         },
#         {"$unwind": "$items"},
#         {
#             "$group": {
#                 "_id": None,
#                 "items_sold": {"$sum": "$items.quantity"}
#             }
#         }
#     ]

#     result = await order_collection.aggregate(pipeline).to_list(1)

#     return {"items_sold_week": result[0]["items_sold"] if result else 0}


@router.get("/low-stock-products")
async def low_stock_products(user=Depends(get_current_user)):

    product_collection = db_manager.db["products"]

    cursor = product_collection.find(
        {"stock": {"$lt": 10}},
        {
            "_id": 0,
            "name": 1,
            "category": 1,
            "stock": 1
        }
    )

    products = await cursor.to_list(length=50)

    return products

# @router.get("/low-stock")
# async def low_stock(user=Depends(get_current_user)):
#     product_collection = db_manager.db["products"]

#     count = await product_collection.count_documents({
#         "quantity":{"$lt":10}

#     })

#     return {"low_stock":count}