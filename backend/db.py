from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['rag_db']

users_collection = db['users']
pdfs_collection = db['pdfs']
embeddings_collection = db['embeddings']
chats_collection = db['chats']
