from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from embeddings.audio_embedder import AudioEmbedder
from api.global_store import vector_store as vs
from recommender.persistence import save_index
from ai_context.context_engine import ContextEngine
import tempfile, shutil, os, json, datetime, geocoder, numpy as np

router = APIRouter()
ae = AudioEmbedder()

@router.post("/upload")
async def upload_artist_track(
    file: UploadFile = File(...),
    artist_name: str = Form(...),
    genre: str = Form(None),
    mood: str = Form(None),
    city: str = Form(None)
):
    """
    Artists upload their track + metadata.
    System embeds it and saves a geo/context fingerprint.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        vec = ae.embed(tmp_path)
        track_id = file.filename
        vs.add_track(track_id, vec)
        save_index(vs)

        # geo / context enrichment
        geo = geocoder.ip("me")
        lat, lng = geo.lat, geo.lng
        detected_city = geo.city or city or "Unknown"
        ctx = ContextEngine(city=detected_city)
        context_vec = ctx.build_context_vector(mood)

        os.makedirs("data/artists", exist_ok=True)
        meta = {
            "artist_name": artist_name,
            "track_id": track_id,
            "genre": genre,
            "mood": mood,
            "city": detected_city,
            "lat": lat,
            "lng": lng,
            "time": datetime.datetime.now().isoformat(),
            "vector": context_vec.tolist()
        }

        with open(f"data/artists/{track_id}.json", "w") as f:
            json.dump(meta, f, indent=2)

        return {
            "status": "ok",
            "artist": artist_name,
            "track_id": track_id,
            "city": detected_city,
            "context_vector": np.round(context_vec, 3).tolist()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

