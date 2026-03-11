from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.router import auth, products, orders, analytics,supplier


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="RetailFlow API",
    version="1.0.0",
    lifespan=lifespan
)
@app.options("/{rest_of_path:path}")
async def preflight_handler():
    return {"status": "ok"} 
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(supplier.router)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "database": "connected"
    }