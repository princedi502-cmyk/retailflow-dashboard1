from pydantic import BaseModel, EmailStr, Field

class BaseUser(BaseModel):
    username: str
    email: EmailStr

class UserCreate(BaseUser):
    password: str = Field(..., min_length=6, max_length=72)
    role: str = "employee"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseUser):
    id: str

    class Config:
        from_attributes = True