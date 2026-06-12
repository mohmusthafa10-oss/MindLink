from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Mood

mood_bp = Blueprint("mood", __name__)

# Add mood
@mood_bp.route("/add", methods=["POST"])
@jwt_required()
def add_mood():
    user_id = get_jwt_identity()
    data = request.get_json()
    mood_text = data.get("mood")
    if not mood_text:
        return jsonify({"error": "Mood is required"}), 400

    mood = Mood(user_id=user_id, mood=mood_text)
    db.session.add(mood)
    db.session.commit()
    return jsonify({"message": f"Mood '{mood_text}' recorded"}), 201

# Get mood history
@mood_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    moods_data = Mood.query.filter_by(user_id=user_id).order_by(Mood.created_at.asc()).all()
    
    dates = [m.created_at.strftime("%Y-%m-%d %H:%M") for m in moods_data]
    mood_values = []
    MOOD_MAPPING = {
        "happy": 9, "excited": 9,
        "good": 8, "calm": 8, "relaxed": 8,
        "neutral": 6, "okay": 6,
        "anxious": 4, "nervous": 4,
        "sad": 3, "down": 3,
        "angry": 2,
        "depressed": 1
    }

    for m in moods_data:
        try:
            mood_values.append(int(m.mood))
        except (ValueError, TypeError):
             # If mood is text like "Happy", map or ignore? using 5 or 0.
            val = MOOD_MAPPING.get(m.mood.lower(), 5)
            mood_values.append(val) 
            
    return jsonify({"dates": dates, "moods": mood_values})

