import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Transaction } from '../../types';
import { formatBDT, formatDate, fileToBase64 } from '../../lib/formatters';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  FileText,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart2,
  Lock,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const FinanceView: React.FC = () => {
  const {
    db,
    totalIncome,
    totalExpense,
    currentBalance,
    totalTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isAdmin,
    setIsLoginModalOpen,
    openDocumentViewer,
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'history' | 'income' | 'expense'>('dashboard');

  // Filters for History
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Transaction form states (Add / Edit)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [modalTxType, setModalTxType] = useState<'income' | 'expense'>('income');
  const [txFormData, setTxFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Donation',
    party: '', // Source or Where Spent
    description: '',
    referenceNo: '',
    attachmentUrl: '',
    attachmentName: '',
    notes: '',
  });

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Categories list
  const incomeCategories = [
    'Donation',
    'Membership Dues',
    'Publication & Book Sales',
    'Zakat & Welfare Fund',
    'Grant & Sponsorship',
    'Event Registration',
    'Other Income',
  ];

  const expenseCategories = [
    'Event Management',
    'Publication Printing',
    'Student Scholarships',
    'Office & Utilities',
    'Honorarium & Remuneration',
    'Library & IT Resources',
    'Humanitarian Aid',
    'Maintenance & Supplies',
    'Other Expense',
  ];

  // Sorted transactions chronologically (oldest to newest) to calculate running balance accurately
  const chronologicalTransactions = useMemo(() => {
    return [...db.transactions].sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.createdAt - b.createdAt;
    });
  }, [db.transactions]);

  // Compute map of transaction ID -> running balance after that transaction
  const runningBalances = useMemo(() => {
    const map = new Map<string, number>();
    let bal = 0;
    chronologicalTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        bal += Number(tx.amount) || 0;
      } else {
        bal -= Number(tx.amount) || 0;
      }
      map.set(tx.id, bal);
    });
    return map;
  }, [chronologicalTransactions]);

  // Filtered transactions for History view (newest first)
  const displayedTransactions = useMemo(() => {
    return [...db.transactions]
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.createdAt - a.createdAt;
      })
      .filter((t) => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCat = filterCategory === 'all' || t.category === filterCategory;
        const matchesSearch =
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesDate = true;
        if (startDate && t.date < startDate) matchesDate = false;
        if (endDate && t.date > endDate) matchesDate = false;

        return matchesType && matchesCat && matchesSearch && matchesDate;
      });
  }, [db.transactions, filterType, filterCategory, searchQuery, startDate, endDate]);

  // Chart data: Monthly Income & Expense
  const monthlyChartData = useMemo(() => {
    const map = new Map<string, { month: string; income: number; expense: number }>();
    db.transactions.forEach((t) => {
      const ym = t.date.slice(0, 7); // e.g. "2026-09"
      if (!map.has(ym)) {
        const parts = ym.split('-');
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        map.set(ym, { month: label, income: 0, expense: 0 });
      }
      const entry = map.get(ym)!;
      if (t.type === 'income') {
        entry.income += Number(t.amount) || 0;
      } else {
        entry.expense += Number(t.amount) || 0;
      }
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => val);
  }, [db.transactions]);

  // Chart data: Income by Category
  const incomeByCategoryData = useMemo(() => {
    const map = new Map<string, number>();
    db.transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [db.transactions]);

  // Chart data: Expense by Category
  const expenseByCategoryData = useMemo(() => {
    const map = new Map<string, number>();
    db.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
      });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [db.transactions]);

  const COLORS = ['#0E4D34', '#7A1224', '#C59B27', '#2563EB', '#7C3AED', '#D97706', '#059669'];

  // Handlers for Add/Edit
  const openAddTransaction = (type: 'income' | 'expense') => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setModalTxType(type);
    setEditingTxId(null);
    setTxFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: type === 'income' ? 'Donation' : 'Event Management',
      party: '',
      description: '',
      referenceNo: '',
      attachmentUrl: '',
      attachmentName: '',
      notes: '',
    });
    setIsTxModalOpen(true);
  };

  const openEditTransaction = (tx: Transaction) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setModalTxType(tx.type);
    setEditingTxId(tx.id);
    setTxFormData({
      amount: String(tx.amount),
      date: tx.date,
      category: tx.category,
      party: tx.party,
      description: tx.description,
      referenceNo: tx.referenceNo || '',
      attachmentUrl: tx.attachmentUrl || '',
      attachmentName: tx.attachmentName || '',
      notes: tx.notes || '',
    });
    setIsTxModalOpen(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(txFormData.amount);
    if (isNaN(num) || num <= 0) return;

    const payload = {
      type: modalTxType,
      amount: num,
      date: txFormData.date,
      category: txFormData.category,
      party: txFormData.party.trim() || (modalTxType === 'income' ? 'General Donor' : 'Operational'),
      description: txFormData.description,
      referenceNo: txFormData.referenceNo.trim() || undefined,
      attachmentUrl: txFormData.attachmentUrl || undefined,
      attachmentName: txFormData.attachmentName || undefined,
      notes: txFormData.notes.trim() || undefined,
    };

    if (editingTxId) {
      updateTransaction(editingTxId, payload);
    } else {
      addTransaction(payload);
    }
    setIsTxModalOpen(false);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const b64 = await fileToBase64(file);
      setTxFormData((prev) => ({
        ...prev,
        attachmentUrl: b64,
        attachmentName: file.name,
      }));
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Amount', 'Date', 'Category', 'Party/Source', 'Description', 'Reference'];
    const rows = db.transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      t.date,
      `"${t.category}"`,
      `"${t.party}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.referenceNo || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `An_Noor_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner with Balance Card */}
      <div className="bg-gradient-to-br from-[#0E4D34] via-[#093322] to-[#7A1224] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-400/25 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-amiri text-xs tracking-wider text-[#E4BC52] bg-black/30 px-2 py-0.5 rounded-full border border-amber-300/30">
                بَيْتُ الْمَالِ وَالْمُحَاسَبَةُ
              </span>
              <span className="text-xs text-emerald-100 font-medium">Digital Financial System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white mt-1">
              Finance & Accounts
            </h2>
            <p className="text-xs text-stone-200 mt-0.5 max-w-md leading-relaxed">
              Real-time balance tracking, donor accountability, voucher attachments, and expense records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-add-income"
              onClick={() => openAddTransaction('income')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>Record Income</span>
            </button>
            <button
              id="btn-add-expense"
              onClick={() => openAddTransaction('expense')}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>Record Expense</span>
            </button>
            <button
              onClick={exportCSV}
              title="Export Ledger as CSV"
              className="p-2 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition"
            >
              <Download className="w-4 h-4 text-[#E4BC52]" />
            </button>
          </div>
        </div>

        {/* 4 Essential Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-medium">Current Balance</span>
            <p className="text-xl sm:text-2xl font-bold text-[#E4BC52] font-cinzel mt-0.5">
              {formatBDT(currentBalance)}
            </p>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Total Income − Total Expense
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 font-medium">Total Income</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-emerald-300 font-mono mt-0.5">
              +{formatBDT(totalIncome)}
            </p>
            <span className="text-[10px] text-emerald-200/70 mt-0.5 block">
              Donations & grants
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-rose-200 font-medium">Total Expenses</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-rose-300 font-mono mt-0.5">
              -{formatBDT(totalExpense)}
            </p>
            <span className="text-[10px] text-rose-200/70 mt-0.5 block">
              Programs & printing
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-medium">Total Transactions</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">
              {totalTransactions}
            </p>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Audited digital entries
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation: Dashboard vs History vs Income vs Expense */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-[#0E4D34] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Financial Dashboard & Analytics</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('history');
            setFilterType('all');
          }}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'history' && filterType === 'all'
              ? 'bg-[#7A1224] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Complete Ledger History</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('income');
            setFilterType('income');
          }}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'income' || filterType === 'income'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Income Stream</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('expense');
            setFilterType('expense');
          }}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'expense' || filterType === 'expense'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>Expense Logs</span>
        </button>
      </div>

      {/* DASHBOARD TAB VIEW */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Monthly Inflow / Outflow Chart */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold font-cinzel text-stone-900">
                  Monthly Cash Flow Comparison
                </h3>
                <p className="text-[11px] text-stone-500">Income (Green) vs Expenditure (Maroon)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E4D34]" /> Income
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7A1224]" /> Expense
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `৳${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [formatBDT(val), 'Amount']}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="income" name="Income" fill="#0E4D34" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#7A1224" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categories Breakdown (Income by Category & Expense by Category) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income by Category */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PieIcon className="w-4 h-4 text-[#0E4D34]" />
                  <h4 className="text-sm font-bold font-cinzel text-stone-900">
                    Income by Category
                  </h4>
                </div>
                <div className="space-y-2">
                  {incomeByCategoryData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-stone-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 shrink-0">
                        {formatBDT(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 mt-4 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Total Income Inflow</span>
                <span className="font-bold text-emerald-700 font-mono">{formatBDT(totalIncome)}</span>
              </div>
            </div>

            {/* Expense by Category */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <PieIcon className="w-4 h-4 text-[#7A1224]" />
                  <h4 className="text-sm font-bold font-cinzel text-stone-900">
                    Expenses by Category
                  </h4>
                </div>
                <div className="space-y-2">
                  {expenseByCategoryData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-stone-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-700 shrink-0">
                        {formatBDT(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 mt-4 flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">Total Expenditure Outflow</span>
                <span className="font-bold text-rose-700 font-mono">{formatBDT(totalExpense)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY & LEDGER VIEW */}
      {(activeSubTab === 'history' || activeSubTab === 'income' || activeSubTab === 'expense') && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-filter-transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, donor, vendor, ref #..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 text-xs rounded-xl border border-stone-200 focus:border-[#7A1224] outline-hidden"
              />
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 text-xs rounded-xl border border-stone-200 outline-hidden"
              >
                <option value="all">All Categories</option>
                <optgroup label="Income">
                  {incomeCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
                <optgroup label="Expenses">
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
                className="w-full px-2 py-1.5 bg-stone-50 text-[11px] rounded-xl border border-stone-200 outline-hidden"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
                className="w-full px-2 py-1.5 bg-stone-50 text-[11px] rounded-xl border border-stone-200 outline-hidden"
              />
            </div>
          </div>

          {/* Transactions Table / List */}
          {displayedTransactions.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              <Wallet className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="font-semibold text-stone-700">No transactions match these filters</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {displayedTransactions.map((tx) => {
                const txBalance = runningBalances.get(tx.id) ?? 0;
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 -mx-2 px-2 rounded-xl transition"
                  >
                    {/* Left: icon & details */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-[#0E4D34]'
                            : 'bg-rose-100 text-[#7A1224]'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-rose-700" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-900">
                            {tx.description}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                              tx.type === 'income'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {tx.category}
                          </span>
                          {tx.referenceNo && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              #{tx.referenceNo}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-stone-500 mt-0.5">
                          <span className="font-medium text-stone-700">
                            {tx.type === 'income' ? 'Donor / Source:' : 'Recipient / Vendor:'}
                          </span>{' '}
                          {tx.party} • <span>{formatDate(tx.date)}</span>
                        </p>

                        {tx.notes && (
                          <p className="text-[10px] text-stone-400 italic mt-0.5 line-clamp-1">
                            Note: {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: amount, running balance, attachment & admin tools */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <div
                          className={`text-sm font-bold font-mono ${
                            tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatBDT(tx.amount)}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Balance after: <span className="font-bold text-stone-600">{formatBDT(txBalance)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tx.attachmentUrl ? (
                          <button
                            onClick={() =>
                              openDocumentViewer({
                                title: `${tx.type === 'income' ? 'Income Evidence Receipt' : 'Expense Memo / Invoice'}: ${tx.description}`,
                                url: tx.attachmentUrl!,
                                type: 'image',
                                subtitle: `${formatDate(tx.date)} • ${formatBDT(tx.amount)} • ${tx.party}`,
                              })
                            }
                            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                            title="View receipt / memo attachment"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-300 italic px-1">No doc</span>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditTransaction(tx)}
                              title="Edit Transaction"
                              className="p-1.5 text-stone-500 hover:text-[#7A1224] hover:bg-stone-100 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(tx)}
                              title="Delete Transaction"
                              className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div
              className={`p-4 text-white flex items-center justify-between ${
                modalTxType === 'income' ? 'bg-[#0E4D34]' : 'bg-[#7A1224]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#E4BC52]" />
                <h3 className="font-bold text-sm font-cinzel">
                  {editingTxId
                    ? `Edit ${modalTxType === 'income' ? 'Income' : 'Expense'}`
                    : `Record ${modalTxType === 'income' ? 'Income (Inflow)' : 'Expense (Outflow)'}`}
                </h3>
              </div>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Amount (in ৳ BDT) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={txFormData.amount}
                    onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })}
                    placeholder="e.g. 10000"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-sm outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={txFormData.date}
                    onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                <select
                  value={txFormData.category}
                  onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden bg-white"
                >
                  {modalTxType === 'income'
                    ? incomeCategories.map((c) => <option key={c} value={c}>{c}</option>)
                    : expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {modalTxType === 'income' ? 'Income Source / Donor Name *' : 'Where Spent / Vendor Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={txFormData.party}
                  onChange={(e) => setTxFormData({ ...txFormData, party: e.target.value })}
                  placeholder={
                    modalTxType === 'income'
                      ? 'e.g. Al-Haj Rafiqul Islam / Event Sponsor'
                      : 'e.g. Dhaka Event Craft / Printing Press'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={txFormData.description}
                  onChange={(e) => setTxFormData({ ...txFormData, description: e.target.value })}
                  placeholder={
                    modalTxType === 'income'
                      ? 'e.g. Event donation for upcoming Seerah Conference'
                      : 'e.g. Stage decoration advance payment'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Reference / Memo / Invoice # (optional)
                </label>
                <input
                  type="text"
                  value={txFormData.referenceNo}
                  onChange={(e) => setTxFormData({ ...txFormData, referenceNo: e.target.value })}
                  placeholder="e.g. TXN-DN-2026-0912 or INV-8891"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              {/* Evidence Upload */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-semibold text-stone-700 block">
                  {modalTxType === 'income'
                    ? 'Income Evidence Upload (Donation receipt, bank screenshot, cash slip)'
                    : 'Expense Memo Upload (Bill, memo, invoice, payment document)'}
                </span>

                <div className="flex items-center gap-3">
                  {txFormData.attachmentUrl && (
                    <img
                      src={txFormData.attachmentUrl}
                      alt="Attachment Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-stone-300 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg cursor-pointer transition font-semibold text-[11px]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {txFormData.attachmentUrl ? 'Change Uploaded Evidence' : 'Upload Receipt / Memo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />
                    </label>
                    {txFormData.attachmentName && (
                      <p className="text-[10px] text-stone-500 truncate">
                        File: {txFormData.attachmentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={txFormData.notes}
                  onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
                  placeholder="e.g. Paid via bank transfer, voucher signed by treasurer"
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-transaction"
                  className={`px-4 py-2 font-semibold text-white rounded-xl flex items-center gap-1.5 transition shadow-xs ${
                    modalTxType === 'income'
                      ? 'bg-[#0E4D34] hover:bg-[#093322]'
                      : 'bg-[#7A1224] hover:bg-[#580B18]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {editingTxId
                      ? 'Update Transaction'
                      : modalTxType === 'income'
                      ? 'Post Income Entry'
                      : 'Post Expense Entry'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation before deleting financial record */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Confirm Deleting Financial Record"
        message={`Are you sure you want to permanently delete this ${deleteTarget?.type} transaction of ${formatBDT(deleteTarget?.amount || 0)} ("${deleteTarget?.description}")? This will immediately recalculate the organizational balance.`}
        confirmLabel="Delete Transaction"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTransaction(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
