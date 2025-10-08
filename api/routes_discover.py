from fastapi import APIRouter, Query, HTTPException
import os, json, math, geocoder, numpy as np
from api.global_store import vector_store as vs

router = APIRouter()

# ---------- Utilities ----------

def haversine(lat1, lon1, lat2, lon2):
    """Distance between two lat/lng points in kilometers."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# ---------- Local Discovery ----------

@router.get("/")
def discover_local(radius_km: float = Query(50.0)):
    """Basic discovery by physical proximity."""
    geo = geocoder.ip("me")
    user_lat, user_lng = geo.lat, geo.lng
    base_path = "data/context_meta"
    if not os.path.exists(base_path):
        return {"error": "No context metadata available yet."}

    nearby = []
    for file in os.listdir(base_path):
        if not file.endswith(".json"):
            continue
        with open(os.path.join(base_path, file), "r") as f:
            data = json.load(f)
        lat, lng = data.get("lat"), data.get("lng")
        if lat is None or lng is None:
            continue
        distance = haversine(user_lat, user_lng, lat, lng)
        if distance <= radius_km:
            nearby.append({
                "track_id": file.replace(".json", ""),
                "city": data.get("city"),
                "distance_km": round(distance, 2),
                "context_vector": data.get("vector"),
                "time": data.get("time")
            })
    nearby.sort(key=lambda x: x["distance_km"])
    return {"location": {"lat": user_lat, "lng": user_lng, "radius_km": radius_km},
            "count": len(nearby),
            "results": nearby}

# ---------- Ranked Local Discovery ----------

@router.get("/ranked")
def discover_ranked(radius_km: float = Query(100.0),
                    mood: str = Query(None)):
    """
    Rank local tracks by a composite AI score:
      distance + audio similarity + context match + genre/mood relevance
    """
    try:
        geo = geocoder.ip("me")
        user_lat, user_lng = geo.lat, geo.lng

        # user context vector (simulate from mood)
        user_context = np.array([0.5, 0.2, 0.7], dtype=np.float32)
        base_meta = "data/context_meta"
        base_artist = "data/artists"

        if not os.path.exists(base_meta):
            return {"error": "No tracks in database."}

        ranked = []

        for file in os.listdir(base_meta):
            if not file.endswith(".json"):
                continue
            with open(os.path.join(base_meta, file), "r") as f:
                data = json.load(f)

            lat, lng = data.get("lat"), data.get("lng")
            if lat is None or lng is None:
                continue

            distance = haversine(user_lat, user_lng, lat, lng)
            if distance > radius_km:
                continue

            # load artist metadata if available
            artist_meta_path = os.path.join(base_artist, file)
            artist_info = {}
            if os.path.exists(artist_meta_path):
                with open(artist_meta_path, "r") as f:
                    artist_info = json.load(f)

            # compute context similarity
            track_vec = np.array(data.get("vector", [0.5, 0.5, 0.5]), dtype=np.float32)
            ctx_sim = float(np.dot(user_context, track_vec) /
                            (np.linalg.norm(user_context) * np.linalg.norm(track_vec)))

            # mock audio similarity (if same track exists in FAISS)
            if file.replace(".json", "") in vs.vectors:
                audio_sim = 0.5  # placeholder: 0.0–1.0 range
            else:
                audio_sim = 0.3

            # normalize distance (closer = higher score)
            distance_factor = max(0.0, 1 - (distance / radius_km))

            # composite score
            score = (audio_sim * 0.4) + (ctx_sim * 0.4) + (distance_factor * 0.2)

            ranked.append({
                "track_id": file.replace(".json", ""),
                "artist": artist_info.get("artist_name", "Unknown"),
                "city": data.get("city"),
                "distance_km": round(distance, 2),
                "context_similarity": round(ctx_sim, 3),
                "score": round(score, 3)
            })

        ranked.sort(key=lambda x: x["score"], reverse=True)
        return {
            "location": {"lat": user_lat, "lng": user_lng, "radius_km": radius_km},
            "count": len(ranked),
            "results": ranked[:10]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Trending Discovery (TrendFlow AI) ----------

from datetime import datetime

@router.get("/trending")
def trending_local(radius_km: float = 100.0):
    """
    Predict and rank trending local tracks.
    Uses time-decay scoring on plays + recommendations + recency.
    """
    try:
        geo = geocoder.ip("me")
        user_lat, user_lng = geo.lat, geo.lng
        base_meta = "data/context_meta"
        base_artist = "data/artists"

        if not os.path.exists(base_artist) or not os.path.exists(base_meta):
            return {"error": "No artist or context data available."}

        results = []
        for file in os.listdir(base_artist):
            if not file.endswith(".json"):
                continue
            artist_path = os.path.join(base_artist, file)
            meta_path = os.path.join(base_meta, file)
            if not os.path.exists(meta_path):
                continue

            with open(artist_path, "r") as f:
                artist_data = json.load(f)
            with open(meta_path, "r") as f:
                ctx_data = json.load(f)

            lat, lng = ctx_data.get("lat"), ctx_data.get("lng")
            if lat is None or lng is None:
                continue

            distance = haversine(user_lat, user_lng, lat, lng)
            if distance > radius_km:
                continue

            # --- Trend score ---
            plays = artist_data.get("plays", 20)
            recs = artist_data.get("recommendations", 5)
            days = (datetime.now() - datetime.fromisoformat(ctx_data["time"])).days
            decay = math.exp(-days / 7.0)  # 7-day half-life

            trend_score = (plays * 0.6 + recs * 0.4) * decay

            results.append({
                "track": file.replace(".json", ""),
                "artist": artist_data.get("artist_name", "Unknown"),
                "city": ctx_data.get("city"),
                "trend_score": round(trend_score, 3),
                "distance_km": round(distance, 2),
                "age_days": days
            })

        results.sort(key=lambda x: x["trend_score"], reverse=True)
        return {
            "location": {"lat": user_lat, "lng": user_lng, "radius_km": radius_km},
            "count": len(results),
            "top_trending": results[:10]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from recommender.trendflow import auto_decay_and_archive

@router.post("/maintenance")
def run_trend_maintenance():
    """
    Run periodic trend decay and archival cleanup.
    """
    result = auto_decay_and_archive(threshold=0.3)
    return {"status": "maintenance complete", "result": result}

