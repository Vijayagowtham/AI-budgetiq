import { fmt } from "../utils/currency";
import { 
  Plus, Search, ArrowDownRight, CreditCard, Coffee, ShoppingCart, Home, Car, 
  Tag, Calendar, DollarSign, AlignLeft, Trash2, TrendingDown, Heart, 
  GraduationCap, Zap, ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { TableRowSkeleton } from "../components/ui/Skeleton";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  "Groceries", "Transport", "Entertainment", "Housing", "Food & Drink",
  "Health", "Education", "Utilities", "Shopping", "Other"
];

const categoryConfig = {
  "Groceries":     { variant: "primary",  icon: ShoppingCart },
  "Transport":     { variant: "warning",  icon: Car },
  "Entertainment": { variant: "accent",   icon: CreditCard },
  "Housing":       { variant: "danger",   icon: Home },
  "Food & Drink":  { variant: "success",  icon: Coffee },
  "Health":        { variant: "success",  icon: Heart },
  "Education":     { variant: "primary",  icon: GraduationCap },
  "Utilities":     { variant: "warning",  icon: Zap },
  "Shopping":      { variant: "accent",   icon: ShoppingBag },
  "Other":         { variant: "default",  icon: Tag },
};

const getCategoryIcon = (cat) => {
  const conf = categoryConfig[cat];
  const Icon = conf?.icon || Tag;
  return <Icon size={13} />;
};

export function Expenses() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [expenseList, setExpenseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expense/list');
      setExpenseList(res.data || []);
    } catch (err) {
      toast.error("Failed to load expense data. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/expense/${deleteTarget}`);
      toast.success("Expense deleted successfully.");
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense: " + (err.message || "Unknown error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredExpenses = expenseList.filter(item =>
    item.description?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses = expenseList.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const amount = e.target.amount.value;
    const category = e.target.category.value;
    const description = e.target.description.value;
    const date = e.target.date.value;

    try {
      await api.post('/expense/add', { amount: parseFloat(amount), category, description, date });
      toast.success("Expense recorded successfully!");
      setIsModalOpen(false);
      e.target.reset();
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to add expense: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Expense Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and categorize your spending.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 border-0"
        >
          <Plus size={18} className="mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      {!loading && (
        <Card className="p-5 flex items-center gap-4 border-red-500/20 bg-red-500/5">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Expenses Recorded</p>
            <p className="text-2xl font-bold text-red-400 mt-0.5">{fmt(totalExpenses)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-slate-400">{expenseList.length} record{expenseList.length !== 1 ? 's' : ''}</p>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="p-0 overflow-hidden border-slate-700/60">
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/40">
          <div className="w-full max-w-sm">
            <Input
              icon={Search}
              placeholder="Search by description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                      <CreditCard size={36} className="mb-3 text-slate-700" />
                      <p className="font-medium">
                        {search ? "No results found." : "No expenses recorded yet."}
                      </p>
                      {!search && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="mt-4 text-sm text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                        >
                          Record your first expense
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => {
                  const conf = categoryConfig[item.category] || { variant: "default", icon: Tag };
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center group-hover:bg-red-500/20 transition-colors shrink-0">
                            <ArrowDownRight size={17} />
                          </div>
                          <span className="font-medium text-slate-100">
                            {item.description || <span className="italic text-slate-500">No description</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={conf.variant} className="flex w-fit items-center gap-1.5 px-2.5 py-1">
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-red-400">-{fmt(item.amount)}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(item.date)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(item.id)}
                          className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Expense">
        <form onSubmit={handleAddSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Amount</label>
            <Input name="amount" icon={DollarSign} type="number" step="0.01" min="0.01" placeholder="0.00" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Tag size={18} />
              </div>
              <select 
                name="category"
                className="flex h-11 w-full appearance-none rounded-lg border border-slate-700 bg-slate-800/50 px-3 pl-10 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <Input name="description" icon={AlignLeft} placeholder="e.g. Weekly grocery run" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Date</label>
            <Input name="date" icon={Calendar} type="date" required />
          </div>
          <div className="pt-3 flex gap-3 justify-end border-t border-slate-800 mt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={saving} 
              className="min-w-[130px] bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 border-0"
            >
              {saving ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
