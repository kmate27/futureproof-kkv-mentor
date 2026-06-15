import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ChevronLeft,
  AlertTriangle,
  Scale
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/* ── Constants ─────────────────────────────────────────── */
const MONTHS = [
  { short: 'Júl',   full: 'Július' },
  { short: 'Aug',   full: 'Augusztus' },
  { short: 'Szept', full: 'Szeptember' },
  { short: 'Okt',   full: 'Október' },
  { short: 'Nov',   full: 'November' },
  { short: 'Dec',   full: 'December' },
];

/* ── Helpers ───────────────────────────────────────────── */
const formatHuf = (val) =>
  new Intl.NumberFormat('hu-HU').format(Math.round(val)) + ' Ft';

let nextId = Date.now();

/* ── Component ─────────────────────────────────────────── */
export default function Cashflow() {
  const { incomes, setIncomes, expenses, setExpenses } = useFinance();

  // Inline add-form state
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', frequency: 'Havi', month: 'Július' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', frequency: 'Havi', month: 'Július' });

  /* ── Derived KPIs ────────────────────────────────────── */
  const monthlyIncome = useMemo(
    () => incomes.filter(i => i.frequency === 'Havi').reduce((s, i) => s + i.amount, 0),
    [incomes]
  );
  const monthlyExpense = useMemo(
    () => expenses.filter(e => e.frequency === 'Havi').reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const monthlyBalance = monthlyIncome - monthlyExpense;

  /* ── 6-month chart data ──────────────────────────────── */
  const chartData = useMemo(() => {
    return MONTHS.map(({ short, full }) => {
      const income =
        incomes.filter(i => i.frequency === 'Havi').reduce((s, i) => s + i.amount, 0) +
        incomes.filter(i => i.frequency === 'Egyszeri' && i.month === full).reduce((s, i) => s + i.amount, 0);

      const expense =
        expenses.filter(e => e.frequency === 'Havi').reduce((s, e) => s + e.amount, 0) +
        expenses.filter(e => e.frequency === 'Egyszeri' && e.month === full).reduce((s, e) => s + e.amount, 0);

      return { name: short, bevétel: income, kiadás: expense, nettó: income - expense };
    });
  }, [incomes, expenses]);

  /* ── Negative months for AI warning ──────────────────── */
  const negativeMonths = chartData.filter(d => d.nettó < 0);

  /* ── CRUD handlers ───────────────────────────────────── */
  const addItem = (type) => {
    const draft = type === 'income' ? newIncome : newExpense;
    if (!draft.name.trim() || !draft.amount) return;
    const item = {
      id: nextId++,
      name: draft.name.trim(),
      amount: Number(draft.amount),
      frequency: draft.frequency,
      ...(draft.frequency === 'Egyszeri' ? { month: draft.month } : {}),
    };
    if (type === 'income') {
      setIncomes(prev => [...prev, item]);
      setNewIncome({ name: '', amount: '', frequency: 'Havi', month: 'Július' });
    } else {
      setExpenses(prev => [...prev, item]);
      setNewExpense({ name: '', amount: '', frequency: 'Havi', month: 'Július' });
    }
  };

  const deleteIncome = (id) => setIncomes(prev => prev.filter(i => i.id !== id));
  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const triggerAiChat = () => {
    const details = negativeMonths
      .map(m => `${m.name}: ${formatHuf(m.nettó)}`)
      .join(', ');
    window.dispatchEvent(
      new CustomEvent('open-ai-chat', {
        detail: {
          prompt: `A cashflow előrejelzésem szerint negatív hónapjaim vannak: ${details}. Milyen költségcsökkentési vagy bevételnövelési javaslataid vannak?`,
        },
      })
    );
  };

  /* ── Custom Tooltip ──────────────────────────────────── */
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl text-xs space-y-1.5">
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="flex justify-between gap-6 text-slate-400">
          <span>Bevétel:</span>
          <span className="font-bold text-[#00F872]">{formatHuf(d.bevétel)}</span>
        </p>
        <p className="flex justify-between gap-6 text-slate-400">
          <span>Kiadás:</span>
          <span className="font-bold text-red-400">{formatHuf(d.kiadás)}</span>
        </p>
        <p className="flex justify-between gap-6 text-slate-400 border-t border-slate-800 pt-1.5">
          <span>Nettó:</span>
          <span className={`font-bold ${d.nettó >= 0 ? 'text-[#00F872]' : 'text-red-400'}`}>
            {formatHuf(d.nettó)}
          </span>
        </p>
      </div>
    );
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white">

      {/* ─── 1. Header ─────────────────────────────────── */}
      <div className="border-b border-slate-850 pb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Vissza a Dashboardra
        </Link>
        <h1 className="text-3xl font-extrabold font-display tracking-tight">
          Cash Flow Kezelő
        </h1>
      </div>

      {/* ─── 2. KPI Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Havi Bevétel */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#00F872]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Havi Bevétel</p>
            <p className="text-xl font-extrabold text-[#00F872] tabular-nums whitespace-nowrap">
              {formatHuf(monthlyIncome)}
            </p>
          </div>
        </div>

        {/* Havi Kiadás */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Havi Kiadás</p>
            <p className="text-xl font-extrabold text-red-400 tabular-nums whitespace-nowrap">
              {formatHuf(monthlyExpense)}
            </p>
          </div>
        </div>

        {/* Havi Egyenleg */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            monthlyBalance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            <Scale className={`w-5 h-5 ${monthlyBalance >= 0 ? 'text-[#00F872]' : 'text-red-400'}`} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Havi Egyenleg</p>
            <p className={`text-xl font-extrabold tabular-nums whitespace-nowrap ${
              monthlyBalance >= 0 ? 'text-[#00F872]' : 'text-red-400'
            }`}>
              {monthlyBalance >= 0 ? '+' : ''}{formatHuf(monthlyBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. 6-Month Area Chart ─────────────────────── */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">
          6 Hónapos Cash Flow Előrejelzés
        </h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F872" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00F872" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(v) => {
                  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}e`;
                  return v;
                }}
              />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="bevétel"
                stroke="#00F872"
                strokeWidth={2}
                fill="url(#gradGreen)"
                name="Bevétel"
              />
              <Area
                type="monotone"
                dataKey="kiadás"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradRed)"
                name="Kiadás"
              />
              <Line
                type="monotone"
                dataKey="nettó"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
                name="Nettó"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── 4. Two-Column: Bevételek & Kiadások ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Bevételek ──────────────────────────────────── */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col">
          <h2 className="text-sm font-bold text-[#00F872] uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Bevételek
          </h2>

          {/* List */}
          <div className="space-y-2 flex-1 mb-4">
            {incomes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-slate-950/50 border border-slate-800/60 rounded-xl px-4 py-3 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <span className={`text-[10px] font-medium uppercase mt-0.5 block ${
                    item.frequency === 'Havi'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {item.frequency}{item.frequency === 'Egyszeri' && item.month ? ` · ${item.month}` : ''}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#00F872] tabular-nums whitespace-nowrap">
                  {formatHuf(item.amount)}
                </span>
                <button
                  onClick={() => deleteIncome(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all cursor-pointer p-1"
                  aria-label="Törlés"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {incomes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">Nincs bevétel hozzáadva.</p>
            )}
          </div>

          {/* Add form */}
          <div className="flex flex-wrap items-end gap-2 border-t border-slate-800/60 pt-4">
            <input
              type="text"
              placeholder="Megnevezés"
              value={newIncome.name}
              onChange={(e) => setNewIncome(p => ({ ...p, name: e.target.value }))}
              className="flex-1 min-w-[120px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F872]/50"
            />
            <input
              type="number"
              placeholder="Összeg"
              value={newIncome.amount}
              onChange={(e) => setNewIncome(p => ({ ...p, amount: e.target.value }))}
              className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F872]/50"
            />
            <select
              value={newIncome.frequency}
              onChange={(e) => setNewIncome(p => ({ ...p, frequency: e.target.value }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F872]/50"
            >
              <option value="Havi">Havi</option>
              <option value="Egyszeri">Egyszeri</option>
            </select>
            {newIncome.frequency === 'Egyszeri' && (
              <select
                value={newIncome.month}
                onChange={(e) => setNewIncome(p => ({ ...p, month: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F872]/50"
              >
                {MONTHS.map(m => (
                  <option key={m.full} value={m.full}>{m.short}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => addItem('income')}
              className="bg-[#00F872] text-[#101112] font-bold rounded-xl p-2.5 hover:bg-[#00d762] transition-colors cursor-pointer shrink-0"
              aria-label="Bevétel hozzáadása"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Kiadások ──────────────────────────────────── */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Kiadások
          </h2>

          {/* List */}
          <div className="space-y-2 flex-1 mb-4">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-slate-950/50 border border-slate-800/60 rounded-xl px-4 py-3 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <span className={`text-[10px] font-medium uppercase mt-0.5 block ${
                    item.frequency === 'Havi'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {item.frequency}{item.frequency === 'Egyszeri' && item.month ? ` · ${item.month}` : ''}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-400 tabular-nums whitespace-nowrap">
                  {formatHuf(item.amount)}
                </span>
                <button
                  onClick={() => deleteExpense(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all cursor-pointer p-1"
                  aria-label="Törlés"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">Nincs kiadás hozzáadva.</p>
            )}
          </div>

          {/* Add form */}
          <div className="flex flex-wrap items-end gap-2 border-t border-slate-800/60 pt-4">
            <input
              type="text"
              placeholder="Megnevezés"
              value={newExpense.name}
              onChange={(e) => setNewExpense(p => ({ ...p, name: e.target.value }))}
              className="flex-1 min-w-[120px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400/50"
            />
            <input
              type="number"
              placeholder="Összeg"
              value={newExpense.amount}
              onChange={(e) => setNewExpense(p => ({ ...p, amount: e.target.value }))}
              className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-400/50"
            />
            <select
              value={newExpense.frequency}
              onChange={(e) => setNewExpense(p => ({ ...p, frequency: e.target.value }))}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-400/50"
            >
              <option value="Havi">Havi</option>
              <option value="Egyszeri">Egyszeri</option>
            </select>
            {newExpense.frequency === 'Egyszeri' && (
              <select
                value={newExpense.month}
                onChange={(e) => setNewExpense(p => ({ ...p, month: e.target.value }))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-400/50"
              >
                {MONTHS.map(m => (
                  <option key={m.full} value={m.full}>{m.short}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => addItem('expense')}
              className="bg-red-500 text-white font-bold rounded-xl p-2.5 hover:bg-red-600 transition-colors cursor-pointer shrink-0"
              aria-label="Kiadás hozzáadása"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. AI Warning Card ────────────────────────── */}
      {negativeMonths.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-300 mb-1">AI Figyelmeztetés – Negatív Cashflow</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {negativeMonths.length === 1
                ? `A(z) ${negativeMonths[0].name} hónapban negatív az egyenleged: `
                : `${negativeMonths.map(m => m.name).join(', ')} hónapokban negatív az egyenleged: `}
              {negativeMonths.map(m => (
                <span key={m.name} className="font-bold text-red-400 tabular-nums whitespace-nowrap">
                  {m.name} {formatHuf(m.nettó)}
                  {m !== negativeMonths[negativeMonths.length - 1] ? ', ' : ''}
                </span>
              ))}
              . Kérd az AI tanácsadó segítségét a helyzet javítására!
            </p>
          </div>
          <button
            onClick={triggerAiChat}
            className="bg-[#00F872] text-[#101112] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#00d762] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            AI Tanácsadó
          </button>
        </div>
      )}
    </div>
  );
}
