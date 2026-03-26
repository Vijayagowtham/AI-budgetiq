import { useState, useEffect } from "react";
import { api } from "../services/api";
import { fmt } from "../utils/currency";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../context/ToastContext";
import {
  Target, IndianRupee, AlertTriangle, CheckCircle,
  Edit2, TrendingUp, PiggyBank, ShieldAlert
} from "lucide-react";

const CATEGORIES = [
  "Groceries", "Transport", "Entertainment", "Housing", "Food & Drink",
  "Health", "Education", "Utilities", "Shopping", "Other"
];

const STORAGE_KEY_LIMITS  = "budgetiq_budget_limits";
const STORAGE_KEY_SAVINGS = "budgetiq_savings_goal";

export function Goals() {
  const toast = useToast();

  const [budgetLimits, setBudgetLimits] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_LIMITS)) || {}; }
    catch { return {}; }
  });
  const [savingsGoal, setSavingsGoal] = useState(
    () => parseFloat(localStorage.getItem(STORAGE_KEY_SAVINGS)) || 0
  );

  const [monthlyExpenses, setMonthlyExpenses] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editLimitModal, setEditLimitModal]   = useState(null);
  const [editSavingsModal, setEditSavingsModal] = useState(false);
  const [newLimitValue,   setNewLimitValue]   = useState("");
  const [newSavingsValue, setNewSavingsValue] = useState("");

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, sumRes] = await Promise.allSettled([
          api.get('/expense/list'),
          api.get('/dashboard/summary'),
        ]);
        if (expRes.status === 'fulfilled') {
          const byCategory = {};
          (expRes.value.data || [])
            .filter(e => (e.date || '').startsWith(currentMonthPrefix))
            .forEach(e => {
              byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
            });
          setMonthlyExpenses(byCategory);
        }
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Budget limit helpers ── */
  const openLimitModal = (cat) => {
    setNewLimitValue(budgetLimits[cat] || "");
    setEditLimitModal(cat);
  };

  const saveBudgetLimit = () => {
    const val = parseFloat(newLimitValue);
    if (!val || val <= 0) { toast.error("Please enter a valid limit."); return; }
    const updated = { ...budgetLimits, [editLimitModal]: val };
    setBudgetLimits(updated);
    localStorage.setItem(STORAGE_KEY_LIMITS, JSON.stringify(updated));
    toast.success(`Budget limit set for ${editLimitModal}!`);
    setEditLimitModal(null);
    setNewLimitValue("");
  };

  const removeBudgetLimit = (cat) => {
    const updated = { ...budgetLimits };
    delete updated[cat];
    setBudgetLimits(updated);
    localStorage.setItem(STORAGE_KEY_LIMITS, JSON.stringify(updated));
    toast.success(`Limit removed for ${cat}.`);
  };

  /* ── Savings goal helpers ── */
  const saveSavingsGoal = () => {
    const val = parseFloat(newSavingsValue);
    if (!val || val <= 0) { toast.error("Please enter a valid goal amount."); return; }
    setSavingsGoal(val);
    localStorage.setItem(STORAGE_KEY_SAVINGS, String(val));
    toast.success("Savings goal updated!");
    setEditSavingsModal(false);
    setNewSavingsValue("");
  };

  /* ── Derived values ── */
  const currentBalance = summary ? (summary.total_income - summary.total_expense) : 0;
  const savingsProgress = savingsGoal > 0 ? Math.min((currentBalance / savingsGoal) * 100, 100) : 0;
  const savingsRate = summary
    ? ((summary.total_income - summary.total_expense) / Math.max(summary.total_income, 1)) * 100
    : 0;

  const catsWithLimits    = CATEGORIES.filter(c => budgetLimits[c] != null);
  const catsWithoutLimits = CATEGORIES.filter(c => budgetLimits[c] == null);

  const monthLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Budget Goals</h1>
        <p className="text-sm text-slate-400 mt-1">
          Set spending limits per category and track your savings target.
        </p>
      </div>

      {/* ─── Savings Goal Card ─── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg">
              <PiggyBank size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50">Savings Goal</h3>
              <p className="text-xs text-slate-400">Track your balance against a target amount</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => { setNewSavingsValue(savingsGoal || ""); setEditSavingsModal(true); }}
          >
            <Edit2 size={14} className="mr-1.5" />
            {savingsGoal > 0 ? "Edit Goal" : "Set Goal"}
          </Button>
        </div>

        {savingsGoal > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current Balance</span>
              <span className={`font-semibold ${currentBalance >= savingsGoal ? "text-emerald-400" : "text-slate-100"}`}>
                {fmt(currentBalance)}
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  savingsProgress >= 100 ? "bg-emerald-500" : "bg-primary-500"
                }`}
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {savingsProgress.toFixed(1)}% of goal
                {savingsProgress >= 100 && <span className="ml-1">🎉 Achieved!</span>}
              </span>
              <span>Target: {fmt(savingsGoal)}</span>
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-800 mt-1">
              Savings rate:{" "}
              <span className={savingsRate >= 20 ? "text-emerald-400" : "text-amber-400"}>
                {savingsRate.toFixed(1)}%
              </span>
              {savingsRate >= 20
                ? " ✓ Above the recommended 20%"
                : " — aim for 20%+ to hit your goal faster"}
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <Target size={32} className="mx-auto mb-2 text-slate-700" />
            <p className="text-sm text-slate-500">No savings goal set yet.</p>
            <button
              onClick={() => setEditSavingsModal(true)}
              className="mt-3 text-sm text-primary-400 hover:text-primary-300 underline underline-offset-2"
            >
              Set your first goal
            </button>
          </div>
        )}
      </Card>

      {/* ─── Monthly Budget Limits ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-50 flex items-center gap-2">
            <ShieldAlert size={17} className="text-amber-400" />
            Monthly Budget Limits
          </h3>
          <span className="text-xs text-slate-500">{monthLabel}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categories with limits */}
          {catsWithLimits.map(cat => {
            const spent = monthlyExpenses[cat] || 0;
            const limit = budgetLimits[cat];
            const pct   = Math.min((spent / limit) * 100, 100);
            const isOver = spent > limit;
            const isNear = pct >= 80 && !isOver;
            return (
              <Card
                key={cat}
                className={`p-4 transition-colors ${
                  isOver ? "border-red-500/40 bg-red-500/5"
                         : isNear ? "border-amber-500/40 bg-amber-500/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isOver
                      ? <AlertTriangle size={14} className="text-red-400" />
                      : isNear
                        ? <AlertTriangle size={14} className="text-amber-400" />
                        : <CheckCircle size={14} className="text-emerald-400" />
                    }
                    <span className="text-sm font-medium text-slate-100">{cat}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openLimitModal(cat)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 rounded transition-colors"
                      title="Edit limit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => removeBudgetLimit(cat)}
                      className="p-1.5 text-slate-600 hover:text-red-400 rounded transition-colors text-xs"
                      title="Remove limit"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isOver ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className={isOver ? "text-red-400 font-medium" : "text-slate-400"}>
                    Spent: {fmt(spent)}
                  </span>
                  <span className="text-slate-500">Limit: {fmt(limit)}</span>
                </div>
                {isOver && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">
                    ⚠ Over budget by {fmt(spent - limit)}
                  </p>
                )}
              </Card>
            );
          })}

          {/* Add limit cards for remaining categories */}
          {catsWithoutLimits.map(cat => (
            <button
              key={cat}
              onClick={() => openLimitModal(cat)}
              className="p-4 border border-dashed border-slate-700 rounded-xl text-left hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
            >
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200 mb-0.5">
                {cat}
              </p>
              <p className="text-xs text-slate-600 group-hover:text-primary-400">
                + Set monthly spending limit
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Modals ─── */}
      <Modal
        isOpen={!!editLimitModal}
        onClose={() => setEditLimitModal(null)}
        title={`Set Budget — ${editLimitModal}`}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Monthly Limit (₹)</label>
            <Input
              icon={IndianRupee}
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 5000"
              value={newLimitValue}
              onChange={e => setNewLimitValue(e.target.value)}
            />
          </div>
          {editLimitModal && monthlyExpenses[editLimitModal] > 0 && (
            <p className="text-xs text-slate-400">
              Already spent this month:{" "}
              <span className="text-amber-400 font-medium">
                {fmt(monthlyExpenses[editLimitModal])}
              </span>
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setEditLimitModal(null)}>Cancel</Button>
            <Button onClick={saveBudgetLimit}>Save Limit</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={editSavingsModal}
        onClose={() => setEditSavingsModal(false)}
        title="Set Savings Goal"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Target Amount (₹)</label>
            <Input
              icon={IndianRupee}
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 1,00,000"
              value={newSavingsValue}
              onChange={e => setNewSavingsValue(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">
            Your current balance ({fmt(currentBalance)}) will be tracked against this goal.
          </p>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setEditSavingsModal(false)}>Cancel</Button>
            <Button onClick={saveSavingsGoal}>Save Goal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
