from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Contact

contact_bp = Blueprint("contacts", __name__)

@contact_bp.route("/", methods=["GET"])
@jwt_required()
def get_contacts():
    current_user_id = get_jwt_identity()
    contacts = Contact.query.filter_by(user_id=current_user_id).all()
    return jsonify([c.to_dict() for c in contacts]), 200

@contact_bp.route("/", methods=["POST"])
@jwt_required()
def add_contact():
    current_user_id = get_jwt_identity()
    data = request.json
    try:
        new_contact = Contact(
            user_id=current_user_id,
            name=data['name'],
            phone=data['phone'],
            relation=data.get('relation', '')
        )
        db.session.add(new_contact)
        db.session.commit()
        return jsonify(new_contact.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@contact_bp.route("/<int:contact_id>", methods=["DELETE"])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = int(get_jwt_identity())
    contact = Contact.query.get(contact_id)
    
    if not contact:
        return jsonify({"error": "Contact not found"}), 404
    
    if contact.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted"}), 200
