import sqlite3
import numpy as np
from typing import List
from app.db.database import get_db_connection

# Lazy load sentence_transformers to avoid slow startup if not used
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding(text: str):
    model = get_embedding_model()
    embedding = model.encode(text)
    return embedding.tobytes()

def save_embedding(message_id: int, text: str):
    embedding_blob = generate_embedding(text)
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO embeddings (message_id, embedding) VALUES (?, ?)",
        (message_id, embedding_blob)
    )
    conn.commit()
    conn.close()

def search_memory(agent: str, query: str, limit: int = 5):
    query_embedding = np.frombuffer(generate_embedding(query), dtype=np.float32)
    
    conn = get_db_connection()
    # Fetch all embeddings for this agent's messages
    rows = conn.execute("""
        SELECT m.content, m.role, m.ts, e.embedding 
        FROM messages m
        JOIN embeddings e ON m.id = e.message_id
        WHERE m.agent = ?
    """, (agent,)).fetchall()
    conn.close()
    
    if not rows:
        return []
    
    results = []
    for content, role, ts, emb_blob in rows:
        # Avoid self-matching or empty content
        if not content or content.strip() == query.strip():
            continue
            
        emb = np.frombuffer(emb_blob, dtype=np.float32)
        
        # Cosine similarity
        norm_emb = np.linalg.norm(emb)
        norm_query = np.linalg.norm(query_embedding)
        
        if norm_emb == 0 or norm_query == 0:
            score = 0
        else:
            score = np.dot(query_embedding, emb) / (norm_query * norm_emb)
            
        results.append({
            "content": content,
            "role": role,
            "ts": ts,
            "score": float(score)
        })
    
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]
