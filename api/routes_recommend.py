from ai_context.context_engine import ContextEngine
from fastapi import APIRouter, Query
from recommender.hybrid import HybridRecommender
from api.global_store import vector_store as vs
import numpy as np

router = APIRouter()
rec_engine = HybridRecommender(vs)

@router.get("/")
def recommend(user_id: str = "demo", mood: str = Query(None)):
    """
    Return AI-generated recommendations using stored audio embeddings.
    """
    if not vs.vectors:
        return {"error": "No tracks embedded yet. Upload songs first via /embed."}

    # For now: use the mean of all existing vectors as the 'user vector'
    u_vec = vs.get_user_vector(user_id)
    context = {"mood": mood}

    # Build dynamic context vector
    ctx = ContextEngine(city="London")
    context_vector = ctx.build_context_vector(mood)
    context["vector"] = context_vector.tolist()

    recs = rec_engine.recommend(u_vec, context)

    # --- Trend update ---
    from recommender.trendflow import update_trend

    # auto-boost the top recommended song
    if recs:
        top_track = recs[0]["track_id"]
        trend_update = update_trend(top_track, boost=1.5)
    else:
        trend_update = {"info": "no recommendations to boost"}

    return {
        "recommendations": recs,
        "trend_update": trend_update,
        "total_tracks": len(vs.vectors)
    }

