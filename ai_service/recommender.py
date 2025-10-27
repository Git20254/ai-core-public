import math
import numpy as np
import redis
import json
from collections import defaultdict
from typing import List, Dict, Any, Optional

# ────────────────────────────────────────────────
# 🎯 Redis Connection (shared cache)
# ────────────────────────────────────────────────
try:
    r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
except Exception as e:
    print(f"⚠️ Redis not available: {e}")
    r = None

# ────────────────────────────────────────────────
# 📊 In-memory analytics fallback
# ────────────────────────────────────────────────
user_streams: Dict[str, list] = defaultdict(list)   # userId → [trackIds]
track_counts: Dict[str, int] = defaultdict(int)     # trackId → count
track_embeddings: Dict[str, np.ndarray] = {}        # trackId → np.array

# ────────────────────────────────────────────────
# 🧩 Vector utilities
# ────────────────────────────────────────────────
def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9
    return float(np.dot(a, b) / denom)

def weighted_score(popularity: float, similarity: float, freshness: float = 1.0) -> float:
    """Weighted hybrid score combining multiple factors."""
    return 0.6 * similarity + 0.3 * popularity + 0.1 * freshness

# ────────────────────────────────────────────────
# 🧠 Hybrid recommendation logic
# ────────────────────────────────────────────────
def recommend_for_user(user_id: str, mood_vector: Optional[np.ndarray] = None, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Generate hybrid recommendations combining user behavior and content embeddings.
    """
    listened = set(user_streams[user_id])
    all_tracks = list(track_counts.keys())

    if not all_tracks:
        return [{"error": "No tracks available yet"}]

    candidates = []
    for track_id in all_tracks:
        if track_id in listened:
            continue

        # Popularity component
        popularity = math.log1p(track_counts[track_id])

        # Similarity component
        if mood_vector is not None and track_id in track_embeddings:
            similarity = cosine_similarity(mood_vector, track_embeddings[track_id])
        else:
            similarity = 0.0

        # Placeholder freshness signal (later use time decay)
        freshness = 1.0

        score = weighted_score(popularity, similarity, freshness)
        candidates.append({
            "track_id": track_id,
            "score": round(score, 4),
            "popularity": round(popularity, 3),
            "similarity": round(similarity, 3),
        })

    ranked = sorted(candidates, key=lambda x: x["score"], reverse=True)
    return ranked[:limit]

# ────────────────────────────────────────────────
# 🎭 Mood → pseudo-vector mapping
# ────────────────────────────────────────────────
def mood_to_vector(mood: str) -> np.ndarray:
    """Map textual moods to basic 3D semantic vectors."""
    base = {
        "happy": np.array([0.9, 0.8, 0.2]),
        "sad": np.array([0.1, 0.3, 0.9]),
        "energetic": np.array([0.8, 0.9, 0.4]),
        "calm": np.array([0.3, 0.7, 0.8]),
        "dark": np.array([0.2, 0.2, 0.6]),
    }
    return base.get(mood.lower(), np.array([0.5, 0.5, 0.5]))

# ────────────────────────────────────────────────
# 🔁 Redis sync (optional)
# ────────────────────────────────────────────────
def sync_from_redis() -> None:
    """Load track counts and user data from Redis into memory."""
    if not r:
        print("⚠️ Redis unavailable — skipping sync.")
        return

    try:
        if r.exists("track_counts"):
            track_counts.update(json.loads(r.get("track_counts")))
        if r.exists("user_streams"):
            user_streams.update(json.loads(r.get("user_streams")))
        print(f"🔁 Synced {len(track_counts)} tracks and {len(user_streams)} users from Redis.")
    except Exception as e:
        print(f"⚠️ Redis sync failed: {e}")

# ────────────────────────────────────────────────
# 🚀 Initialization
# ────────────────────────────────────────────────
try:
    sync_from_redis()
except Exception as e:
    print(f"⚠️ Failed to sync from Redis: {e}")

