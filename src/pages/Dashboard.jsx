import { 
  IndianRupee, ArrowUpRight, ArrowDownRight, Activity, Bot, TrendingUp, TrendingDown
} from "lucide-react";
import { fmt } from "../utils/currency";
import { Card } from "../components/ui/Card";
import { StatCardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryData, monthlyRes, incomeRes, expenseRes] = await Promise.allSettled([
          api.get('/dashboard/summary'),
          api.get('/dashboard/monthly'),
          api.get('/income/list'),
          api.get('/expense/list'),
        ]);

        if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
        if (monthlyRes.status === 'fulfilled') {
          setMonthlyData(monthlyRes.value.data || []);
        }

        // Build recent transactions from income + expenses
        const incomeList = incomeRes.status === 'fulfilled' ? (incomeRes.value.data || []) : [];
        const expenseList = expenseRes.status === 'fulfilled' ? (expenseRes.value.data || []) : [];

        const combined = [
          ...incomeList.map(i => ({ ...i, type: 'income', name: i.source })),
          ...expenseList.map(e => ({ ...e, type: 'expense', name: e.description || e.category })),
        ]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setRecentTransactions(combined);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };
    fetchAll();
  }, []);



  const savingsRate = summary 
    ? ((summary.total_income - summary.total_expense) / Math.max(summary.total_income, 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Dashboard Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Your financial summary at a glance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6 hover:-translate-y-1 hover:shadow-primary-500/10 hover:border-primary-500/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">Total Balance</p>
                <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg">
                  <IndianRupee size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-50">{fmt(summary?.balance)}</div>
              <p className="text-xs text-slate-500 mt-2">
                Savings rate: <span className={savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400'}>{savingsRate.toFixed(1)}%</span>
              </p>
            </Card>

            <Card className="p-6 hover:-translate-y-1 hover:shadow-emerald-500/10 hover:border-emerald-500/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">Total Income</p>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{fmt(summary?.total_income)}</div>
              <p className="text-xs text-slate-500 mt-2">All-time income recorded</p>
            </Card>

            <Card className="p-6 hover:-translate-y-1 hover:shadow-red-500/10 hover:border-red-500/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">Total Expenses</p>
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-red-400">{fmt(summary?.total_expense)}</div>
              <p className="text-xs text-slate-500 mt-2">All-time expenses recorded</p>
            </Card>
          </>
        )}
      </div>

      {/* AI Insight Banner */}
      {!loading && summary?.ai_insight && (
        <Card className="p-5 border-primary-500/20 bg-primary-900/10 flex items-start gap-4">
          <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg shrink-0">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-50 mb-1">AI Financial Insight</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{summary.ai_insight}</p>
          </div>
        </Card>
      )}

      {/* Charts + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-50">Spending Trend <span className="text-xs font-normal text-slate-500">(last 6 months)</span></h3>
            <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
              <Activity size={18} />
            </div>
          </div>
          <div className="h-64 w-full">
            {chartLoading ? (
              <div className="h-full flex items-end gap-2 px-2">
                {[60, 80, 45, 90, 70, 55].map((h, i) => (
                  <div key={i} className="flex-1 shimmer-bg rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={monthlyData.length > 0 ? monthlyData : [
                    { name: "—", expense: 0, income: 0 }
                  ]} 
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(val) => fmt(val)}
                  />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" dot={false} />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" /> Income
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-red-500 rounded-full inline-block" /> Expenses
            </div>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-50">Recent Transactions</h3>
            <Link to="/expenses" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-10 h-10 rounded-full shimmer-bg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 shimmer-bg rounded w-32" />
                    <div className="h-3 shimmer-bg rounded w-24" />
                  </div>
                  <div className="h-4 shimmer-bg rounded w-16" />
                </div>
              ))
            ) : recentTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <IndianRupee size={32} className="mx-auto mb-2 text-slate-700" />
                <p className="text-sm">No transactions yet. Start adding income or expenses!</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-slate-800/60 transition-colors cursor-default group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100 leading-tight">{tx.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tx.category || (tx.type === 'income' ? 'Income' : 'Expense')} · {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
