from app.extensions import db
from datetime import datetime

class CrisisAlert(db.Model):
    __tablename__ = 'crisis_alert'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    message_snippet = db.Column(db.String(200), nullable=True)
    triggered_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_reviewed = db.Column(db.Boolean, default=False)  # matches existing DB column

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message_snippet": self.message_snippet,
            "triggered_at": self.triggered_at.strftime("%Y-%m-%d %H:%M") if self.triggered_at else "Unknown",
            "resolved": self.is_reviewed  # expose as 'resolved' to frontend
        }
