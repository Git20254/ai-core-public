import os
import json
import numpy as np

INDEX_PATH = "data/vector_index.json"


def save_index(vectors: dict):
    """
    Save vector embeddings to disk in JSON format.
    """
    os.makedirs("data", exist_ok=True)
    serializable = {k: v.tolist() for k, v in vectors.items()}
    with open(INDEX_PATH, "w") as f:
        json.dump(serializable, f)
    print(f"💾 Saved {len(vectors)} vectors to {INDEX_PATH}")


def load_index() -> dict:
    """
    Load vector embeddings from disk (if available).
    """
    if not os.path.exists(INDEX_PATH):
        return {}
    with open(INDEX_PATH, "r") as f:
        data = json.load(f)
    print(f"📂 Loaded {len(data)} vectors from {INDEX_PATH}")
    return {k: np.array(v) for k, v in data.items()}

