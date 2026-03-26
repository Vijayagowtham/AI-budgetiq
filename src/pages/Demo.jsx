import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wallet, CreditCard, BarChart2,
  ArrowUpRight, ArrowDownRight, IndianRupee, TrendingUp, TrendingDown,
  Bot, X, Plus, Activity, LogIn, Sparkles, Lock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_SUMMARY = { total_income: 75000, total_expense: 32500, balance: 42500 };

const MOCK_MONTHLY = [
  { name: "Oct", income: 52000, expense: 24000 },
  { name: "Nov", income: 61000, expense: 29000 },
  { name: "Dec", income: 48000, expense: 31000 },
  { name: "Jan", income: 75000, expense: 32500 },
  { name: "Feb", income: 68000, expense: 27000 },
  { name: "Mar", income: 75000, expense: 32500 },
];

const MOCK_INCOME = [
  { id: 1, source: "Salary",          amount: 55000, date: "2026-03-01" },
  { id: 2, source: "Freelance Work",  amount: 12000, date: "2026-03-08" },
  { id: 3, source: "Stock Dividend",  amount: 3500,  date: "2026-03-12" },
  { id: 4, source: "Rental Income",   amount: 4500,  date: "2026-03-15" },
];

const MOCK_EXPENSES = [
  { id: 1, description: "Monthly rent",    category: "Housing",       amount: 15000, date: "2026-03-01" },
  { id: 2, description: "Grocery shopping",category: "Groceries",     amount: 4200,  date: "2026-03-05" },
  { id: 3, description: "Metro pass",      category: "Transport",     amount: 500,   date: "2026-03-07" },
  { id: 4, description: "Netflix + Hotstar",category:"Entertainment", amount: 799,   date: "2026-03-10" },
  { id: 5, description: "Doctor visit",    category: "Health",        amount: 1500,  date: "2026-03-12" },
  { id: 6, description: "Electricity bill",category: "Utilities",     amount: 1800,  date: "2026-03-14" },
  { id: 7, description: "Dinner out",      category: "Food & Drink",  amount: 1200,  date: "2026-03-18" },
  { id: 8, description: "Books",           category: "Education",     amount: 1500,  date: "2026-03-20" },
];

const PIE_DATA = [
  { name: "Housing",      value: 15000, color: "#ef4444" },
  { name: "Groceries",    value: 4200,  color: "#22c55e" },
  { name: "Health",       value: 1500,  color: "#06b6d4" },
  { name: "Utilities",    value: 1800,  color: "#f59e0b" },
  { name: "Other",        value: 10000, color: "#6366f1" },
];

const fmt = (n = 0) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

/* ─── Login prompt modal ─────────────────────────────────────────────────── */
function LoginPromptModal({ trigger, onClose }) {
  const messages = {
    timed:  { title: "Loving the demo?", body: "Sign up for free to track your real finances, save data, and get personalised AI insights." },
    add:    { title: "Want to add your own data?", body: "Create a free account to add your actual income and expenses — your data stays private and secure." },
    delete: { title: "Managing your records?", body: "Sign up to add, edit, and delete your real financial data. It's completely free." },
  };
  const m = messages[trigger] || messages.timed;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-primary-500/30 rounded-2xl p-8 shadow-2xl shadow-primary-500/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-200 rounded-lg transition-colors">
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-5 mx-auto">
          <Lock size={26} />
        </div>
        <h3 className="text-xl font-bold text-slate-50 text-center mb-2">{m.title}</h3>
        <p className="text-sm text-slate-400 text-center mb-7 leading-relaxed">{m.body}</p>
        <div className="flex flex-col gap-3">
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02]"
          >
            <Sparkles size={16} /> Create free account
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-sm transition-all"
          >
            <LogIn size={16} /> Sign in to existing account
          </Link>
          <button onClick={onClose} className="text-xs text-slate-600 hover:text-slate-400 mt-1 transition-colors">
            Continue exploring demo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Demo page ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: "dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { id: "income",    label: "Income",     icon: Wallet },
  { id: "expenses",  label: "Expenses",   icon: CreditCard },
];

