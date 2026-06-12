from app.extensions import db
from datetime import datetime

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False) # Article, Exercise, Technique, Tip, Helpline
    content = db.Column(db.Text, nullable=False) # URL, Markdown text, or Phone Number
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "content": self.content,
            "description": self.description,
            "created_at": self.created_at.isoformat()
        }
