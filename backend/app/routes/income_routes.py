from flask import Blueprint, request, jsonify
from app.extensions import get_supabase
from app.utils.middleware import token_required

income_bp = Blueprint('income', __name__)


@income_bp.route('/add', methods=['POST'])
@token_required
def add_income(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    amount = data.get('amount')
    source = data.get('source', '').strip()
    date = data.get('date', '').strip()

    if amount is None or not source or not date:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount value"}), 400

    try:
        sb = get_supabase()
        result = sb.table("income").insert({
            "user_id": current_user_id,
            "amount": amount,
            "source": source,
            "date": date
        }).execute()

        return jsonify({"message": "Income added successfully", "data": result.data[0] if result.data else {}}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@income_bp.route('/list', methods=['GET'])
@token_required
def list_income(current_user_id):
    try:
        sb = get_supabase()
        result = sb.table("income").select("*").eq("user_id", current_user_id).order("date", desc=True).execute()
        return jsonify({"data": result.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@income_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_income(current_user_id, id):
    try:
        sb = get_supabase()
        # Verify ownership first
        check = sb.table("income").select("id").eq("id", id).eq("user_id", current_user_id).execute()
        if not check.data:
            return jsonify({"error": "Income not found or unauthorized"}), 404

        sb.table("income").delete().eq("id", id).execute()
        return jsonify({"message": "Income deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
