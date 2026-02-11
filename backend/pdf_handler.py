from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models import ChatRequest
from utils import get_current_user
from db import pdfs_collection
from rag import generate_embeddings
import os
import shutil
from pathlib import Path
from bson import ObjectId

router = APIRouter()
MAX_SIZE = 10 * 1024 * 1024  # 10MB
UPLOAD_DIR = "uploaded_pdfs"

# Create upload directory if it doesn't exist
Path(UPLOAD_DIR).mkdir(exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), user=Depends(get_current_user)):
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # Check file size
    file_size = 0
    temp_file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # Save uploaded file temporarily
        with open(temp_file_path, "wb") as buffer:
            contents = await file.read()
            file_size = len(contents)
            
            if file_size > MAX_SIZE:
                os.remove(temp_file_path)
                raise HTTPException(status_code=400, detail="PDF too large (max 10MB)")
            
            buffer.write(contents)
        
        # Create PDF document in database
        pdf_doc = {
            "user_id": user["_id"],  # Store as ObjectId, not string
            "filename": file.filename,
            "file_path": temp_file_path,
            "file_size": file_size,
            "total_pages": 0
        }
        result = pdfs_collection.insert_one(pdf_doc)
        pdf_id = result.inserted_id
        
        print(f"PDF inserted with ID: {pdf_id}")
        
        # Generate embeddings asynchronously (optional: use background tasks)
        try:
            generate_embeddings(temp_file_path, pdf_id)
            print(f"Embeddings generated for PDF: {pdf_id}")
        except Exception as e:
            # Log the error but don't fail the upload
            print(f"Error generating embeddings: {str(e)}")
        
        return {
            "success": True,
            "pdf_id": str(pdf_id),
            "filename": file.filename,
            "file_size": file_size
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        print(f"Error uploading PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@router.get("/list")
async def list_pdfs(user=Depends(get_current_user)):
    """Get all PDFs uploaded by the current user"""
    try:
        # Query using ObjectId, not string
        pdfs = list(pdfs_collection.find({"user_id": user["_id"]}))
        # Convert ObjectId to string for JSON serialization
        for pdf in pdfs:
            pdf["_id"] = str(pdf["_id"])
            pdf["user_id"] = str(pdf["user_id"])
        return {"success": True, "pdfs": pdfs}
    except Exception as e:
        print(f"Error listing PDFs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing PDFs: {str(e)}")

@router.delete("/delete/{pdf_id}")
async def delete_pdf(pdf_id: str, user=Depends(get_current_user)):
    """Delete a PDF and its associated data"""
    try:
        pdf = pdfs_collection.find_one({"_id": ObjectId(pdf_id), "user_id": user["_id"]})
        
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Delete file from disk
        if os.path.exists(pdf["file_path"]):
            os.remove(pdf["file_path"])
        
        # Delete from database
        pdfs_collection.delete_one({"_id": ObjectId(pdf_id)})
        
        print(f"PDF deleted: {pdf_id}")
        
        return {"success": True, "message": "PDF deleted successfully"}
    except Exception as e:
        print(f"Error deleting PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting PDF: {str(e)}")