from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User
from ..models.crisis_alert import CrisisAlert

admin_bp = Blueprint("admin", __name__)


def _require_admin():
    """Returns (admin_user, error_response) tuple. If not admin, error_response is set."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return None, (jsonify({"error": "Admin access required"}), 403)
    return user, None


# ─────────────────────────────────────────────
#  USER LIST  (existing feature, preserved)
# ─────────────────────────────────────────────
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    _, err = _require_admin()
    if err:
        return err

    from app.models import ChatSession
    from datetime import datetime, date

    users = User.query.all()
    user_list = []
    active_today_count = 0
    today_start = datetime.combine(date.today(), datetime.min.time())

    for u in users:
        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "last_login": u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else "Never",
            "time_spent": u.time_spent or 0
        })
        if u.last_login and u.last_login >= today_start:
            active_today_count += 1

    total_sessions_count = ChatSession.query.count()

    return jsonify({
        "users": user_list,
        "stats": {
            "totalUsers": len(users),
            "totalSessions": total_sessions_count,
            "activeToday": active_today_count
        }
    })


# ─────────────────────────────────────────────
#  USER DETAIL
# ─────────────────────────────────────────────
@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_details(user_id):
    _, err = _require_admin()
    if err:
        return err

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    from app.models import Chat, Mood
    total_sessions = Chat.query.filter_by(user_id=target_user.id).count()
    moods = Mood.query.filter_by(user_id=target_user.id).order_by(Mood.created_at.desc()).limit(5).all()

    NUMBER_TO_MOOD = {
        "9": "Happy", "10": "Happy", "8": "Calm", "7": "Calm",
        "6": "Neutral", "5": "Neutral", "4": "Anxious",
        "3": "Sad", "2": "Angry", "1": "Depressed"
    }
    if moods:
        raw_mood = moods[0].mood
        mood_trend = NUMBER_TO_MOOD.get(raw_mood, raw_mood.capitalize()) if raw_mood.isdigit() else raw_mood.capitalize()
    else:
        mood_trend = "No Data"

    return jsonify({
        "id": target_user.id,
        "username": target_user.username,
        "email": target_user.email,
        "totalSessions": total_sessions,
        "moodTrend": mood_trend,
        "is_admin": target_user.is_admin,
        "last_login": target_user.last_login.strftime("%Y-%m-%d %H:%M") if target_user.last_login else "Never",
        "time_spent": f"{target_user.time_spent or 0} mins"
    })


# ─────────────────────────────────────────────
#  DELETE USER
# ─────────────────────────────────────────────
@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403
    if current_user_id == user_id:
        return jsonify({"error": "You cannot delete your own admin account"}), 400

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    from app.models import Chat, ChatSession, Mood, Contact
    Chat.query.filter_by(user_id=user_id).delete()
    ChatSession.query.filter_by(user_id=user_id).delete()
    Mood.query.filter_by(user_id=user_id).delete()
    CrisisAlert.query.filter_by(user_id=user_id).delete()
    Contact.query.filter_by(user_id=user_id).delete()
    db.session.delete(target_user)
    db.session.commit()

    return jsonify({"message": f"User {target_user.username} deleted successfully"}), 200


# ─────────────────────────────────────────────
#  ANALYTICS  (new)
# ─────────────────────────────────────────────
@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    _, err = _require_admin()
    if err:
        return err

    from app.models import Chat, Mood, ChatSession
    from datetime import datetime, date, timedelta
    from sqlalchemy import func

    today = date.today()

    # ── 1. User registrations over last 7 days ──
    user_growth = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end   = datetime.combine(day, datetime.max.time())
        count = User.query.filter(
            User.last_login >= day_start,
            User.last_login <= day_end
        ).count()
        user_growth.append({"date": day.strftime("%a"), "value": count})

    # ── 2. Chat sessions per day (last 7 days) ──
    sessions_per_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end   = datetime.combine(day, datetime.max.time())
        count = ChatSession.query.filter(
            ChatSession.created_at >= day_start,
            ChatSession.created_at <= day_end
        ).count()
        sessions_per_day.append({"date": day.strftime("%a"), "value": count})

    # ── 3. Mood distribution (all time) ──
    NUMBER_TO_MOOD = {
        "9": "Happy", "10": "Happy", "8": "Calm", "7": "Calm",
        "6": "Neutral", "5": "Neutral", "4": "Anxious",
        "3": "Sad", "2": "Angry", "1": "Depressed"
    }
    mood_counts = {}
    all_moods = Mood.query.all()
    for m in all_moods:
        label = NUMBER_TO_MOOD.get(m.mood, m.mood.capitalize() if m.mood else "Unknown")
        mood_counts[label] = mood_counts.get(label, 0) + 1

    mood_distribution = [{"label": k, "count": v} for k, v in mood_counts.items()]
    mood_distribution.sort(key=lambda x: x["count"], reverse=True)

    # ── 4. Crisis alerts over last 7 days ──
    crisis_per_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end   = datetime.combine(day, datetime.max.time())
        count = CrisisAlert.query.filter(
            CrisisAlert.triggered_at >= day_start,
            CrisisAlert.triggered_at <= day_end
        ).count()
        crisis_per_day.append({"date": day.strftime("%a"), "value": count})

    # ── 5. Summary numbers ──
    total_messages = Chat.query.count()
    total_crisis   = CrisisAlert.query.count()
    total_users    = User.query.count()
    total_sessions = ChatSession.query.count()

    return jsonify({
        "summary": {
            "totalUsers": total_users,
            "totalSessions": total_sessions,
            "totalMessages": total_messages,
            "totalCrisisAlerts": total_crisis
        },
        "userGrowth": user_growth,
        "sessionsPerDay": sessions_per_day,
        "moodDistribution": mood_distribution,
        "crisisPerDay": crisis_per_day
    })


# ─────────────────────────────────────────────
#  CRISIS ALERTS  (new)
# ─────────────────────────────────────────────
@admin_bp.route("/crisis-alerts", methods=["GET"])
@jwt_required()
def get_crisis_alerts():
    _, err = _require_admin()
    if err:
        return err

    alerts = CrisisAlert.query.order_by(CrisisAlert.triggered_at.desc()).limit(50).all()
    result = []
    
    # Track if we need to commit any auto-cleanups
    needs_commit = False
    
    for a in alerts:
        user = User.query.get(a.user_id)
        if not user:
            # Auto-cleanup orphaned alerts encountered
            db.session.delete(a)
            needs_commit = True
            continue
            
        item = a.to_dict()
        item["username"] = user.username
        item["email"]    = user.email
        result.append(item)

    if needs_commit:
        db.session.commit()


    unresolved_count = CrisisAlert.query.filter_by(is_reviewed=False).count()
    return jsonify({"alerts": result, "unresolvedCount": unresolved_count})


@admin_bp.route("/crisis-alerts/<int:alert_id>/resolve", methods=["PATCH"])
@jwt_required()
def resolve_crisis_alert(alert_id):
    _, err = _require_admin()
    if err:
        return err

    alert = CrisisAlert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    alert.is_reviewed = True
    db.session.commit()
    return jsonify({"message": "Alert marked as resolved"})
