from ai_context.context_engine import ContextEngine
import datetime
import geocoder
import os
import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from embeddings.audio_embedder import AudioEmbedder
from api.global_store import vector_store as vs
import numpy as np
import tempfile
import shutil
from recommender.persistence import save_index

router = APIRouter()
ae = AudioEmbedder()

@router.post("/")
async def embed_track(file: UploadFile = File(...)):
    """
    Receive an audio file, create its embedding,
    add it to the FAISS vector index, and store contextual metadata.
    """
    try:
        # Save upload to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Generate embedding
        vec = ae.embed(tmp_path)

        # --- Context fingerprint for this track ---
        ctx = ContextEngine(city="London")  # (can make dynamic later)
        context_vector = ctx.build_context_vector()

        # Approximate geolocation from IP (can replace with GPS later)
        geo = geocoder.ip("me")

        geo_context = {
            "city": geo.city,
            "lat": geo.lat,
            "lng": geo.lng,
            "time": datetime.datetime.now().isoformat(),
            "vector": context_vector.tolist()
        }

        # Store in vector index
        track_id = file.filename
        vs.add_track(track_id, vec)
        save_index(vs)

        # Save context fingerprint metadata
        os.makedirs("data/context_meta", exist_ok=True)
        with open(f"data/context_meta/{track_id}.json", "w") as f:
            json.dump(geo_context, f, indent=2)

        return {
            "track_id": track_id,
            "vector_length": int(len(vec)),
            "sample": np.round(vec[:5], 5).tolist(),
            "total_tracks": len(vs.vectors),
            "context": geo_context
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

