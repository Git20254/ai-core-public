from fastapi import FastAPI
from api.routes_recommend import router as recommend_router
from api.routes_embed import router as embed_router
from api.routes_discover import router as discover_router
from api.routes_artist import router as artist_router
from recommender.trendflow import auto_decay_and_archive
import os, time, atexit
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI(title="AI Core Service", version="0.3")

# Include routers
app.include_router(recommend_router, prefix="/recommend", tags=["recommendations"])
app.include_router(embed_router, prefix="/embed", tags=["embedding"])
app.include_router(discover_router, prefix="/discover", tags=["local-discovery"])
app.include_router(artist_router, prefix="/artist", tags=["artist-upload"])

@app.get("/")
def root():
    return {"status": "ok", "service": "ai-core"}

@app.get("/health")
def health():
    try:
        return {"status": "ok", "uptime_check": True}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# --------- 🧠 Dynamic Maintenance Scheduler ---------
scheduler = BackgroundScheduler()

def get_activity_level():
    base_artist = "data/artists"
    if not os.path.exists(base_artist):
        return "low"

    uploads = 0
    for file in os.listdir(base_artist):
        path = os.path.join(base_artist, file)
        if os.path.isfile(path) and (time.time() - os.path.getmtime(path) < 86400):
            uploads += 1

    if uploads > 10:
        return "high"
    elif uploads >= 1:
        return "medium"
    return "low"


def adaptive_interval():
    level = get_activity_level()
    return {"high": 6, "medium": 12}.get(level, 48)


def scheduled_maintenance():
    result = auto_decay_and_archive(threshold=0.3)
    level = get_activity_level()
    interval = adaptive_interval()
    print(f"🧠 [TrendFlow] Maintenance run complete: {result}")
    print(f"📈 Activity: {level.upper()} — Next run in {interval} hours")

    # Reset scheduler dynamically
    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)
    scheduler.add_job(scheduled_maintenance, "interval", hours=interval)


# --- Startup and shutdown hooks ---
print(f"🧭 System boot: Activity level = {get_activity_level().upper()}")
print(f"🕒 Initial maintenance interval = {adaptive_interval()} hours")

if not scheduler.running:
    scheduler.add_job(scheduled_maintenance, "interval", hours=24)
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())

print("🚀 AI Core Service initialized and running on port 8080")

