from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config
from app.extensions import get_supabase

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()

    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        sb = get_supabase()

        # Check if user already exists
        existing = sb.table("users").select("id").eq("email", email).execute()
        if existing.data:
            return jsonify({"error": "User with this email already exists"}), 400

        hashed_pw = generate_password_hash(password)
        result = sb.table("users").insert({
            "email": email,
            "password_hash": hashed_pw,
            "full_name": full_name,
            "avatar": None
        }).execute()

        user = result.data[0]
        return jsonify({
            "message": "User registered successfully.",
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "avatar": user.get("avatar")
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        sb = get_supabase()
        result = sb.table("users").select("*").eq("email", email).execute()

        if not result.data:
            return jsonify({"error": "Invalid login credentials"}), 401

        user = result.data[0]

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid login credentials"}), 401

        # Generate JWT
        token = jwt.encode({
            'sub': str(user['id']),
            'email': user['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, Config.JWT_SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "Login successful",
            "access_token": token,
            "user": {
                "id": str(user['id']),
                "email": user['email'],
                "full_name": user['full_name'],
                "avatar": user.get('avatar')
            }
        }), 200

    except Exception as e:
        return jsonify({"error": "Invalid login credentials", "details": str(e)}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logout successful"}), 200


from app.utils.middleware import token_required


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get('email', '').strip()
    full_name = data.get('full_name', '').strip()
    avatar = data.get('avatar')

    if not email or not full_name:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        sb = get_supabase()

        # Ensure email is not taken by someone else
        existing = sb.table("users").select("id").eq("email", email).neq("id", current_user_id).execute()
        if existing.data:
            return jsonify({"error": "Email is already in use by another account"}), 400

        update_payload = {"email": email, "full_name": full_name}
        if avatar is not None:
            update_payload["avatar"] = avatar

        sb.table("users").update(update_payload).eq("id", current_user_id).execute()

        return jsonify({
            "message": "Profile updated successfully.",
            "user": {"id": current_user_id, "email": email, "full_name": full_name, "avatar": avatar}
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/profile', methods=['DELETE'])
@token_required
def delete_profile(current_user_id):
    try:
        sb = get_supabase()
        # Cascading deletes will handle income/expenses if FK + ON DELETE CASCADE is set
        sb.table("income").delete().eq("user_id", current_user_id).execute()
        sb.table("expenses").delete().eq("user_id", current_user_id).execute()
        sb.table("users").delete().eq("id", current_user_id).execute()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
