import { fmt } from "../utils/currency";
import { 
  Plus, Search, ArrowUpRight, Wallet, Calendar, DollarSign, Trash2, TrendingUp
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

export function Income() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchIncome = async () => {
    try {
      const res = await api.get('/income/list');
      setIncomeList(res.data || []);
    } catch (err) {
      toast.error("Failed to load income data. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncome(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/income/${deleteTarget}`);
      toast.success("Income record deleted successfully.");
      fetchIncome();
    } catch (err) {
      toast.error("Failed to delete income: " + (err.message || "Unknown error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredIncome = incomeList.filter(item =>
    item.source?.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = incomeList.reduce((sum, i) => sum + (i.amount || 0), 0);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const amount = e.target.amount.value;
    const source = e.target.source.value;
    const date = e.target.date.value;

    try {
      await api.post('/income/add', { amount: parseFloat(amount), source, date });
      toast.success("Income added successfully!");
      setIsModalOpen(false);
      e.target.reset();
      fetchIncome();
    } catch (err) {
      toast.error("Failed to add income: " + (err.message || "Unknown error"));
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
          <h1 className="text-2xl font-bold text-slate-50">Income Tracking</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track all your incoming funds.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Add Income
        </Button>
      </div>

      {/* Summary Card */}
      {!loading && (
        <Card className="p-5 flex items-center gap-4 border-emerald-500/20 bg-emerald-500/5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Income Recorded</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{fmt(totalIncome)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-slate-400">{incomeList.length} record{incomeList.length !== 1 ? 's' : ''}</p>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="p-0 overflow-hidden border-slate-700/60">
        <div className="p-4 border-b border-slate-700/50 bg-slate-900/40">
          <div className="w-full max-w-sm">
            <Input
              icon={Search}
              placeholder="Search by source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                      <Wallet size={36} className="mb-3 text-slate-700" />
                      <p className="font-medium">
                        {search ? "No results found." : "No income records yet."}
                      </p>
                      {!search && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="mt-4 text-sm text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                        >
                          Add your first income record
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIncome.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                          <ArrowUpRight size={17} />
                        </div>
                        <span className="font-medium text-slate-100">{item.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">+{fmt(item.amount)}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(item.date)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Received</Badge>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Income">
        <form onSubmit={handleAddSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Source Name</label>
            <Input name="source" icon={Wallet} placeholder="e.g. Salary, Freelance" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Amount</label>
            <Input name="amount" icon={DollarSign} type="number" step="0.01" min="0.01" placeholder="0.00" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Date</label>
            <Input name="date" icon={Calendar} type="date" required />
          </div>
          <div className="pt-3 flex gap-3 justify-end border-t border-slate-800 mt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} className="min-w-[120px]">
              {saving ? "Saving..." : "Save Income"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Income Record"
        message="Are you sure you want to delete this income record? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
