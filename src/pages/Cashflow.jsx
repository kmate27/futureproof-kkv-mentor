import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Settings,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const MONTHS = ['Júl', 'Aug', 'Szept', 'Okt', 'Nov', 'Dec'];
const categories = {
  inflow: ['Kereskedelmi bevételek', 'Webáruház bevételek', 'Egyéb bevételek'],
  outflow: ['Alkalmazotti bérek', 'Irodabérlet & rezsi', 'Marketing & Szoftver', 'Adók & Járulékok', 'Egyéb kiadások']
};

export default function Cashflow() {
  const { incomes, expenses, setIncomes, setExpenses } = useFinance();
  const [selectedCell, setSelectedCell] = useState(null); // { type: 'inflow'|'outflow', category: string, month: string }
  const [cellValue, setCellValue] = useState('');
  const [cellGrowth, setCellGrowth] = useState('0'); // Growth %
  const [activeScenario, setActiveScenario] = useState('baseline'); // 'baseline' or 'optimistic'
  
  // Custom cell overrides stored in local state
  const [ledgerOverrides, setLedgerOverrides] = useState({
    inflow: {},
    outflow: {}
  });

  const formatHuf = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';
  const formatHufShort = (val) => {
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(0)}e`;
    return val.toString();
  };

  // Helper to resolve cell values (picks defaults from context or overrides)
  const getCellValue = (type, category, month) => {
    if (ledgerOverrides[type][`${category}-${month}`] !== undefined) {
      return ledgerOverrides[type][`${category}-${month}`];
    }
    
    // Fallback to base averages from context
    if (type === 'inflow') {
      if (category === 'Kereskedelmi bevételek') return 1500000;
      if (category === 'Webáruház bevételek') return 800000;
      return 280000; // Egyéb bevételek
    } else {
      if (category === 'Alkalmazotti bérek') return 1130000;
      if (category === 'Irodabérlet & rezsi') return 350000;
      if (category === 'Marketing & Szoftver') return 200000;
      if (category === 'Adók & Járulékok') return 425000;
      return 150000; // Egyéb kiadások
    }
  };

  // Calculate monthly inflow, outflow totals and forecast scenarios
  const monthlyTotals = useMemo(() => {
    return MONTHS.map((month, idx) => {
      let totalIn = 0;
      let totalOut = 0;

      categories.inflow.forEach(cat => {
        totalIn += getCellValue('inflow', cat, month);
      });

      categories.outflow.forEach(cat => {
        totalOut += getCellValue('outflow', cat, month);
      });

      const baselineNet = totalIn - totalOut;
      
      // Optimistic scenario adds 15% revenue growth compound and 5% lower expenses
      const optIn = totalIn * Math.pow(1.05, idx);
      const optOut = totalOut * 0.95;
      const optimisticNet = optIn - optOut;

      return {
        name: month,
        bevétel: totalIn,
        kiadás: totalOut,
        netCashflow: baselineNet,
        optimisticNet: Math.round(optimisticNet)
      };
    });
  }, [ledgerOverrides]);

  const handleCellClick = (type, category, month) => {
    setSelectedCell({ type, category, month });
    setCellValue(getCellValue(type, category, month).toString());
    setCellGrowth('0');
  };

  const handleSaveCell = () => {
    if (!selectedCell) return;
    const value = parseFloat(cellValue) || 0;
    const key = `${selectedCell.category}-${selectedCell.month}`;
    
    setLedgerOverrides(prev => {
      const nextOverrides = { ...prev[selectedCell.type] };
      nextOverrides[key] = value;
      
      // Apply growth forward if selected
      const growthPct = parseFloat(cellGrowth) / 100;
      if (growthPct !== 0) {
        const startIdx = MONTHS.indexOf(selectedCell.month);
        let currentVal = value;
        for (let i = startIdx + 1; i < MONTHS.length; i++) {
          currentVal = Math.round(currentVal * (1 + growthPct));
          nextOverrides[`${selectedCell.category}-${MONTHS[i]}`] = currentVal;
        }
      }

      return {
        ...prev,
        [selectedCell.type]: nextOverrides
      };
    });

    setSelectedCell(null);
  };

  const triggerAiHelp = () => {
    const minNet = Math.min(...monthlyTotals.map(t => t.netCashflow));
    const openChat = (prompt) => {
      const event = new CustomEvent('open-ai-chat', { detail: { prompt } });
      window.dispatchEvent(event);
    };
    openChat(`A cashflow táblázatomat vizsgálva az optimális forgatókönyv alapján a legkisebb havi nettó eredményem ${formatHuf(minNet)}. Milyen költségcsökkentési vagy bevételnövelési javaslataid vannak a KKV Mentorunkként?`);
  };

  // Recharts composed tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl text-xs space-y-2">
          <p className="font-bold text-white mb-1">{label} Hónap</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6 text-slate-400">
              <span>Alap Bevétel:</span>
              <span className="font-bold text-white">{formatHuf(payload[0].payload.bevétel)}</span>
            </p>
            <p className="flex justify-between gap-6 text-slate-400">
              <span>Alap Kiadás:</span>
              <span className="font-bold text-red-500">-{formatHuf(payload[0].payload.kiadás)}</span>
            </p>
            <p className="flex justify-between gap-6 text-slate-400 border-t border-slate-800 pt-1.5 mt-1">
              <span>Baseline Nettó:</span>
              <span className={`font-bold ${payload[0].payload.netCashflow >= 0 ? 'text-[#00F872]' : 'text-red-500'}`}>
                {formatHuf(payload[0].payload.netCashflow)}
              </span>
            </p>
            <p className="flex justify-between gap-6 text-slate-400">
              <span>Optimistic Nettó:</span>
              <span className="font-bold text-blue-400">{formatHuf(payload[0].payload.optimisticNet)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-850 pb-5">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Vissza a Dashboardra
          </Link>
          <h1 className="text-3xl font-extrabold font-display tracking-tight flex items-center gap-2">
            Pénzügyi Ledger & Szimulátor
          </h1>
          <p className="text-slate-400 text-sm mt-1">Interaktív cashflow táblázat Agicap és Runway stílusú forgatókönyv-modellezéssel</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveScenario('baseline')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeScenario === 'baseline'
                ? 'bg-[#1F5FAD] border-[#1F5FAD] text-white shadow-md'
                : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
          >
            Baseline Forgatókönyv
          </button>
          <button
            onClick={() => setActiveScenario('optimistic')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              activeScenario === 'optimistic'
                ? 'bg-[#00F872] border-[#00F872] text-[#101112] font-bold shadow-md shadow-[#00F872]/5'
                : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:text-white'
            }`}
          >
            Optimistic (+15% Bevétel)
          </button>
        </div>
      </div>

      {/* Composed Chart Section */}
      <div className="bg-slate-900/30 rounded-2xl border border-slate-850 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F872]" /> Scenario Elemző Grafikon
          </h3>
          <button
            onClick={triggerAiHelp}
            className="text-xs bg-slate-950/60 border border-slate-850 hover:border-slate-700 hover:bg-slate-950 text-[#00F872] font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Költségoptimalizálás
          </button>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTotals} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={formatHufShort} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              <Bar dataKey="bevétel" name="Bevétel (Baseline)" fill="#00F872" opacity={0.15} radius={[4, 4, 0, 0]} barSize={35} />
              <Bar dataKey="kiadás" name="Kiadás (Baseline)" fill="#ef4444" opacity={0.12} radius={[4, 4, 0, 0]} barSize={35} />
              
              <Line
                type="monotone"
                dataKey={activeScenario === 'baseline' ? 'netCashflow' : 'optimisticNet'}
                name={activeScenario === 'baseline' ? 'Baseline Nettó Cashflow' : 'Optimistic Nettó Cashflow'}
                stroke={activeScenario === 'baseline' ? '#00F872' : '#3b82f6'}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Unified Ledger Grid Matrix */}
      <div className="bg-slate-900/30 rounded-2xl border border-slate-850 overflow-hidden">
        <div className="p-5 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400" /> Cash Ledger Mátrix
          </span>
          <span className="text-[10px] text-slate-500 italic">Kattints bármelyik cellára a közvetlen érték vagy havi növekedési arány szerkesztéséhez!</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/25 border-b border-slate-850 text-slate-400 text-xs font-semibold">
                <th className="px-6 py-4 min-w-[200px]">Pénzügyi Kategóriák</th>
                {MONTHS.map(m => (
                  <th key={m} className="px-4 py-4 text-right">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-sm">
              
              {/* --- INFLOWS --- */}
              <tr className="bg-[#00F872]/[0.02] font-semibold text-slate-300">
                <td className="px-6 py-3 text-xs uppercase tracking-wider text-[#00F872]/85">Bejövő tranzakciók (Inflow)</td>
                {MONTHS.map(m => (
                  <td key={m} className="px-4 py-3 text-right"></td>
                ))}
              </tr>

              {categories.inflow.map(cat => (
                <tr key={cat} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-3.5 text-slate-400 font-medium">{cat}</td>
                  {MONTHS.map(month => {
                    const val = getCellValue('inflow', cat, month);
                    return (
                      <td
                        key={month}
                        onClick={() => handleCellClick('inflow', cat, month)}
                        className="px-4 py-3.5 text-right font-medium tabular-nums cursor-pointer hover:bg-slate-950/50 hover:text-[#00F872] transition-colors relative"
                      >
                        {formatHuf(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* --- OUTFLOWS --- */}
              <tr className="bg-red-500/[0.01] font-semibold text-slate-300">
                <td className="px-6 py-3 text-xs uppercase tracking-wider text-red-400/85">Kimenő tranzakciók (Outflow)</td>
                {MONTHS.map(m => (
                  <td key={m} className="px-4 py-3 text-right"></td>
                ))}
              </tr>

              {categories.outflow.map(cat => (
                <tr key={cat} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-3.5 text-slate-400 font-medium">{cat}</td>
                  {MONTHS.map(month => {
                    const val = getCellValue('outflow', cat, month);
                    return (
                      <td
                        key={month}
                        onClick={() => handleCellClick('outflow', cat, month)}
                        className="px-4 py-3.5 text-right font-medium tabular-nums cursor-pointer hover:bg-slate-950/50 hover:text-red-400 transition-colors relative"
                      >
                        {formatHuf(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* --- SUMMARY NET --- */}
              <tr className="bg-slate-950/60 border-t-2 border-slate-800 font-bold text-white text-base">
                <td className="px-6 py-4">Nettó Havi Egyenleg (Cashflow)</td>
                {monthlyTotals.map(t => (
                  <td
                    key={t.name}
                    className={`px-4 py-4 text-right tabular-nums ${
                      t.netCashflow >= 0 ? 'text-[#00F872]' : 'text-red-500'
                    }`}
                  >
                    {t.netCashflow >= 0 ? '+' : ''}{formatHuf(t.netCashflow)}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Popover Editor Modal (Clean inline simulator modal) */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div>
              <h3 className="font-bold text-white text-base">Cella Szerkesztése</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kategória: {selectedCell.category} ({selectedCell.month})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Új összeg (Ft)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={cellValue}
                    onChange={(e) => setCellValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F872]"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-bold">Ft</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Automatikus növekedési ráta / hó</label>
                <select
                  value={cellGrowth}
                  onChange={(e) => setCellGrowth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F872]"
                >
                  <option value="0">Stagnál (0% változás)</option>
                  <option value="2">+2% növekedés havonta</option>
                  <option value="5">+5% növekedés havonta</option>
                  <option value="10">+10% növekedés havonta</option>
                  <option value="-5">-5% visszaesés havonta</option>
                  <option value="-10">-10% visszaesés havonta</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={handleSaveCell}
                className="px-4.5 py-2 text-xs font-bold text-[#101112] bg-[#00F872] hover:bg-[#00d762] rounded-xl transition-all cursor-pointer"
              >
                Mentés & Frissítés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
