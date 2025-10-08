import redis
import json
from collections import defaultdict

# Connect to Redis
r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# In-memory analytics
user_streams = defaultdict(list)   # userId → [trackIds]
track_counts = defaultdict(int)    # trackId → count

print("✅ AI Service is listening for events...")

pubsub = r.pubsub()
pubsub.subscribe("stream.recorded")

def recommend_for_user(user_id):
    """Suggest tracks the user hasn't listened to yet, based on popularity."""
    all_tracks_sorted = sorted(track_counts.items(), key=lambda x: x[1], reverse=True)
    listened = set(user_streams[user_id])
    suggestions = [tid for tid, _ in all_tracks_sorted if tid not in listened]
    return suggestions[:3]  # top 3 not yet played

for message in pubsub.listen():
    if message["type"] == "message":
        event = json.loads(message["data"])
        user_id = event["userId"]
        track_id = event["trackId"]

        # Update in-memory stats
        user_streams[user_id].append(track_id)
        track_counts[track_id] += 1

        print(f"\n🎶 AI received event: {event}")
        print(f"📊 Track {track_id} now has {track_counts[track_id]} plays.")
        print(f"👤 User {user_id} has listened to {len(user_streams[user_id])} tracks.")

        recs = recommend_for_user(user_id)
        if recs:
            print(f"✨ Recommended for {user_id}: {recs}")
        else:
            print(f"✨ No new recommendations for {user_id} yet.")

