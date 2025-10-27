import os
import json
from datetime import datetime, timedelta

TREND_FILE = "data/trends.json"


def load_trends():
    if not os.path.exists(TREND_FILE):
        return {}
    with open(TREND_FILE, "r") as f:
        return json.load(f)


def save_trends(trends):
    os.makedirs("data", exist_ok=True)
    with open(TREND_FILE, "w") as f:
        json.dump(trends, f, indent=2)


def update_trend(track_id: str, boost: float = 1.1):
    trends = load_trends()
    entry = trends.get(track_id, {"score": 1.0, "last_update": str(datetime.utcnow())})
    entry["score"] *= boost
    entry["last_update"] = str(datetime.utcnow())
    trends[track_id] = entry
    save_trends(trends)
    return {"track_id": track_id, "new_score": entry["score"]}


def auto_decay_and_archive(threshold: float = 0.3):
    trends = load_trends()
    now = datetime.utcnow()
    for track_id, data in list(trends.items()):
        last_update = datetime.fromisoformat(data["last_update"])
        days_passed = (now - last_update).days
        decay = 0.98 ** days_passed
        data["score"] *= decay
        if data["score"] < threshold:
            trends.pop(track_id)
    save_trends(trends)
    return {"remaining": len(trends)}

