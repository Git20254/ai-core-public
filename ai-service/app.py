# app.py
from flask import Flask, jsonify
from storage import get_events

app = Flask(__name__)

@app.route("/ai/events")
def all_events():
    """Return all collected events for debugging."""
    return jsonify(get_events())

@app.route("/ai/insights")
def insights():
    """Placeholder AI insights endpoint."""
    return jsonify({
        "message": "AI will generate recommendations and advice here"
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
