import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateCashflowWarning, parseCustomScenario } from '../lib/gemini';
import {
  Wallet, TrendingUp, TrendingDown, Plus, Trash2, ChevronLeft, 
  Lightbulb, AlertTriangle, Users, UserMinus, Monitor, Sparkles, X, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

// Segédfüggvény a formázáshoz
const formatMoney = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';

const INITIAL_INCOMES = [
  { id: 1, name: 'Fő kliens (Kovács Kft.)', amount: 1200000, frequency: 'Havi' },
  { id: 2, name: 'Webáruház bevételek', amount: 800000, frequency: 'Havi' }
];

const INITIAL_EXPENSES = [
  { id: 1, name: 'Irodabérlet', amount: 350000, frequency: 'Havi' },
  { id: 2, name: 'Alkalmazotti bérek', amount: 1200000, frequency: 'Havi' },
  { id: 3, name: 'Marketing & Szoftverek', amount: 200000, frequency: 'Havi' },
  { id: 4, name: 'Éves iparűzési adó befizetés', amount: 650000, frequency: 'Egyszeri', month: 'Október' }
];

const MONTHS = ['Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November'];

export default function Cashflow() {
  // Szekció 1: Adatok
  const [incomes, setIncomes] = useState(INITIAL_INCOMES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  
  // Új tételekhez
  const [newIncName, setNewIncName] = useState('');
  const [newIncAmount, setNewIncAmount] = useState('');
  const [newIncFreq, setNewIncFreq] = useState('Havi');
  const [newIncMonth, setNewIncMonth] = useState('Június');
  
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpFreq, setNewExpFreq] = useState('Havi');
  const [newExpMonth, setNewExpMonth] = useState('Június');

  // Szekció 3: Szimuláció
  const [scenario, setScenario] = useState(null); // { type, amount, frequency, name }
  const [activeModal, setActiveModal] = useState(null); // 'employee', 'client', 'asset', 'custom'
  const [modalInput, setModalInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Figyelmeztetés
  const [warningText, setWarningText] = useState('');
  const [isWarningLoading, setIsWarningLoading] = useState(false);

  // --- LOGIKA: TÉTEL HOZZÁADÁS/TÖRLÉS ---
  const addIncome = () => {
    if (!newIncName || !newIncAmount) return;
    setIncomes([...incomes, { id: Date.now(), name: newIncName, amount: Number(newIncAmount), frequency: newIncFreq, month: newIncFreq === 'Egyszeri' ? newIncMonth : null }]);
    setNewIncName(''); setNewIncAmount('');
  };

  const addExpense = () => {
    if (!newExpName || !newExpAmount) return;
    setExpenses([...expenses, { id: Date.now(), name: newExpName, amount: Number(newExpAmount), frequency: newExpFreq, month: newExpFreq === 'Egyszeri' ? newExpMonth : null }]);
    setNewExpName(''); setNewExpAmount('');
  };

  const deleteIncome = (id) => setIncomes(incomes.filter(i => i.id !== id));
  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  // --- LOGIKA: ELŐREJELZÉS SZÁMÍTÁSA ---
  const chartData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const monthIncomes = incomes.filter(inc => 
        inc.frequency === 'Havi' || 
        (inc.frequency === 'Egyszeri' && inc.month === month) ||
        (inc.frequency === 'Negyedéves' && index % 3 === 0)
      );
      
      const monthExpenses = expenses.filter(exp => 
        exp.frequency === 'Havi' || 
        (exp.frequency === 'Egyszeri' && exp.month === month) ||
        (exp.frequency === 'Negyedéves' && index % 3 === 0)
      );

      const monthlyIncomeTotal = monthIncomes.reduce((sum, item) => sum + item.amount, 0);
      const monthlyExpenseTotal = monthExpenses.reduce((sum, item) => sum + item.amount, 0);
      
      const dynamicNet = monthlyIncomeTotal - monthlyExpenseTotal;
      let scenarioNet = dynamicNet;
      
      if (scenario) {
        // Szcenárió alkalmazása
        if (scenario.frequency === 'one-time') {
          // Csak az első hónapban (vagy a következő hónapban)
          if (index === 0) {
            scenarioNet += (scenario.type === 'income' ? scenario.amount : -scenario.amount);
          }
        } else {
          // Havi
          scenarioNet += (scenario.type === 'income' ? scenario.amount : -scenario.amount);
        }
      }

      return {
        name: month,
        baseNet: dynamicNet,
        scenarioNet: scenario ? scenarioNet : null,
      };
    });
  }, [incomes, expenses, scenario]);

  // --- LOGIKA: AI FIGYELMEZTETÉS ---
  useEffect(() => {
    const badMonths = chartData.filter(d => d.baseNet < 0).map(d => d.name);
    if (badMonths.length > 0) {
      const fetchWarning = async () => {
        setIsWarningLoading(true);
        const advice = await generateCashflowWarning(badMonths, [...incomes, ...expenses]);
        setWarningText(advice);
        setIsWarningLoading(false);
      };
      fetchWarning();
    } else {
      setWarningText('');
    }
  }, [incomes, expenses]); // Csak az alapadatok változásakor, szimulációkor nem

  // --- LOGIKA: SZIMULÁCIÓK KEZELÉSE ---
  const applyScenario = async () => {
    if (!modalInput) return;
    
    if (activeModal === 'employee') {
      setScenario({ type: 'expense', amount: Number(modalInput), frequency: 'monthly', name: 'Új alkalmazott' });
    } else if (activeModal === 'client') {
      setScenario({ type: 'expense', amount: Number(modalInput), frequency: 'monthly', name: 'Ügyfél elvesztése' }); // Bevétel kiesés = expense jellegű hatás a netre
    } else if (activeModal === 'asset') {
      setScenario({ type: 'expense', amount: Number(modalInput), frequency: 'one-time', name: 'Eszközvásárlás' });
    } else if (activeModal === 'custom') {
      setIsAiLoading(true);
      const parsed = await parseCustomScenario(modalInput);
      setScenario(parsed);
      setIsAiLoading(false);
    }
    
    setActiveModal(null);
    setModalInput('');
  };

  const clearScenario = () => setScenario(null);

  // Kiemelések számítása
  const bestMonth = [...chartData].sort((a, b) => b.baseNet - a.baseNet)[0];
  const worstMonth = [...chartData].sort((a, b) => a.baseNet - b.baseNet)[0];

  // Egyéni Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-[#E2E8F0]">
          <p className="font-bold text-[#1E293B] mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              Eredeti egyenleg: <span className="font-semibold">{formatMoney(payload[0].value)}</span>
            </p>
            {payload[1] && (
              <p className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1F5FAD]"></span>
                Szimulált egyenleg: <span className="font-semibold">{formatMoney(payload[1].value)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5FAD] to-[#2E75B6] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Vissza a Dashboardra
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cashflow és Szimulátor</h1>
              <p className="text-white/80 mt-1">Tervezze meg vállalkozása jövőjét intelligens előrejelzésekkel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* SZEKCIÓ 1: Adatbevitel (Két oszlopos grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bevételek */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-2 mb-4 text-[#1A7A4A]">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-bold">Rendszeres Bevételek</h2>
            </div>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
              {incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div>
                    <p className="font-semibold text-sm text-[#1E293B]">{inc.name}</p>
                    <p className="text-xs text-green-700">{inc.frequency === 'Egyszeri' ? `${inc.frequency} (${inc.month})` : inc.frequency}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#1A7A4A]">+{formatMoney(inc.amount)}</span>
                    <button onClick={() => deleteIncome(inc.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && <p className="text-sm text-slate-500 italic">Nincsenek bevételek rögzítve.</p>}
            </div>

            <div className="flex flex-wrap gap-2 items-end bg-slate-50 p-3 rounded-lg border border-[#E2E8F0]">
              <div className="flex-1 min-w-[120px]">
                <input 
                  type="text" placeholder="Megnevezés" value={newIncName} onChange={e => setNewIncName(e.target.value)}
                  className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#1A7A4A] outline-none"
                />
              </div>
              <div className="w-1/4 min-w-[80px]">
                <input 
                  type="number" placeholder="Összeg" value={newIncAmount} onChange={e => setNewIncAmount(e.target.value)}
                  className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#1A7A4A] outline-none"
                />
              </div>
              <div className="w-1/4 min-w-[100px]">
                <select value={newIncFreq} onChange={e => setNewIncFreq(e.target.value)} className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#1A7A4A] outline-none">
                  <option value="Havi">Havi</option>
                  <option value="Egyszeri">Egyszeri</option>
                  <option value="Negyedéves">Negyedéves</option>
                </select>
              </div>
              {newIncFreq === 'Egyszeri' && (
                <div className="w-1/4 min-w-[100px]">
                  <select value={newIncMonth} onChange={e => setNewIncMonth(e.target.value)} className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#1A7A4A] outline-none">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <button onClick={addIncome} className="p-2 bg-[#1A7A4A] text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Kiadások */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-2 mb-4 text-[#991B1B]">
              <TrendingDown className="w-5 h-5" />
              <h2 className="text-lg font-bold">Rendszeres Kiadások</h2>
            </div>
            
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
              {expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-red-50/30 rounded-lg border border-red-100">
                  <div>
                    <p className="font-semibold text-sm text-[#1E293B]">{exp.name}</p>
                    <p className="text-xs text-red-700">{exp.frequency === 'Egyszeri' ? `${exp.frequency} (${exp.month})` : exp.frequency}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#991B1B]">-{formatMoney(exp.amount)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-sm text-slate-500 italic">Nincsenek kiadások rögzítve.</p>}
            </div>

            <div className="flex flex-wrap gap-2 items-end bg-slate-50 p-3 rounded-lg border border-[#E2E8F0]">
              <div className="flex-1 min-w-[120px]">
                <input 
                  type="text" placeholder="Megnevezés" value={newExpName} onChange={e => setNewExpName(e.target.value)}
                  className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#991B1B] outline-none"
                />
              </div>
              <div className="w-1/4 min-w-[80px]">
                <input 
                  type="number" placeholder="Összeg" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)}
                  className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#991B1B] outline-none"
                />
              </div>
              <div className="w-1/4 min-w-[100px]">
                <select value={newExpFreq} onChange={e => setNewExpFreq(e.target.value)} className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#991B1B] outline-none">
                  <option value="Havi">Havi</option>
                  <option value="Egyszeri">Egyszeri</option>
                  <option value="Negyedéves">Negyedéves</option>
                </select>
              </div>
              {newExpFreq === 'Egyszeri' && (
                <div className="w-1/4 min-w-[100px]">
                  <select value={newExpMonth} onChange={e => setNewExpMonth(e.target.value)} className="w-full text-sm p-2 bg-transparent border-b border-slate-300 focus:border-[#991B1B] outline-none">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <button onClick={addExpense} className="p-2 bg-[#991B1B] text-white rounded-lg hover:bg-red-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Banner ha baj van */}
        {warningText && (
          <div className="bg-gradient-to-r from-red-50 to-amber-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 font-bold mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Likviditási Figyelmeztetés
              </h3>
              {isWarningLoading ? (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Elemzés folyamatban...
                </div>
              ) : (
                <p className="text-red-900 text-sm">{warningText}</p>
              )}
            </div>
          </div>
        )}

        {/* SZEKCIÓ 2: Vizuális Előrejelző */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">6 Hónapos Készpénz-előrejelzés</h2>
              <p className="text-sm text-slate-500 mt-1">A várható havi nettó egyenlegek (Be - Ki)</p>
            </div>
            
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase">Legjobb hónap</p>
                <p className="font-bold text-[#1A7A4A]">{formatMoney(bestMonth.baseNet)}</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase">Legrosszabb</p>
                <p className={`font-bold ${worstMonth.baseNet < 0 ? 'text-[#991B1B]' : 'text-slate-700'}`}>
                  {formatMoney(worstMonth.baseNet)}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                {scenario && <Legend verticalAlign="top" height={36}/>}
                
                {/* Eredeti Oszlop */}
                <Bar 
                  dataKey="baseNet" 
                  name="Eredeti Cashflow" 
                  fill={scenario ? "#CBD5E1" : "#1F5FAD"} // Ha van szimuláció, szürkítjük az eredetit
                  radius={[4, 4, 0, 0]}
                  barSize={scenario ? 30 : 50}
                >
                  {!scenario && chartData.map((entry, index) => {
                    // Dinamikus színezés csak ha nincs szimuláció, hogy egyértelmű legyen
                    let color = '#EAB308'; // Sárga (0-500k)
                    if (entry.baseNet > 500000) color = '#1A7A4A'; // Zöld
                    if (entry.baseNet < 0) color = '#991B1B'; // Piros
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>

                {/* Szimulált Oszlop (Csak ha van) */}
                {scenario && (
                  <Bar 
                    dataKey="scenarioNet" 
                    name={scenario.name}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  >
                    {chartData.map((entry, index) => {
                      let color = '#EAB308';
                      if (entry.scenarioNet > 500000) color = '#1A7A4A';
                      if (entry.scenarioNet < 0) color = '#991B1B';
                      return <Cell key={`cell-sim-${index}`} fill={color} />;
                    })}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SZEKCIÓ 3: Mi van ha Szimulátor */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              "Mi van ha?" Szimulátor
            </h2>
            {scenario && (
              <button onClick={clearScenario} className="text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1">
                <X className="w-4 h-4"/> Szimuláció törlése
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveModal('employee')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${activeModal === 'employee' || scenario?.name === 'Új alkalmazott' ? 'border-[#1F5FAD] bg-blue-50 text-[#1F5FAD]' : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-slate-700 hover:shadow-md'}`}
            >
              <Users className="w-8 h-8" />
              <span className="font-semibold text-sm">Új alkalmazott felvétele</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('client')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${activeModal === 'client' || scenario?.name === 'Ügyfél elvesztése' ? 'border-[#991B1B] bg-red-50 text-[#991B1B]' : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-slate-700 hover:shadow-md'}`}
            >
              <UserMinus className="w-8 h-8" />
              <span className="font-semibold text-sm">Elveszítek egy ügyfelet</span>
            </button>

            <button 
              onClick={() => setActiveModal('asset')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${activeModal === 'asset' || scenario?.name === 'Eszközvásárlás' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-slate-700 hover:shadow-md'}`}
            >
              <Monitor className="w-8 h-8" />
              <span className="font-semibold text-sm">Eszközt veszek</span>
            </button>

            <button 
              onClick={() => setActiveModal('custom')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${activeModal === 'custom' || scenario?.name === 'Saját terv' ? 'border-[#1A7A4A] bg-green-50 text-[#1A7A4A]' : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-slate-700 hover:shadow-md'}`}
            >
              <Sparkles className="w-8 h-8" />
              <span className="font-semibold text-sm">Saját forgatókönyv (AI)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1E293B]">
                {activeModal === 'employee' && 'Új alkalmazott felvétele'}
                {activeModal === 'client' && 'Ügyfél elvesztése'}
                {activeModal === 'asset' && 'Eszközvásárlás'}
                {activeModal === 'custom' && 'Saját forgatókönyv'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              {activeModal === 'custom' ? (
                <>
                  <p className="text-sm text-slate-600 mb-3">
                    Írd le a tervedet saját szavaiddal! Az AI megérti és lefordítja pénzügyi szimulációvá.
                  </p>
                  <textarea 
                    autoFocus
                    placeholder="Pl.: Novemberben szeretnék felvenni egy asszisztenst havi 300 ezerért, és venni neki egy laptopot 400 ezerért."
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F5FAD] h-32 resize-none"
                  ></textarea>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-3">
                    {activeModal === 'employee' && 'Mekkora az új munkatárs becsült havi bruttó bérköltsége?'}
                    {activeModal === 'client' && 'Mekkora havi bevételkiesést jelent ez az ügyfél?'}
                    {activeModal === 'asset' && 'Mekkora az egyszeri beruházás összege?'}
                  </p>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="number" 
                      placeholder="Összeg"
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      className="w-full rounded-xl border border-[#E2E8F0] p-4 pr-12 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#1F5FAD]"
                    />
                    <span className="absolute right-4 top-4 font-bold text-slate-400">Ft</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Mégse
              </button>
              <button 
                onClick={applyScenario}
                disabled={!modalInput || isAiLoading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1F5FAD] hover:bg-[#2E75B6] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Szimulálás
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
