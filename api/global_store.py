import numpy as np
import redis
import json
from typing import Dict, Any, List, Optional

class VectorStore:
    """
    Unified in-memory + optional Redis vector store for embeddings.
    Used by /embed and /recommend routes.
    """

    def __init__(self, use_redis: bool = True):
        self.vectors: Dict[str, np.ndarray] = {}
        self.metadata: Dict[str, Dict[str, Any]] = {}
        self.use_redis = use_redis

        if use_redis:
            try:
                self.redis = redis.Redis(
                    host="localhost", port=6379, db=0, decode_responses=True
                )
                self.redis.ping()
                print("🧠 Connected to Redis for vector persistence.")
            except Exception as e:
                print(f"⚠️ Redis unavailable, using in-memory store: {e}")
                self.redis = None
                self.use_redis = False

    # ────────────────────────────────────────────────
    # 🔹 Add and persist vector
    # ────────────────────────────────────────────────
    def add_vector(self, track_id: str, vector: np.ndarray, metadata: Optional[Dict[str, Any]] = None):
        """Add or update a track embedding and optional metadata."""
        self.vectors[track_id] = vector
        self.metadata[track_id] = metadata or {}

        if self.use_redis and self.redis:
            try:
                self.redis.hset("vectors", track_id, json.dumps(vector.tolist()))
                self.redis.hset("metadata", track_id, json.dumps(metadata or {}))
            except Exception as e:
                print(f"⚠️ Redis write failed: {e}")

    # 🔹 Backward-compatible alias
    def add_track(self, track_id: str, vector: np.ndarray, metadata: Optional[Dict[str, Any]] = None):
        """Alias for add_vector() to support older routes."""
        return self.add_vector(track_id, vector, metadata)

    # ────────────────────────────────────────────────
    # 🔹 Retrieve vector
    # ────────────────────────────────────────────────
    def get_vector(self, track_id: str) -> Optional[np.ndarray]:
        if track_id in self.vectors:
            return self.vectors[track_id]

        if self.use_redis and self.redis:
            data = self.redis.hget("vectors", track_id)
            if data:
                vec = np.array(json.loads(data))
                self.vectors[track_id] = vec
                return vec
        return None

    # ────────────────────────────────────────────────
    # 🔹 Build a user’s mean embedding
    # ────────────────────────────────────────────────
    def get_user_vector(self, user_id: str) -> np.ndarray:
        if not self.vectors:
            return np.zeros(128)
        arr = np.stack(list(self.vectors.values()))
        return arr.mean(axis=0)

    # ────────────────────────────────────────────────
    # 🔹 Load from Redis (cold start recovery)
    # ────────────────────────────────────────────────
    def load_from_redis(self):
        if not (self.use_redis and self.redis):
            return
        try:
            all_vectors = self.redis.hgetall("vectors")
            all_metadata = self.redis.hgetall("metadata")

            for k, v in all_vectors.items():
                self.vectors[k] = np.array(json.loads(v))
                self.metadata[k] = json.loads(all_metadata.get(k, "{}"))
            print(f"🔁 Synced {len(self.vectors)} vectors from Redis.")
        except Exception as e:
            print(f"⚠️ Redis load failed: {e}")

    # ────────────────────────────────────────────────
    # 🔹 Dict-like iteration support (fix legacy loops)
    # ────────────────────────────────────────────────
    def items(self):
        """Mimic dict.items() for recommender compatibility."""
        return self.vectors.items()

    def __len__(self):
        return len(self.vectors)

    def __iter__(self):
        return iter(self.vectors)


# ────────────────────────────────────────────────
# Instantiate shared store
# ────────────────────────────────────────────────
vector_store = VectorStore()
vector_store.load_from_redis()

