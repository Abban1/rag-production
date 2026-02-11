from fastapi import APIRouter, Depends, HTTPException
from models import ChatRequest
from utils import get_current_user
from db import chats_collection, pdfs_collection
from rag import model, query_rag
from bson import ObjectId

router = APIRouter()

@router.post("/ask")
async def chat_with_pdf(req: ChatRequest, user=Depends(get_current_user)):
    try:
        # Validate PDF exists and belongs to user
        pdf_id = ObjectId(req.pdf_id)
        pdf = pdfs_collection.find_one({
            "_id": pdf_id,
            "user_id": str(user["_id"])
        })
        
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Generate embedding for query
        query_embedding = model.encode(req.message).tolist()
        
        # Get relevant pages from RAG
        relevant_pages = query_rag(pdf_id, query_embedding, top_k=5)
        
        # Generate response
        if relevant_pages:
            answer = "\n\n".join(relevant_pages[:3])
        else:
            answer = "No relevant information found in the PDF for your question."
        
        # Save chat in DB
        chats_collection.insert_one({
            "user_id": user["_id"],
            "pdf_id": pdf_id,
            "question": req.message,
            "answer": answer
        })
        
        return {
            "success": True,
            "response": answer
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.get("/history/{pdf_id}")
async def get_chat_history(pdf_id: str, user=Depends(get_current_user)):
    """Get chat history for a specific PDF"""
    try:
        pdf_obj_id = ObjectId(pdf_id)
        chats = list(chats_collection.find({
            "user_id": user["_id"],
            "pdf_id": pdf_obj_id
        }).sort("_id", -1).limit(50))
        
        # Convert ObjectId to string
        for chat in chats:
            chat["_id"] = str(chat["_id"])
            chat["user_id"] = str(chat["user_id"])
            chat["pdf_id"] = str(chat["pdf_id"])
        
        return {
            "success": True,
            "chats": chats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")