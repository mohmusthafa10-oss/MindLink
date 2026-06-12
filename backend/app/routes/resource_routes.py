from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Resource, User

resource_bp = Blueprint("resources", __name__)

@resource_bp.route("/", methods=["GET"])
def get_resources():
    category = request.args.get("category")
    if category:
        resources = Resource.query.filter_by(category=category).all()
    else:
        resources = Resource.query.all()
    return jsonify([r.to_dict() for r in resources]), 200

@resource_bp.route("/", methods=["POST"])
@jwt_required()
def create_resource():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    try:
        new_resource = Resource(
            title=data['title'],
            category=data['category'],
            content=data['content'],
            description=data.get('description', '')
        )
        db.session.add(new_resource)
        db.session.commit()
        return jsonify(new_resource.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@resource_bp.route("/<int:resource_id>", methods=["DELETE"])
@jwt_required()
def delete_resource(resource_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({"error": "Resource not found"}), 404

    db.session.delete(resource)
    db.session.commit()
    return jsonify({"message": "Resource deleted"}), 200