export function Demo() {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [promptTrigger,setPromptTrigger] = useState(null); // null | "timed" | "add" | "delete"
  const timerRef = useRef(null);

  /* Show timed prompt after 40 seconds */
  useEffect(() => {
    timerRef.current = setTimeout(() => setPromptTrigger("timed"), 40000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const showPrompt = (trigger) => {
    clearTimeout(timerRef.current);
    setPromptTrigger(trigger);
  };

  const savings = ((MOCK_SUMMARY.balance / MOCK_SUMMARY.total_income) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col">

      {/* ── Top Demo Banner ─────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary-900/90 to-accent-900/80 backdrop-blur-md border-b border-primary-500/20 flex items-center justify-between px-5 py-2.5 gap-3">
        <div className="flex items-center gap-2 text-sm text-primary-200">
          <Sparkles size={15} className="text-primary-400 shrink-0" />
          <span>
            <strong>Demo Mode</strong> — You're exploring sample data.
            <span className="hidden sm:inline text-primary-300/70 ml-1">Sign up to track your real finances.</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/login" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-300 hover:text-white border border-primary-500/30 hover:border-primary-500/60 transition-all">
            <LogIn size={13} /> Sign in
          </Link>
          <Link to="/signup" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-500/20">
            <Sparkles size={13} /> Create free account
          </Link>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 pt-11">

        {/* Sidebar */}
        <aside className="hidden md:flex w-56 h-[calc(100vh-44px)] sticky top-11 bg-slate-900/95 border-r border-slate-800/60 flex-col py-5 px-3">
          <div className="flex items-center gap-2.5 px-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">BudgetIQ</span>
          </div>
          <nav className="flex-1 space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  activeTab === t.id
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <t.icon size={17} />
                {t.label}
              </button>
            ))}
            <button
              onClick={() => showPrompt("add")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800/60 hover:text-slate-400 transition-all text-left"
            >
              <Lock size={17} /> AI Insights
            </button>
            <button
              onClick={() => showPrompt("add")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800/60 hover:text-slate-400 transition-all text-left"
            >
              <Lock size={17} /> Reports
            </button>
            <button
              onClick={() => showPrompt("add")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800/60 hover:text-slate-400 transition-all text-left"
            >
              <Lock size={17} /> Goals
            </button>
          </nav>

          {/* Upgrade CTA */}
          <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
            <p className="text-xs text-slate-400 mb-2.5">Log in to access all features & save your real data.</p>
            <Link to="/signup" className="block text-center py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white transition-colors">
              Get started free
            </Link>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/60 flex px-2 py-1.5 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === t.id ? "text-primary-400" : "text-slate-500"}`}
            >
              <t.icon size={18} className="mb-0.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 max-w-5xl w-full">

          {/* ── Dashboard tab ── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-50">Dashboard Overview</h1>
                <p className="text-sm text-slate-400 mt-1">Your financial summary (demo data).</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: "Total Balance", val: MOCK_SUMMARY.balance, color: "primary", icon: IndianRupee, sub: `Savings rate: ${savings}%` },
                  { label: "Total Income",  val: MOCK_SUMMARY.total_income,  color: "emerald", icon: TrendingUp, sub: "All-time income recorded" },
                  { label: "Total Expenses",val: MOCK_SUMMARY.total_expense, color: "red",     icon: TrendingDown, sub: "All-time expenses" },
                ].map(c => (
                  <div key={c.label} className={`p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:-translate-y-1 transition-transform`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-400">{c.label}</p>
                      <div className={`p-2 bg-${c.color}-500/10 text-${c.color}-400 rounded-lg`}><c.icon size={20} /></div>
                    </div>
                    <div className={`text-3xl font-bold text-${c.color === "primary" ? "slate-50" : c.color + "-400"}`}>{fmt(c.val)}</div>
                    <p className="text-xs text-slate-500 mt-2">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* AI Banner */}
              <div className="p-5 rounded-2xl bg-primary-900/10 border border-primary-500/20 flex items-start gap-4">
                <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg shrink-0"><Bot size={22} /></div>
                <div>
                  <h3 className="font-semibold text-slate-50 mb-1">AI Financial Insight</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your savings rate is <strong>{savings}%</strong> — well above the recommended 20%. Your top expense is 
                    Housing (₹15,000). Consider investing the surplus to maximise long-term wealth.
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-slate-50">Spending Trend <span className="text-xs font-normal text-slate-500">(last 6 months)</span></h3>
                    <Activity size={16} className="text-slate-500" />
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="dExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", fontSize: "12px" }} formatter={v => fmt(v)} />
                        <Area type="monotone" dataKey="income"  stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#dIncome)"  dot={false} />
                        <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#dExpense)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-5 mt-2">
                    <span className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" /> Income</span>
                    <span className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-0.5 bg-red-500 rounded-full inline-block" /> Expenses</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <h3 className="font-semibold text-slate-50 mb-5">Expense Breakdown</h3>
                  <div className="flex items-center gap-6">
                    <div className="h-44 w-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                            {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {PIE_DATA.map(d => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                            {d.name}
                          </span>
                          <span className="text-slate-300 font-medium">{fmt(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Income tab ── */}
          {activeTab === "income" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-50">Income Tracking</h1>
                  <p className="text-sm text-slate-400 mt-1">Demo income records.</p>
                </div>
                <button onClick={() => showPrompt("add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-all">
                  <Plus size={16} /> Add Income
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><TrendingUp size={22} /></div>
                <div>
                  <p className="text-sm text-slate-400">Total Income Recorded</p>
                  <p className="text-2xl font-bold text-emerald-400">{fmt(MOCK_SUMMARY.total_income)}</p>
                </div>
                <div className="ml-auto text-sm text-slate-400">{MOCK_INCOME.length} records</div>
              </div>
              <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                    <tr><th className="px-6 py-4">Source</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {MOCK_INCOME.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><ArrowUpRight size={17} /></div>
                          <span className="font-medium text-slate-100">{item.source}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">+{fmt(item.amount)}</td>
                        <td className="px-6 py-4 text-slate-400">{fmtDate(item.date)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => showPrompt("delete")} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Sign up to delete">
                            <Lock size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Expenses tab ── */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-50">Expense Tracking</h1>
                  <p className="text-sm text-slate-400 mt-1">Demo expense records.</p>
                </div>
                <button onClick={() => showPrompt("add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all">
                  <Plus size={16} /> Add Expense
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl"><TrendingDown size={22} /></div>
                <div>
                  <p className="text-sm text-slate-400">Total Expenses Recorded</p>
                  <p className="text-2xl font-bold text-red-400">{fmt(MOCK_SUMMARY.total_expense)}</p>
                </div>
                <div className="ml-auto text-sm text-slate-400">{MOCK_EXPENSES.length} records</div>
              </div>
              <div className="rounded-2xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                    <tr><th className="px-6 py-4">Description</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {MOCK_EXPENSES.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0"><ArrowDownRight size={17} /></div>
                            <span className="font-medium text-slate-100">{item.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 text-xs">{item.category}</span></td>
                        <td className="px-6 py-4 font-semibold text-red-400">-{fmt(item.amount)}</td>
                        <td className="px-6 py-4 text-slate-400">{fmtDate(item.date)}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => showPrompt("delete")} className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Sign up to delete">
                            <Lock size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Login prompt modal ─────────────────────────────────────────── */}
      {promptTrigger && (
        <LoginPromptModal trigger={promptTrigger} onClose={() => setPromptTrigger(null)} />
      )}
    </div>
  );
}
