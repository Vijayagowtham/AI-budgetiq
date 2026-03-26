from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.utils.middleware import token_required

expense_bp = Blueprint('expense', __name__)


@expense_bp.route('/add', methods=['POST'])
@token_required
def add_expense(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    amount = data.get('amount')
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    date = data.get('date', '').strip()

    if amount is None or not category or not date:
        return jsonify({"error": "Missing required fields: amount, category, date"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount value"}), 400

    try:
        sb = get_supabase()
        result = sb.table("expenses").insert({
            "user_id": int(current_user_id),
            "amount": amount,
            "category": category,
            "description": description,
            "date": date
        }).execute()

        return jsonify({"message": "Expense added successfully", "data": result.data[0] if result.data else {}}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@expense_bp.route('/list', methods=['GET'])
@token_required
def list_expense(current_user_id):
    try:
        sb = get_supabase()
        result = (
            sb.table("expenses")
            .select("id, user_id, amount, category, description, date")
            .eq("user_id", int(current_user_id))
            .order("date", desc=True)
            .execute()
        )
        return jsonify({"data": result.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@expense_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_expense(current_user_id, id):
    try:
        sb = get_supabase()
        # Verify ownership first
        check = sb.table("expenses").select("id").eq("id", id).eq("user_id", int(current_user_id)).execute()
        if not check.data:
            return jsonify({"error": "Expense not found or unauthorized"}), 404

        sb.table("expenses").delete().eq("id", id).execute()
        return jsonify({"message": "Expense deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
