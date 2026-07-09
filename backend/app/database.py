from pymongo import MongoClient
from app.config import settings

mongo_client = None
db = None
users_collection = None

try:
    mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client["easy_track_db"]
    users_collection = db["users"]
    
    # Check if connected
    mongo_client.server_info()
    print("[MONGODB] Connected successfully to MongoDB.")
except Exception as e:
    print(f"[MONGODB] Failed to connect to MongoDB: {e}")

def get_users_collection():
    return users_collection

def get_companies_collection():
    return db["companies"] if db is not None else None

def get_mongo_client():
    return mongo_client
