import datetime
import os
import json
import tempfile
import shutil
import geocoder
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException
from embeddings.audio_embedder import AudioEmbedder
from api.global_store import vector_store as vs
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
        # --- Save upload to a temporary file ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # --- Generate embedding ---
        vec = ae.embed(tmp_path)
        if vec is None or not len(vec):
            raise HTTPException(status_code=400, detail="Embedding failed")

        # --- Contextual metadata ---
        geo = geocoder.ip("me")
        geo_context = {
            "city": geo.city,
            "country": geo.country,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "source": "upload",
        }

        # --- Store in vector memory store ---
        track_id = os.path.basename(tmp_path)
        vs.add_vector(track_id, vec, metadata=geo_context)

        # --- Save persistent FAISS index ---
        save_index(vs.vectors)

        return {
            "status": "success",
            "track_id": track_id,
            "embedding_dim": len(vec),
            "context": geo_context,
            "total_vectors": len(vs.vectors),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

