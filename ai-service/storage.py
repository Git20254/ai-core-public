# storage.py
events = []

def store_event(event):
    """Save an event in memory (later → database)."""
    events.append(event)

def get_events():
    """Return all collected events."""
    return events
