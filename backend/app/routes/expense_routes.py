from flask import Blueprint, request, jsonify
from app.extensions import get_db
from app.utils.middleware import token_required

expense_bp = Blueprint('expense', __name__)

@expense_bp.route('/add', methods=['POST'])
@token_required
def add_expense(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    amount = data.get('amount')
    category = data.get('category')
    description = data.get('description', '')
    date = data.get('date')
    
    if amount is None or not category or not date:
        return jsonify({"error": "Missing required fields: amount, category, date"}), 400
    
    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount value"}), 400
        
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
            (current_user_id, amount, category, description, date)
        )
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Expense added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@expense_bp.route('/list', methods=['GET'])
@token_required
def list_expense(current_user_id):
    try:
        conn = get_db()
        rows = conn.execute(
            'SELECT id, user_id, amount, category, description, date FROM expenses WHERE user_id = ? ORDER BY date DESC',
            (current_user_id,)
        ).fetchall()
        conn.close()
        
        data = [dict(row) for row in rows]
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@expense_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_expense(current_user_id, id):
    try:
        conn = get_db()
        cursor = conn.execute(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            (id, current_user_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Expense not found or unauthorized"}), 404
            
        conn.close()
        return jsonify({"message": "Expense deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
