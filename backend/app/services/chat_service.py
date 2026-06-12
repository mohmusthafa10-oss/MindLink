from app.models.chat import Chat
from app.models.mood import Mood
from app.extensions import db
from .ai_service import generate_ai_response
from .crisis_service import detect_crisis

from app.models.chat_session import ChatSession
from datetime import datetime

def process_message(user_id, message, mode="companion", session_id=None, image_data=None):
    # Ensure session exists or create one
    if session_id:
        session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
        if not session:
            # Fallback if invalid ID provided
            session = ChatSession(user_id=user_id, title=message[:30]+"...")
            db.session.add(session)
    else:
        # Create new session if none provided
        session = ChatSession(user_id=user_id, title=message[:30]+"...")
        db.session.add(session)
    
    # Commit session creation so we have an ID
    db.session.commit()
    session_id = session.id # Update local variable

    # 1. Check for crisis
    if detect_crisis(message):
        from .crisis_service import get_crisis_response, log_crisis_alert
        log_crisis_alert(user_id, message)
        response_text = get_crisis_response(user_id, message)
        chat_entry = Chat(user_id=user_id, user_message=message, ai_response=response_text, session_id=session_id, image_data=image_data)
        db.session.add(chat_entry)
        db.session.commit()
        return {"response": response_text, "crisis": True, "session_id": session_id}

    # 2. Generate AI Response & Mood
    # 2. Generate AI Response & Mood
    
    # Fetch History (Last 10 messages)
    history_records = Chat.query.filter_by(session_id=session_id).order_by(Chat.created_at.desc()).limit(10).all()
    # Reverse to chronological order
    history_records.reverse()
    
    gemini_history = []
    for record in history_records:
        u_msg = record.user_message if record.user_message else "..."
        a_msg = record.ai_response if record.ai_response else "..."
        
        gemini_history.append({"role": "user", "parts": [u_msg]})
        gemini_history.append({"role": "model", "parts": [a_msg]})
    
    response_text, mood_score = generate_ai_response(message, mode, history=gemini_history, image_data=image_data)

    # 3. Save Chat
    chat_entry = Chat(user_id=user_id, user_message=message, ai_response=response_text, session_id=session_id, image_data=image_data)
    db.session.add(chat_entry)

    # 4. Save Mood
    mood_entry = Mood(user_id=user_id, mood=str(mood_score))
    db.session.add(mood_entry)

    # 5. Update Time Spent
    from app.models.user import User
    user = User.query.get(user_id)
    if user:
        if not user.time_spent: user.time_spent = 0
        user.time_spent += 5
        
    # 6. Update Session Timestamp
    session.updated_at = datetime.utcnow()

    db.session.commit()

    return {"response": response_text, "crisis": False, "session_id": session_id}
