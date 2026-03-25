from flask import Blueprint, jsonify, request
from app.extensions import get_db
from app.utils.middleware import token_required
from app.services.ai_service import analyze_finances
import datetime

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@token_required
def get_summary(current_user_id):
    try:
        conn = get_db()
        income_rows = conn.execute('SELECT amount FROM income WHERE user_id = ?', (current_user_id,)).fetchall()
        expense_rows = conn.execute('SELECT amount FROM expenses WHERE user_id = ?', (current_user_id,)).fetchall()
        conn.close()
        
        total_income = sum(row['amount'] for row in income_rows)
        total_expense = sum(row['amount'] for row in expense_rows)
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
        conn = get_db()
        
        months = []
        now = datetime.date.today()
        for i in range(5, -1, -1):
            # Calculate the target month
            month_offset = now.month - i - 1
            year_offset = now.year + (month_offset // 12)
            month_num = month_offset % 12 + 1
            if month_num == 0:
                month_num = 12
                year_offset -= 1
            # Build the YYYY-MM prefix
            prefix = f"{year_offset:04d}-{month_num:02d}"
            label = datetime.date(year_offset, month_num, 1).strftime("%b")
            months.append((prefix, label))
        
        result = []
        for prefix, label in months:
            income_rows = conn.execute(
                "SELECT COALESCE(SUM(amount),0) as total FROM income WHERE user_id=? AND date LIKE ?",
                (current_user_id, f"{prefix}%")
            ).fetchone()
            expense_rows = conn.execute(
                "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id=? AND date LIKE ?",
                (current_user_id, f"{prefix}%")
            ).fetchone()
            result.append({
                "name": label,
                "income": round(income_rows['total'], 2),
                "expense": round(expense_rows['total'], 2),
            })
        
        conn.close()
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
        conn = get_db()
        income_rows = conn.execute('SELECT amount FROM income WHERE user_id = ?', (current_user_id,)).fetchall()
        expense_rows = conn.execute('SELECT amount FROM expenses WHERE user_id = ?', (current_user_id,)).fetchall()
        expense_cats = conn.execute(
            'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC',
            (current_user_id,)
        ).fetchall()
        conn.close()
        
        total_income = sum(row['amount'] for row in income_rows)
        total_expense = sum(row['amount'] for row in expense_rows)
        savings_rate = ((total_income - total_expense) / max(total_income, 1)) * 100
        top_cat = expense_cats[0]['category'] if expense_cats else "general expenses"
        
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
            if expense_cats:
                top_cats_str = ", ".join([f"{r['category']} (₹{r['total']:,.0f})" for r in expense_cats[:3]])
                response += f" Your top spending categories are: {top_cats_str}."
        elif any(w in msg_lower for w in ["income", "earn", "salary"]):
            response = (
                f"Your total recorded income is **₹{total_income:,.2f}**. "
                f"If this represents one month, your annual projection would be ₹{total_income * 12:,.0f}. "
                f"Diversifying income sources can improve financial stability."
            )
        else:
            response = (
                f"Here's a quick snapshot: Income **${total_income:,.2f}**, "
                f"Expenses **${total_expense:,.2f}**, Balance **${(total_income - total_expense):,.2f}** "
                f"(savings rate: {savings_rate:.1f}%). "
                f"Ask me specifically about your spending, savings goals, or categories for detailed insights."
            )
            
        return jsonify({"response": response}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
