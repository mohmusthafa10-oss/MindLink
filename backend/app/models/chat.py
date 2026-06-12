from app.extensions import db
from datetime import datetime

class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)

    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    image_data = db.Column(db.Text, nullable=True)  # base64 image from user

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, nullable=True) # Linked to ChatSession.id
