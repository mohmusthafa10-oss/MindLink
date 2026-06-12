from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.chat_session import ChatSession
from app.models.chat import Chat
from app.extensions import db

session_bp = Blueprint("session", __name__)

@session_bp.route("/", methods=["GET"])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    sessions = ChatSession.query.filter_by(user_id=user_id).order_by(ChatSession.updated_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@session_bp.route("/", methods=["POST"])
@jwt_required()
def create_session():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    title = data.get("title", "New Chat")
    
    new_session = ChatSession(user_id=user_id, title=title)
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify(new_session.to_dict()), 201

@session_bp.route("/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    
    if not session:
        return jsonify({"error": "Session not found"}), 404
        
    # Optional: Delete associated chats (or rely on foreign key cascade if configured)
    Chat.query.filter_by(session_id=session_id).delete()
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Session deleted"}), 200

@session_bp.route("/<int:session_id>/messages", methods=["GET"])
@jwt_required()
def get_session_messages(session_id):
    user_id = get_jwt_identity()
    # verify ownership
    session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404
        
    chats = Chat.query.filter_by(session_id=session_id).order_by(Chat.created_at.asc()).all()
    
    messages = []
    for c in chats:
        messages.append({"text": c.user_message, "sender": "user", "image": c.image_data})
        messages.append({"text": c.ai_response, "sender": "bot"})
        
    return jsonify(messages), 200
