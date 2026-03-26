import { Link } from "react-router-dom";
import { 
  BarChart2, Shield, Zap, Brain, TrendingUp, Target, ArrowRight, 
  CheckCircle2, IndianRupee, PieChart, Receipt, Sparkles,
  Github, Star, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const CHART_DATA = [
  { name: "Oct", income: 42000, expense: 18000 },
  { name: "Nov", income: 55000, expense: 22000 },
  { name: "Dec", income: 48000, expense: 28000 },
  { name: "Jan", income: 61000, expense: 19000 },
  { name: "Feb", income: 58000, expense: 24000 },
  { name: "Mar", income: 72000, expense: 21000 },
];

const FEATURES = [
  {
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
    title: "AI-Powered Insights",
    desc: "Get personalised financial advice powered by AI. Understand your spending patterns and receive actionable recommendations to grow your savings."
  },
  {
    icon: BarChart2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
    title: "Visual Analytics",
    desc: "Beautiful interactive charts show your income vs expenses across 6 months. Instantly spot trends, seasonal spikes, and areas to improve."
  },
  {
    icon: Receipt,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
    title: "Smart Expense Tracking",
    desc: "Log every rupee with 10 predefined categories — from Groceries to Housing. Search, filter, and never lose track of where your money goes."
  },
  {
    icon: Target,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    title: "Savings Rate Monitor",
    desc: "Know your savings rate at a glance. BudgetIQ calculates it automatically and benchmarks against the recommended 20% target."
  },
  {
    icon: Shield,
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-400",
    title: "Secure & Private",
    desc: "Your financial data never leaves your server. JWT-based authentication, encrypted sessions, and no third-party data sharing — ever."
  },
  {
    icon: PieChart,
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    iconColor: "text-indigo-400",
    title: "Downloadable Reports",
    desc: "Generate weekly and monthly PDF reports. Share with a CA or review offline — your complete financial picture, export-ready anytime."
  }
];

const STEPS = [
  { step: "01", title: "Create your account", desc: "Sign up in under 30 seconds. No credit card, no subscription — completely free." },
  { step: "02", title: "Log income & expenses", desc: "Add your salary, freelance earnings, and daily spending with a clean, fast interface." },
  { step: "03", title: "Get AI insights", desc: "Ask BudgetAI anything about your finances. It reads your data and gives personalised advice instantly." },
];

const STATS = [
  { icon: IndianRupee, label: "Transactions tracked", value: "₹10L+" },
  { icon: TrendingUp, label: "Average savings rate", value: "28%" },
  { icon: Zap, label: "AI insights delivered", value: "500+" },
  { icon: Star, label: "User satisfaction", value: "4.9 / 5" },
];

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans overflow-x-hidden">

      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60 shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
              <BarChart2 size={19} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">BudgetIQ</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-50 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-50 transition-colors">How it works</a>
            <a href="#stats" className="hover:text-slate-50 transition-colors">Stats</a>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-50 transition-colors focus:outline-none"
            >
              Sign in
            </Link>
            <Link
              to="/demo"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-50 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-6 py-4 space-y-4">
            <a href="#features" className="block text-sm text-slate-300 hover:text-slate-50" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-slate-300 hover:text-slate-50" onClick={() => setMenuOpen(false)}>How it works</a>
            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/demo" className="flex-1 text-center py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition-colors" onClick={() => setMenuOpen(false)}>Try demo</Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary-600/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-accent-600/8 blur-[120px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-8 hover:bg-primary-500/15 transition-colors cursor-default">
            <Sparkles size={13} />
            Powered by AI · Built for India
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
            <span className="text-slate-50">Your money,</span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
              finally under control
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            BudgetIQ is an intelligent personal finance manager that tracks your income and expenses in <strong className="text-slate-200 font-semibold">Indian Rupees</strong>, delivers AI-powered insights, and turns your raw data into a clear financial story.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/demo"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-base shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Start for free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-700 text-slate-300 hover:text-slate-50 hover:bg-slate-800 font-semibold text-base transition-all"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Hero chart preview */}
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary-500/30 to-transparent blur-sm" />
            <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Total Balance (YTD)</p>
                  <p className="text-3xl font-bold text-emerald-400">₹2,86,000</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">+18.4% vs last month</span>
                </div>
              </div>
              <div className="flex gap-5 mb-5 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" /> Income
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 bg-red-500 rounded-full inline-block" /> Expenses
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heroIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="heroExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                      formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']}
                    />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} fill="url(#heroIncome)" dot={false} />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#heroExpense)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats strip ─────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-slate-800/60 bg-slate-900/40 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                <s.icon size={22} />
              </div>
              <p className="text-2xl font-extrabold text-slate-50 mb-1">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-accent-600/5 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-4">
              <Zap size={12} /> Everything you need
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-5">
              Built to make budgeting
              <span className="block bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">effortless</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every feature is designed around how real Indians manage money — from monthly salaries to daily chai expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group relative p-6 rounded-2xl border ${f.bg} hover:scale-[1.02] transition-all duration-300 hover:shadow-xl cursor-default`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-50 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
              Up and running in{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-primary-400 bg-clip-text text-transparent">3 steps</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              No complicated setup. No spreadsheets. No CA required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(50%/3+1rem)] right-[calc(50%/3+1rem)] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {STEPS.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-2xl font-black text-slate-600 group-hover:border-primary-500/50 group-hover:text-primary-400 transition-all shadow-xl">
                    {s.step}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="md:hidden absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-px bg-slate-700" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-50 mb-3">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-[220px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900/60 via-slate-900 to-accent-900/40 border border-primary-500/20 p-12 text-center shadow-2xl">
            {/* glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/15 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/25 text-primary-300 text-xs font-semibold mb-6">
                <CheckCircle2 size={12} /> Free to use · No credit card needed
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-50 mb-5 leading-tight">
                Take control of your<br/>
                <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">financial future</span>
              </h2>
              <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of smart Indians who track every rupee, build better habits, and grow their wealth with BudgetIQ.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/demo"
                  className="group inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-lg shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.03]"
                >
                  Try the demo
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-base transition-all"
                >
                  Sign in instead
                </Link>
              </div>

              {/* Social proof check marks */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-10 text-sm text-slate-500">
                {["No credit card", "Dashboard in 60s", "₹ Indian Rupee support", "AI insights included", "Secure & private"].map(text => (
                  <span key={text} className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-300">BudgetIQ</span>
          </div>
          <p className="text-sm text-slate-600 text-center">
            Built with ❤️ for India · Manage your rupees intelligently.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
