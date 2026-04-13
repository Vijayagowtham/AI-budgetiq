from flask import Blueprint, jsonify, request
from app.extensions import get_supabase
from app.utils.middleware import token_required
from app.services.ai_service import analyze_finances, chat_with_llm
import datetime

dashboard_bp = Blueprint('dashboard', __name__)


def _sum_column(rows, col='amount'):
    return sum(float(r.get(col, 0)) for r in rows)


@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    try:
        sb = get_supabase()
        uid = current_user_id

        income_rows = sb.table("income").select("amount").eq("user_id", uid).execute().data
        expense_rows = sb.table("expenses").select("amount").eq("user_id", uid).execute().data

        total_income = _sum_column(income_rows)
        total_expense = _sum_column(expense_rows)
        balance = total_income - total_expense
        insight = analyze_finances(total_income, total_expense)

        return jsonify({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "ai_insight": insight
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route('/monthly', methods=['GET'])
@token_required
def get_monthly(current_user_id):
    """Return income and expense totals for each of the last 6 calendar months."""
    try:
        sb = get_supabase()
        uid = current_user_id

        # Build a list of (YYYY-MM prefix, short label) for the last 6 months
        months = []
        now = datetime.date.today()
        for i in range(5, -1, -1):
            total_months = now.year * 12 + now.month - 1 - i
            year = total_months // 12
            month = total_months % 12 + 1
            prefix = f"{year:04d}-{month:02d}"
            label = datetime.date(year, month, 1).strftime("%b")
            months.append((prefix, label))

        # Fetch all income and expense data for this user once
        all_income = sb.table("income").select("amount, date").eq("user_id", uid).execute().data
        all_expenses = sb.table("expenses").select("amount, date").eq("user_id", uid).execute().data

        result = []
        for prefix, label in months:
            monthly_income = sum(
                float(r["amount"]) for r in all_income if r.get("date", "").startswith(prefix)
            )
            monthly_expense = sum(
                float(r["amount"]) for r in all_expenses if r.get("date", "").startswith(prefix)
            )
            result.append({
                "name": label,
                "income": round(monthly_income, 2),
                "expense": round(monthly_expense, 2),
            })

        return jsonify({"data": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route('/ai_chat', methods=['POST'])
@token_required
def ai_chat(current_user_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
    message = data.get('message', '').strip()
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        sb = get_supabase()
        uid = current_user_id

        # Fetch live financial data to inject as context into the LLM prompt
        income_rows  = sb.table("income").select("amount").eq("user_id", uid).execute().data
        expense_rows = sb.table("expenses").select("amount, category").eq("user_id", uid).execute().data

        total_income  = _sum_column(income_rows)
        total_expense = _sum_column(expense_rows)
        savings_rate  = ((total_income - total_expense) / max(total_income, 1)) * 100

        # Aggregate expenses by category for richer context
        cat_totals = {}
        for r in expense_rows:
            cat = r.get("category", "Other")
            cat_totals[cat] = cat_totals.get(cat, 0) + float(r.get("amount", 0))
        sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)

        financial_context = {
            "total_income":   total_income,
            "total_expense":  total_expense,
            "savings_rate":   savings_rate,
            "top_categories": sorted_cats,
        }

        # Delegate to Gemini LLM with user's financial context
        response = chat_with_llm(message, financial_context)
        return jsonify({"response": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
