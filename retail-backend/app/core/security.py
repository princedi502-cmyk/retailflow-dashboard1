from datetime import datetime,timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashed_password(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)
    if len(password) > 72:
        password = password[:72]
        
    return pwd_context.hash(password)

# def hashed_password(password:str) -> str :
#     if len(password) > 72:
#         password=password[:72]
#     return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password: str) -> bool:
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password,hashed_password)

def create_access_token(data:dict, expires_delta:Optional[timedelta]=None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))    
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,settings.SECRET_KEY,algorithm=settings.ALGORITHM)
