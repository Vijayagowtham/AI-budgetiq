import { Download, FileText, PieChart as PieChartIcon, Calendar, Loader2 } from "lucide-react";
import { fmt, fmtCompact } from "../utils/currency";
import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const PIE_COLORS = {
  "Housing":       "#ef4444",
  "Groceries":     "#22c55e",
  "Food & Drink":  "#10b981",
  "Transport":     "#f59e0b",
  "Entertainment": "#a855f7",
  "Health":        "#06b6d4",
  "Education":     "#3b82f6",
  "Utilities":     "#f97316",
  "Shopping":      "#ec4899",
  "Other":         "#64748b",
};

const FALLBACK_COLOR = "#64748b";

export function Reports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyRes, expenseRes] = await Promise.allSettled([
          api.get('/dashboard/monthly'),
          api.get('/expense/list'),
        ]);

        if (monthlyRes.status === 'fulfilled') {
          setMonthlyData(monthlyRes.value.data || []);
        }

        if (expenseRes.status === 'fulfilled') {
          const expenses = expenseRes.value.data || [];
          // Aggregate by category
          const byCategory = expenses.reduce((acc, e) => {
            const cat = e.category || "Other";
            acc[cat] = (acc[cat] || 0) + (e.amount || 0);
            return acc;
          }, {});
          const catArr = Object.entries(byCategory)
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)), color: PIE_COLORS[name] || FALLBACK_COLOR }))
            .sort((a, b) => b.value - a.value);
          setCategoryData(catArr);
        }
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const now = new Date();
  const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Financial Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Overview and downloadable summaries of your finances.</p>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6 border-slate-700/60 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer group transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 text-lg">Weekly Report</h3>
              <p className="text-sm text-slate-400 mt-0.5">{weekRange}</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Day-by-day analysis of your spending categories and income points for the current week.
          </p>
          <Button
            onClick={() => window.print()}
            className="no-print w-full bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700/60 shadow-none"
          >
            <Download size={17} className="mr-2" />
            Download PDF
          </Button>
        </Card>

        <Card className="p-6 border-slate-700/60 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer group transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <FileText size={26} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-50 text-lg">Monthly Report</h3>
              <p className="text-sm text-slate-400 mt-0.5">{currentMonth}</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Comprehensive overview with income vs. expense charts, trend analysis, and AI-generated insights.
          </p>
          <Button
            onClick={() => window.print()}
            className="no-print w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-emerald-500/10 shadow-md"
          >
            <Download size={17} className="mr-2" />
            Download PDF
          </Button>
        </Card>
      </div>

      {/* Charts Preview */}
      <div>
        <h2 className="text-lg font-semibold text-slate-50 mb-5 flex items-center gap-2">
          <PieChartIcon size={19} className="text-primary-400" />
          Data Preview
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar chart */}
          <Card className="p-6 border-slate-700/60">
            <h3 className="font-semibold text-slate-50 mb-1">Income vs Expenses</h3>
            <p className="text-xs text-slate-500 mb-5">Last 6 months</p>
            {loading ? (
              <div className="h-64 flex items-end gap-3 px-2">
                {[55, 80, 40, 90, 65, 72].map((h, i) => (
                  <div key={i} className="flex-1 flex gap-1 items-end h-full">
                    <div className="flex-1 shimmer-bg rounded-t" style={{ height: `${h}%` }} />
                    <div className="flex-1 shimmer-bg rounded-t" style={{ height: `${h * 0.7}%` }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlyData.length > 0 ? monthlyData : [{ name: "No Data", income: 0, expense: 0 }]}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      cursor={{ fill: '#1e293b70' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                      formatter={(val) => fmtCompact(val)}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px', color: '#64748b' }} />
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Pie chart */}
          <Card className="p-6 border-slate-700/60">
            <h3 className="font-semibold text-slate-50 mb-1">Expenses by Category</h3>
            <p className="text-xs text-slate-500 mb-5">All-time breakdown</p>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full shimmer-bg" />
              </div>
            ) : categoryData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                <PieChartIcon size={36} className="mb-2 text-slate-700" />
                <p className="text-sm">No expense data yet</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#f8fafc' }}
                      formatter={(val, name) => [fmt(val), name]}
                    />
                    <Legend 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
