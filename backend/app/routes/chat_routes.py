from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/message", methods=["POST"])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.get_json()
    message = data.get("message")
    mode = data.get("mode", "companion")
    if not message:
        return jsonify({"error": "Message is required"}), 400

    session_id = data.get("session_id")
    image_data = data.get("image") # Expecting Base64 string

    try:
        from app.services.chat_service import process_message
        result = process_message(user_id, message, mode, session_id, image_data)
        
        return jsonify({
            "message": message,
            "reply": result["response"], 
            "crisis": result["crisis"],
            "session_id": result.get("session_id")
        })
    except Exception as e:
        print(f"Chat Route Error: {e}")
        return jsonify({
            "message": message,
            "reply": "I'm having a brief connection issue, but I'm still here. Please try again.",
            "crisis": False
        }), 200 # Return 200 so frontend doesn't show "Error connecting"
