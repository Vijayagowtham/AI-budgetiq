from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config
from app.extensions import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        conn = get_db()
        # Check if user exists
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if user:
            conn.close()
            return jsonify({"error": "User with this email already exists"}), 400
            
        hashed_pw = generate_password_hash(password)
        cursor = conn.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
            (email, hashed_pw, full_name)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "message": "User registered successfully.", 
            "user": {"id": user_id, "email": email, "full_name": full_name, "avatar": None}
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        
        if not user or not check_password_hash(user['password_hash'], password):
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
                "avatar": user['avatar'] if 'avatar' in user.keys() else None
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
        
    email = data.get('email')
    full_name = data.get('full_name')
    avatar = data.get('avatar')
    
    if not email or not full_name:
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        conn = get_db()
        # Ensure email is not taken by someone else
        existing = conn.execute('SELECT id FROM users WHERE email = ? AND id != ?', (email, current_user_id)).fetchone()
        if existing:
            conn.close()
            return jsonify({"error": "Email is already in use by another account"}), 400
            
        conn.execute(
            'UPDATE users SET email = ?, full_name = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
            (email, full_name, avatar, current_user_id)
        )
        conn.commit()
        conn.close()
        
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
        conn = get_db()
        # Delete user's income
        conn.execute('DELETE FROM income WHERE user_id = ?', (current_user_id,))
        # Delete user's expenses
        conn.execute('DELETE FROM expenses WHERE user_id = ?', (current_user_id,))
        # Delete the user account
        conn.execute('DELETE FROM users WHERE id = ?', (current_user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Account uniquely deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
