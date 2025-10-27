from fastapi import APIRouter, Query
from ai_service.recommender import recommend_for_user, mood_to_vector, track_counts, user_streams

router = APIRouter()

@router.get("/")
def recommend(user_id: str = "demo", mood: str = Query(None)):
    """
    Return AI-generated hybrid recommendations using the internal recommender system.
    Integrates mood-based personalization and usage analytics.
    """
    # Check if we have any tracks at all
    if not track_counts:
        return {"error": "No tracks available yet. Embed or stream some songs first."}

    # Optional: generate a mood vector
    mood_vec = mood_to_vector(mood) if mood else None

    # Get recommendations from the recommender engine
    recs = recommend_for_user(user_id, mood_vector=mood_vec)

    # Summarize system state
    total_users = len(user_streams)
    total_tracks = len(track_counts)

    return {
        "user_id": user_id,
        "mood": mood or "neutral",
        "recommendations": recs,
        "analytics": {
            "total_users": total_users,
            "total_tracks": total_tracks,
        },
    }

