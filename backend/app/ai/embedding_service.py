import voyageai
import pdfplumber 
import io 
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.document import Document, DocumentChunk

vo = voyageai.Client(api_key=settings.VOYAGE_API_KEY)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    
    return text.strip()


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
        
    return chunks

def get_embedding(text: str) -> list[float]: 
    result = vo.embed([text], model="voyage-3")
    return result.embeddings[0]

def process_and_store_document(
    file_bytes: bytes,
    filename: str,
    db: Session
) -> dict: 
    text = extract_text_from_pdf(file_bytes)
    if not text:
        raise ValueError("Could not extract text from the PDF")
    
    #Store the document extracted
    doc = Document(filename=filename, content=text)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    #Chunk text 
    chunks = chunk_text(text)
    
    #Store chunks with embeddings
    
    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        chunk_record = DocumentChunk(
            document_id = doc.id,
            chunk_text = chunk,
            embedding = embedding,
            chunk_index = i
        )
        db.add(chunk_record)
    
    db.commit()
    return {"document_id": doc.id, "chunks": len(chunks)}
    