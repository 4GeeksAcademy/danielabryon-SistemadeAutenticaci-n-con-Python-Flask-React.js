"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.exc import SQLAlchemyError

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, resources={r"/api/*": {"origins": "*"}})


# Create a route to authenticate your users and return JWT Token
# The create_access_token() function is used to actually generate the JWT
@api.route('/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify({"token": access_token}), 200
    else:
        return jsonify({"msg": "Bad username or password"}), 401

@api.route('/register', methods=['POST'])
def register():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    # Verificar si el usuario ya existe
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "Email already registered"}), 409

    # Generar hash de contraseña
    hashed_password = generate_password_hash(password)

    # Crear nuevo usuario
    new_user = User(
        email=email, 
        password=hashed_password,
        name=None,  # Opcional, puedes dejarlo como None
        is_active=True
    )

    try:
        # Añadir y guardar usuario
        db.session.add(new_user)
        db.session.commit()

        # Generar token de acceso
        access_token = create_access_token(identity=email)
        
        return jsonify({
            "token": access_token, 
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        # Manejar cualquier error durante el registro
        db.session.rollback()
        return jsonify({"msg": "Error registering user", "error": str(e)}), 500
    

@api.route('/update', methods=['PUT'])
@jwt_required()
def update_user():
    current_user = get_jwt_identity()

    user = User.query.filter_by(email= current_user.id).first()

    if user is None:
        return jsonify({"msg": "user not found"}), 404
    
    name = request.json.get("name", user.name)
    password = request.json.get("password", user.password)

    #ACTUALIZAMOS CAMPOS

    user.name = name
    user.password = password

    db.session.add(user)
    db.session.commit()

    return jsonify({'msg':"user updated"}), 200

@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    try:
        # Obtener la identidad del usuario actual
        current_user_id = get_jwt_identity()
        
        # Buscar el usuario en la base de datos
        user = User.query.filter_by(email=current_user_id).first()
        
        if not user:
            return jsonify({"msg": "User not found"}), 404
        
        # Serializar y devolver los datos del usuario
        return jsonify(user.serialize()), 200
    
    except SQLAlchemyError as e:
        # Manejar errores de base de datos
        print(f"Database error: {str(e)}")
        return jsonify({"msg": "Database error"}), 500
    
    except Exception as e:
        # Manejar cualquier otro error inesperado
        print(f"Unexpected error: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    result = [user.serialize() for user in users]
    current_user_id = get_jwt_identity()
    print(current_user_id)
    return jsonify({'users' : result}), 200

