from flask import Blueprint, request, jsonify
from app.extensions import get_db
from app.utils.middleware import token_required

income_bp = Blueprint('income', __name__)

@income_bp.route('/add', methods=['POST'])
@token_required
def add_income(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    amount = data.get('amount')
    source = data.get('source')
    date = data.get('date')
    
    if amount is None or not source or not date:
        return jsonify({"error": "Missing required fields"}), 400
        
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)',
            (current_user_id, float(amount), source, date)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Income added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@income_bp.route('/list', methods=['GET'])
@token_required
def list_income(current_user_id):
    try:
        conn = get_db()
        rows = conn.execute(
            'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC',
            (current_user_id,)
        ).fetchall()
        conn.close()
        
        data = [dict(row) for row in rows]
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@income_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_income(current_user_id, id):
    try:
        conn = get_db()
        cursor = conn.execute(
            'DELETE FROM income WHERE id = ? AND user_id = ?',
            (id, current_user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Income not found or unauthorized"}), 404
            
        conn.close()
        return jsonify({"message": "Income deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
