# api/routes_recommend.py
# ------------------------------------------------------------
# 🔹 AI Core Music Recommender (Dimension-Safe Version)
# ------------------------------------------------------------

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import numpy as np

from api.global_store import vector_store
from ai_service.recommender import mood_to_vector, track_counts, user_streams

router = APIRouter()


# ------------------------------------------------------------
# 🔹 Utility Functions
# ------------------------------------------------------------
def safe_normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    if norm == 0 or np.isnan(norm):
        return np.zeros_like(vec)
    return vec / norm


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    a_norm = safe_normalize(a)
    b_norm = safe_normalize(b)
    return float(np.dot(a_norm, b_norm))


def resize_context_vector(context_vec: np.ndarray, target_dim: int) -> np.ndarray:
    """
    Safely resizes or pads a context (mood) vector to match the embedding dimension.
    """
    ctx_dim = context_vec.shape[0]
    if ctx_dim == target_dim:
        return context_vec
    elif ctx_dim > target_dim:
        # Truncate if mood vector is larger (unlikely)
        return context_vec[:target_dim]
    else:
        # Pad with zeros if smaller
        padded = np.zeros(target_dim, dtype=np.float32)
        padded[:ctx_dim] = context_vec
        return padded


def weighted_fusion(user_vec: np.ndarray, context_vec: Optional[np.ndarray], weight: float = 0.25) -> np.ndarray:
    if context_vec is None:
        return user_vec
    # Ensure same dimension
    context_vec = resize_context_vector(context_vec, len(user_vec))
    return safe_normalize((1 - weight) * user_vec + weight * context_vec)


# ------------------------------------------------------------
# 🔹 Main Recommendation Endpoint
# ------------------------------------------------------------
@router.get("/")
def recommend(
    user_id: str = "demo",
    mood: Optional[str] = Query(None, description="Optional mood for context vector"),
    top_n: int = Query(5, gt=0, le=50, description="Number of recommendations to return")
):
    """
    Returns AI-generated hybrid recommendations using stored embeddings
    and optional mood/context personalization.
    """

    # --- Check vector availability ---
    if len(vector_store) == 0:
        return {"error": "No tracks available yet. Embed or stream some songs first."}

    # --- Build user's mean embedding ---
    user_vec = vector_store.get_user_vector(user_id)
    if user_vec is None or np.all(user_vec == 0):
        raise HTTPException(status_code=400, detail="No valid user embedding available.")

    # --- Optional mood vector fusion ---
    mood_vec = mood_to_vector(mood) if mood else None
    context_vec = np.array(mood_vec, dtype=np.float32) if mood_vec is not None else None
    fused_user_vec = weighted_fusion(user_vec, context_vec, weight=0.25)

    # --- Compute cosine similarity for each stored track ---
    results = []
    for track_id, track_vec in vector_store.vectors.items():
        try:
            sim = cosine_similarity(fused_user_vec, track_vec)
            meta = vector_store.metadata.get(track_id, {})
            results.append({
                "track_id": track_id,
                "artist": meta.get("artist", "Unknown Artist"),
                "similarity": round(sim, 6),
            })
        except Exception as e:
            print(f"⚠️ Skipping track {track_id}: {e}")
            continue

    if not results:
        raise HTTPException(status_code=404, detail="No valid track embeddings found.")

    # --- Sort & return top N ---
    results.sort(key=lambda x: x["similarity"], reverse=True)
    top_results = results[:top_n]

    # --- System Analytics ---
    total_users = len(user_streams)
    total_tracks = len(track_counts) if track_counts else len(vector_store)

    return {
        "user_id": user_id,
        "mood": mood or "neutral",
        "recommendations": top_results,
        "analytics": {
            "total_users": total_users,
            "total_tracks": total_tracks,
        },
    }

