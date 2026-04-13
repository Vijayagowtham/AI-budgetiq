import os
from dotenv import load_dotenv

try:
    import google.generativeai as genai
except ImportError:
    genai = None

load_dotenv()

def _get_api_key():
    # Try to get from environment first
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    
    # Fallback to config if we suspect we are in a flask context (optional)
    try:
        from flask import current_app
        return current_app.config.get("GEMINI_API_KEY")
    except:
        return None

# Configure Gemini once at module load time
_api_key = _get_api_key()
if _api_key and genai is not None:
    try:
        genai.configure(api_key=_api_key)
        _model = genai.GenerativeModel("gemini-2.0-flash")
    except Exception as e:
        print(f"Error configuring Gemini: {e}")
        _model = None
else:
    _model = None


def analyze_finances(total_income: float, total_expense: float) -> str:
    """
    Static fallback analysis — used on the Dashboard summary card.
    Does not call the LLM so it always works instantly.
    """
    if total_income == 0 and total_expense == 0:
        return "No data available yet. Start adding your income and expenses to get insights."

    if total_expense > total_income:
        return (
            f"Warning: You are overspending. Your expenses (₹{total_expense:,.2f}) "
            f"exceed your income (₹{total_income:,.2f}). Consider cutting back on non-essential categories."
        )

    savings_rate = ((total_income - total_expense) / total_income) * 100

    if savings_rate >= 20:
        return f"Great job! You are saving {savings_rate:.1f}% of your income. Keep up the excellent financial habits."
    elif savings_rate > 0:
        return (
            f"You are saving {savings_rate:.1f}% of your income. "
            f"Try to reduce discretionary spending to reach the recommended 20% savings goal."
        )
    return "Your income exactly matches your expenses. Be careful to build an emergency fund."


def chat_with_llm(user_message: str, financial_context: dict) -> str:
    """
    Send the user's question + their live financial data as context to Gemini.
    Falls back to a static response if the API key is not configured.
    """
    if genai is None:
        return (
            "The AI SDK is not installed on the server. Please install dependencies "
            "and restart the backend to enable intelligent responses."
        )

    if _model is None:
        return (
            "The AI service is not configured. Please set the GEMINI_API_KEY "
            "environment variable to enable intelligent responses."
        )

    total_income   = financial_context.get("total_income", 0)
    total_expense  = financial_context.get("total_expense", 0)
    savings_rate   = financial_context.get("savings_rate", 0)
    top_categories = financial_context.get("top_categories", [])

    cats_str = (
        ", ".join([f"{cat} (₹{val:,.0f})" for cat, val in top_categories[:5]])
        if top_categories else "No expense categories recorded yet"
    )

    prompt = f"""You are BudgetAI, a friendly and knowledgeable personal finance assistant embedded inside the BudgetIQ app.

Here is the user's current financial snapshot (in Indian Rupees):
- Total Income Recorded: ₹{total_income:,.2f}
- Total Expenses Recorded: ₹{total_expense:,.2f}
- Current Balance: ₹{(total_income - total_expense):,.2f}
- Savings Rate: {savings_rate:.1f}%
- Top Spending Categories: {cats_str}

Rules:
1. Answer only finance-related questions. If the user asks about unrelated topics, politely redirect them to financial matters.
2. Be concise (2-4 sentences), encouraging, and specific — reference the user's actual numbers when relevant.
3. Always use Indian Rupee (₹) for all monetary figures.
4. Do not make up data you do not have. If you need more detail, say so.
5. Write in plain, friendly English — no markdown symbols like **, ##, or bullet hyphens.

User's question: {user_message}"""

    try:
        response = _model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        err = str(e).lower()
        if "resource_exhausted" in err or "429" in err or "quota" in err:
            return (
                "I'm currently at my request limit — please wait a moment and try again. "
                "This usually resets within a minute."
            )
        return (
            "I'm having trouble reaching the AI service right now. Please try again in a moment."
        )
