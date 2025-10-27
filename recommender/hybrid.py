import numpy as np
from typing import Dict, Any, List

class HybridRecommender:
    """
    Combines content-based (vector) and contextual recommendation strategies.
    """

    def __init__(self, vector_store):
        self.vs = vector_store

    def recommend(self, user_vec: np.ndarray, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.vs.vectors:
            return [{"error": "No tracks available yet. Embed or stream some songs first."}]

        results = []
        for track_id, vec in self.vs.vectors.items():
            sim = self.cosine_similarity(user_vec, vec)
            mood_bonus = self.mood_factor(context.get("mood"))
            final_score = sim * mood_bonus
            results.append({"track_id": track_id, "score": float(final_score)})

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:10]

    @staticmethod
    def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
            return 0.0
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    @staticmethod
    def mood_factor(mood: str) -> float:
        mood_map = {
            "happy": 1.2,
            "energetic": 1.15,
            "chill": 1.1,
            "sad": 0.9,
            "focus": 1.05,
        }
        return mood_map.get(mood, 1.0)

