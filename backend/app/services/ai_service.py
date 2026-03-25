def analyze_finances(total_income: float, total_expense: float):
    """
    Very simple AI logic simulation to provide financial suggestions
    based on income and expenses differences.
    """
    if total_income == 0 and total_expense == 0:
        return "No data available yet. Start adding your income and expenses to get insights."
        
    if total_expense > total_income:
        return f"Warning: You are overspending. Your expenses (${total_expense:.2f}) exceed your income (${total_income:.2f}). Consider cutting back on non-essential categories."
        
    savings_rate = ((total_income - total_expense) / total_income) * 100
    
    if savings_rate >= 20:
        return f"Great job! You are saving {savings_rate:.1f}% of your income. Keep up the excellent financial habits."
    elif savings_rate > 0:
        return f"You are saving {savings_rate:.1f}% of your income. Try to reduce discretionary spending to reach the recommended 20% savings goal."
    else:
        return "Your income exactly matches your expenses. Be careful to build an emergency fund."
