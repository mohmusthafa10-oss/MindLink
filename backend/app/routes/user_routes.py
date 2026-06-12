from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, Mood, Chat
from ..extensions import db
from datetime import datetime, timedelta

user_bp = Blueprint('user', __name__)

def relative_time(dt):
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 365:
        return f"{diff.days // 365} years ago"
    if diff.days > 30:
        return f"{diff.days // 30} months ago"
    if diff.days > 0:
        return f"{diff.days} days ago"
    if diff.seconds > 3600:
        return f"{diff.seconds // 3600} hours ago"
    if diff.seconds > 60:
        return f"{diff.seconds // 60} minutes ago"
    return "Just now"

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Total Sessions (Chat count)
    total_sessions = Chat.query.filter_by(user_id=user.id).count()

    # Mood Trend
    # Fetch last 5 moods
    moods = Mood.query.filter_by(user_id=user.id).order_by(Mood.created_at.desc()).limit(5).all()
    mood_trend = "Stable"
    
    MOOD_MAPPING = {
        "happy": 9, "excited": 9, "great": 9,
        "good": 8, "calm": 8, "relaxed": 8,
        "neutral": 6, "okay": 6, "fine": 6,
        "anxious": 4, "nervous": 4, "tired": 4,
        "sad": 3, "bad": 3, "down": 3,
        "angry": 2, "frustrated": 2,
        "depressed": 1, "miserable": 1
    }

    # Reverse mapping for legacy data (Number -> Word)
    NUMBER_TO_MOOD = {
        "9": "Happy", "10": "Happy",
        "8": "Calm", "7": "Calm",
        "6": "Neutral", "5": "Neutral",
        "4": "Anxious",
        "3": "Sad",
        "2": "Angry",
        "1": "Depressed"
    }

    # Instead of trend, we now show latest mood
    if moods:
        raw_mood = moods[0].mood
        # Check if it's a number (legacy data)
        if raw_mood.isdigit():
             mood_trend = NUMBER_TO_MOOD.get(raw_mood, "Neutral")
        else:
             mood_trend = raw_mood.capitalize()
    else:
        mood_trend = "No Data"

    # Recent Activity
    recent_chats = Chat.query.filter_by(user_id=user.id).order_by(Chat.created_at.desc()).limit(5).all()
    recent_moods = Mood.query.filter_by(user_id=user.id).order_by(Mood.created_at.desc()).limit(5).all()

    activity = []
    
    for chat in recent_chats:
        # Truncate message
        msg_preview = chat.user_message[:40] + "..." if len(chat.user_message) > 40 else chat.user_message
        activity.append({
            "id": f"chat-{chat.id}",
            "text": f"Conversation: \"{msg_preview}\"",
            "time_obj": chat.created_at,
            "type": "chat"
        })
        
    for mood in recent_moods:
        display_mood = mood.mood
        if display_mood.isdigit():
             display_mood = NUMBER_TO_MOOD.get(display_mood, "Neutral")
        else:
             display_mood = display_mood.capitalize()

        activity.append({
            "id": f"mood-{mood.id}",
            "text": f"Mood Check-in: {display_mood}",
            "time_obj": mood.created_at,
            "type": "mood"
        })

    # Sort by time desc
    activity.sort(key=lambda x: x['time_obj'], reverse=True)
    activity = activity[:5] # Take top 5

    # Format output
    final_activity = []
    for item in activity:
        final_activity.append({
            "id": item['id'],
            "text": item['text'],
            "time": relative_time(item['time_obj']),
            "type": item['type']
        })

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "name": user.username,
        "totalSessions": total_sessions,
        "moodTrend": mood_trend,
        "activity": final_activity
    })
