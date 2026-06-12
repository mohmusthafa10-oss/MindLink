from app.extensions import db
from datetime import datetime

class Mood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(10))
    user_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
