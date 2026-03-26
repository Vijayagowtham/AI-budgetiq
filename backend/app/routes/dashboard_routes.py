from flask import Blueprint, jsonify, request
from app.extensions import get_supabase
from app.utils.middleware import token_required
from app.services.ai_service import analyze_finances
import datetime

dashboard_bp = Blueprint('dashboard', __name__)


def _sum_column(rows, col='amount'):
    return sum(float(r.get(col, 0)) for r in rows)


@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    try:
        sb = get_supabase()
        uid = int(current_user_id)

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
        uid = int(current_user_id)

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
        uid = int(current_user_id)

        income_rows = sb.table("income").select("amount").eq("user_id", uid).execute().data
        expense_rows = sb.table("expenses").select("amount, category").eq("user_id", uid).execute().data

        total_income = _sum_column(income_rows)
        total_expense = _sum_column(expense_rows)
        savings_rate = ((total_income - total_expense) / max(total_income, 1)) * 100

        # Aggregate by category
        cat_totals = {}
        for r in expense_rows:
            cat = r.get("category", "Other")
            cat_totals[cat] = cat_totals.get(cat, 0) + float(r.get("amount", 0))
        sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
        top_cat = sorted_cats[0][0] if sorted_cats else "general expenses"

        msg_lower = message.lower()

        if any(w in msg_lower for w in ["reduce", "dining", "spending", "cut", "save"]):
            response = (
                f"Based on your data, your highest spending category is **{top_cat}**. "
                f"Consider setting a strict weekly budget for this category. "
                f"Your current savings rate is {savings_rate:.1f}% — aim for at least 20% as a financial baseline."
            )
        elif any(w in msg_lower for w in ["goal", "track", "target", "savings rate"]):
            if savings_rate >= 20:
                status = "You're doing great — above the recommended 20% savings rate!"
            elif savings_rate >= 10:
                status = f"You're at {savings_rate:.1f}% savings rate, approaching the 20% goal. Small cuts in top categories can help."
            else:
                status = f"Your savings rate is {savings_rate:.1f}%, which is below the recommended 20%. Consider reviewing recurring expenses."
            response = f"Current savings rate: **{savings_rate:.1f}%**. {status}"
        elif any(w in msg_lower for w in ["analyze", "breakdown", "summary", "overview"]):
            response = analyze_finances(total_income, total_expense)
            if sorted_cats:
                top_cats_str = ", ".join([f"{cat} (₹{total:,.0f})" for cat, total in sorted_cats[:3]])
                response += f" Your top spending categories are: {top_cats_str}."
        elif any(w in msg_lower for w in ["income", "earn", "salary"]):
            response = (
                f"Your total recorded income is **₹{total_income:,.2f}**. "
                f"If this represents one month, your annual projection would be ₹{total_income * 12:,.0f}. "
                f"Diversifying income sources can improve financial stability."
            )
        else:
            response = (
                f"Here's a quick snapshot: Income **₹{total_income:,.2f}**, "
                f"Expenses **₹{total_expense:,.2f}**, Balance **₹{(total_income - total_expense):,.2f}** "
                f"(savings rate: {savings_rate:.1f}%). "
                f"Ask me specifically about your spending, savings goals, or categories for detailed insights."
            )

        return jsonify({"response": response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
