from pydantic import BaseModel,Field,EmailStr
from typing import Optional
from bson import ObjectId

class TodoDocument(BaseModel):
    id: Optional[str] = Field(alias="_id")
    title: str
    description: Optional[str]
    is_completed: bool = False
    owner_id: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True