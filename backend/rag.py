import pdfplumber
from sentence_transformers import SentenceTransformer
from db import embeddings_collection
from bson import ObjectId

model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embeddings(pdf_path, pdf_id):
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if not text:
                continue
            embedding = model.encode(text).tolist()
            embeddings_collection.insert_one({
                "pdf_id": pdf_id,
                "page_number": i,
                "text": text,
                "embedding": embedding
            })

def query_rag(pdf_id, query_embedding, top_k=5):
    """
    Returns top-k relevant pages
    """
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    results = embeddings_collection.find({"pdf_id": pdf_id})
    pages = []
    sims = []
    for doc in results:
        pages.append(doc["text"])
        sims.append(doc["embedding"])
    if not pages:
        return []

    sims = cosine_similarity([query_embedding], sims)[0]
    top_idx = np.argsort(sims)[::-1][:top_k]
    return [pages[i] for i in top_idx]
