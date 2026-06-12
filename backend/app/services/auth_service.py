
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db

def register_user(name, email, password):
    user = User(name=name, email=email, password=password)
    db.session.add(user)
    db.session.commit()

def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and user.password == password:
        return create_access_token(identity=user.id)
    return None
