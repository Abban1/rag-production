from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from pdf_handler import router as pdf_router
from chat import router as chat_router

# Create app first
app = FastAPI(title="RAG PDF Chat")

# Add CORS middleware FIRST - before any other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Then add routers
app.include_router(auth_router, prefix="/auth")
app.include_router(pdf_router, prefix="/pdf")
app.include_router(chat_router, prefix="/chat")

@app.get("/")
async def root():
    return {"message": "RAG PDF Chat API is running"}