"""
Database indexes setup for RetailFlow
Run this script once to create all necessary indexes for production
"""

import asyncio
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.core.config import settings

async def create_indexes():
    """Create all necessary database indexes"""
    await connect_to_mongo()
    
    db = await connect_to_mongo()
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("role")
    
    # Products collection indexes
    await db.products.create_index("name", unique=True)
    await db.products.create_index("barcode", unique=True, sparse=True)
    await db.products.create_index("category")
    await db.products.create_index("stock")
    await db.products.create_index([("stock", 1), ("low_stock_threshold", 1)])
    
    # Orders collection indexes
    await db.orders.create_index("user_id")
    await db.orders.create_index("created_at")
    await db.orders.create_index([("user_id", 1), ("created_at", -1)])
    await db.orders.create_index("items.name")
    await db.orders.create_index("items.product_id")
    
    # Suppliers collection indexes
    await db.suppliers.create_index("name", unique=True)
    await db.suppliers.create_index("email", unique=True)
    
    # Purchase orders collection indexes
    await db.purchase_orders.create_index("supplier_id")
    await db.purchase_orders.create_index("status")
    await db.purchase_orders.create_index("created_at")
    
    print("✅ All database indexes created successfully!")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(create_indexes())
