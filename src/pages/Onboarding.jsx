import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFinance } from '../context/FinanceContext';
import {
  User,
  Building2,
  Database,
  Sliders,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Link2,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const STEP_META = [
  { icon: User, label: 'Profil & Célok' },
  { icon: Building2, label: 'Cégadatok' },
  { icon: Database, label: 'Integrációk' },
  { icon: Sliders, label: 'Runway Szimuláció' },
  { icon: CheckCircle, label: 'Összegzés' },
];

const INDUSTRIES = ['Kereskedelem', 'Szolgáltatás', 'IT', 'Gyártás', 'Építőipar', 'Vendéglátás', 'Egyéb'];
const COMPANY_TYPES = ['Egyéni vállalkozó', 'Bt.', 'Kft.', 'Zrt.', 'Nonprofit'];
const INTENTS = [
  { id: 'tax', label: 'Adóoptimalizálás', desc: 'Szeretném csökkenteni a cégem adóterheit.' },
  { id: 'cashflow', label: 'Cashflow tervezés', desc: 'Látni akarom a jövőbeli bevételeket és kiadásokat.' },
  { id: 'nav', label: 'Hivatalos levelek fordítása', desc: 'NAV levelek és határozatok gyors AI elemzése.' },
  { id: 'general', label: 'Pénzügyi egészség követése', desc: 'Általános mentorálás és vezetői tanácsadás.' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setIncomes, setExpenses } = useFinance();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    intent: 'tax',
    companyName: '',
    companyType: 'Kft.',
    industry: 'IT',
    // Runway variables
    monthlyRevenue: 2300000,
    monthlyExpense: 1500000,
    cashBalance: 5000000,
    // Integrations connected
    connected: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConnection, setActiveConnection] = useState(null);
  const [connectionState, setConnectionState] = useState(0); // 0: Idle, 1: Connecting, 2: Success

  // Connections list
  const integrations = [
    { id: 'nav', name: 'NAV (Adóhatóság)', desc: 'Számlák és adóbevallások lekérése', icon: '🏛️' },
    { id: 'szamlazz', name: 'Számlázz.hu / Billings', desc: 'Kimenő számlák szinkronizálása', icon: '🧾' },
    { id: 'bank', name: 'OTP / Erste Bank API', desc: 'Banki tranzakciók lekérése', icon: '💳' }
  ];

  const handleConnect = (integration) => {
    setActiveConnection(integration);
    setConnectionState(1);
    
    // Simulate connection steps
    setTimeout(() => {
      setConnectionState(2);
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          connected: [...prev.connected, integration.id]
        }));
        setActiveConnection(null);
        setConnectionState(0);
      }, 1000);
    }, 1500);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName.trim() !== '' && formData.email.trim() !== '';
      case 1:
        return formData.companyName.trim() !== '' && formData.industry !== '' && formData.companyType !== '';
      default:
        return true;
    }
  };

  const next = () => {
    if (isStepValid()) {
      setCurrentStep(s => Math.min(s + 1, STEP_META.length - 1));
    }
  };

  const back = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  // Runway calculations
  const runwayStats = useMemo(() => {
    const revenue = formData.monthlyRevenue;
    const expense = formData.monthlyExpense;
    const balance = formData.cashBalance;
    const netCashflow = revenue - expense;
    
    if (netCashflow >= 0) {
      return {
        runwayMonths: Infinity,
        burnRate: 0,
        status: 'safe',
        statusText: 'Pozitív cashflow (a tartalék növekszik)'
      };
    } else {
      const burn = Math.abs(netCashflow);
      const months = balance / burn;
      let status = 'safe';
      let statusText = 'Biztonságos cash runway';
      
      if (months < 6) {
        status = 'critical';
        statusText = 'Kritikus runway (< 6 hónap)';
      } else if (months < 12) {
        status = 'warning';
        statusText = 'Figyelmeztető runway (< 12 hónap)';
      }

      return {
        runwayMonths: parseFloat(months.toFixed(1)),
        burnRate: burn,
        status,
        statusText
      };
    }
  }, [formData.monthlyRevenue, formData.monthlyExpense, formData.cashBalance]);

  // Generate mock transaction data on success based on onboarding values
  const setupMockData = () => {
    const rev = formData.monthlyRevenue;
    const exp = formData.monthlyExpense;
    
    // Create base incomes
    const defaultIncomes = [
      { id: 1, name: 'Fő partner (Szolgáltatás)', amount: Math.round(rev * 0.7), frequency: 'Havi' },
      { id: 2, name: 'Kisebb ügyfelek bevételei', amount: Math.round(rev * 0.3), frequency: 'Havi' }
    ];

    // Create base expenses
    const defaultExpenses = [
      { id: 1, name: 'Bérköltségek', amount: Math.round(exp * 0.5), frequency: 'Havi' },
      { id: 2, name: 'Irodabérlet & rezsi', amount: Math.round(exp * 0.25), frequency: 'Havi' },
      { id: 3, name: 'Marketing & Szoftverek', amount: Math.round(exp * 0.25), frequency: 'Havi' }
    ];

    setIncomes(defaultIncomes);
    setExpenses(defaultExpenses);
  };

  const finish = async () => {
    setIsSubmitting(true);
    setupMockData();

    try {
      // Create user profile / update company in Supabase
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          name: formData.companyName,
          industry: formData.industry,
          employee_count: '1-2', // Default mapping
          monthly_revenue_range: formData.monthlyRevenue >= 2000000 ? '20M+ Ft' : '5-20M Ft',
          tax_regime: formData.companyType === 'Egyéni vállalkozó' ? 'KATA' : 'TAO Kft.',
          main_expenses: ['Bérek', 'Irodabérlet', 'Szoftverek']
        }])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert skipped or failed:', error.message);
      }

      // Save onboarding data in localStorage so Dashboard can pick it up
      const onboardingData = {
        ...formData,
        runwayMonths: runwayStats.runwayMonths === Infinity ? '∞' : runwayStats.runwayMonths,
        burnRate: runwayStats.burnRate,
        status: runwayStats.status,
        companyId: data?.id || 'demo-id'
      };
      localStorage.setItem('kkv_onboarding_data', JSON.stringify(onboardingData));

      // Quick timeout for visual effect
      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/dashboard', { state: { companyData: { name: formData.companyName, industry: formData.industry, taxRegime: formData.companyType === 'Egyéni vállalkozó' ? 'KATA' : 'TAO Kft.', revenue: (formData.monthlyRevenue * 12).toLocaleString() + ' Ft' } } });
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      navigate('/dashboard');
    }
  };

  const formatHuf = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';

  return (
    <div className="min-h-screen bg-[#101112] text-white flex flex-col font-sans selection:bg-[#00F872]/30 selection:text-white">
      {/* ── Top Header ── */}
      <div className="bg-[#101112] border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight text-white">KKV Mentor</span>
          </Link>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full">
            {currentStep + 1} / {STEP_META.length} lépés
          </span>
        </div>
      </div>

      {/* ── Progress Indicators ── */}
      <div className="bg-slate-950/20 py-4 border-b border-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2">
            {STEP_META.map((step, i) => {
              const StepIcon = step.icon;
              const isPast = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPast ? 'bg-[#00F872]' : isActive ? 'bg-[#1F5FAD]' : 'bg-slate-800'
                      }`}
                      style={{ width: isPast || isActive ? '100%' : '0%' }}
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 mt-1 text-[11px] font-medium tracking-tight">
                    <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F872]' : isPast ? 'text-slate-400' : 'text-slate-600'}`} />
                    <span className={isActive ? 'text-white font-semibold' : 'text-slate-500'}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Step Body ── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#1F5FAD] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

          {/* Step 0: Profile & Intent */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Üdvözlünk a KKV Mentorban!</h2>
                <p className="text-sm text-slate-400">Kérlek add meg a személyes elérhetőségeidet a fiókod létrehozásához.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Teljes Név</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Minta János"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#1F5FAD] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail Cím</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="janos@cegnev.hu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#1F5FAD] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Telefonszám (opcionális)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+36 30 123 4567"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#1F5FAD] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Mi a legfőbb célod az alkalmazással?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INTENTS.map(intent => (
                      <button
                        key={intent.id}
                        onClick={() => setFormData({ ...formData, intent: intent.id })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.intent === intent.id
                            ? 'border-[#00F872] bg-[#00F872]/5'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        }`}
                      >
                        <span className={`block font-bold text-sm ${formData.intent === intent.id ? 'text-[#00F872]' : 'text-white'}`}>
                          {intent.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-1">{intent.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Vállalkozásod adatai</h2>
                <p className="text-sm text-slate-400">Ezek alapján fogjuk kiszámítani a rád vonatkozó adószabályokat és lehetőségeket.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cégnév</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Példa Kft."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#1F5FAD] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Vállalkozási forma</label>
                    <select
                      value={formData.companyType}
                      onChange={e => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1F5FAD] transition-colors appearance-none"
                    >
                      {COMPANY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Iparág</label>
                    <select
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1F5FAD] transition-colors appearance-none"
                    >
                      {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Integrations */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Adatkapcsolatok (Integrációk)</h2>
                <p className="text-sm text-slate-400">Kapcsold be a kívánt adatforrásokat, hogy az AI automatikusan elemezhesse a számláid és bankszámla kivonatod.</p>
              </div>

              <div className="space-y-4">
                {integrations.map(item => {
                  const isConnected = formData.connected.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isConnected
                          ? 'border-[#00F872]/40 bg-[#00F872]/5'
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-850">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <span className="flex items-center gap-1.5 text-[#00F872] text-xs font-semibold px-3 py-1.5 bg-[#00F872]/10 rounded-full border border-[#00F872]/20">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Összekapcsolva
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnect(item)}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-[#1F5FAD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Kapcsolódás
                        </button>
                      )}
                    </div>
                  );
                })}

                <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-4 text-xs text-slate-500 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#00F872] shrink-0 mt-0.5" />
                  <p>
                    <strong>Tipp a zsűrinek:</strong> Kattints a Kapcsolódás gombokra a csodás összeköttetési animáció megtekintéséhez! Az integrációk teljesen szimulálva vannak.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Runway Simulation */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Pénzügyi Runway szimuláció</h2>
                <p className="text-sm text-slate-400">Állítsd be a becsült bevételeidet és kiadásaidat a cash runway és az optimális tartalék kiszámításához.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Kezdő Készpénzállomány</span>
                      <span className="text-white font-bold">{formatHuf(formData.cashBalance)}</span>
                    </div>
                    <input
                      type="range"
                      min="1000000"
                      max="20000000"
                      step="500000"
                      value={formData.cashBalance}
                      onChange={e => setFormData({ ...formData, cashBalance: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F872]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Becsült Havi Bevétel</span>
                      <span className="text-[#00F872] font-bold">{formatHuf(formData.monthlyRevenue)}</span>
                    </div>
                    <input
                      type="range"
                      min="500000"
                      max="15000000"
                      step="100000"
                      value={formData.monthlyRevenue}
                      onChange={e => setFormData({ ...formData, monthlyRevenue: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F872]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Becsült Havi Kiadás</span>
                      <span className="text-red-500 font-bold">{formatHuf(formData.monthlyExpense)}</span>
                    </div>
                    <input
                      type="range"
                      min="500000"
                      max="10000000"
                      step="100000"
                      value={formData.monthlyExpense}
                      onChange={e => setFormData({ ...formData, monthlyExpense: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F872]"
                    />
                  </div>
                </div>

                {/* Live SVG Burn Chart & Stats */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-5 space-y-4 flex flex-col justify-center">
                  <div className="text-center">
                    <span className="block text-xs font-medium text-slate-500 uppercase">Cash Runway</span>
                    <span className="block text-4xl font-extrabold text-white mt-1">
                      {runwayStats.runwayMonths === Infinity ? '∞' : `${runwayStats.runwayMonths} hó`}
                    </span>
                    <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      runwayStats.status === 'safe'
                        ? 'bg-green-500/10 text-[#00F872]'
                        : runwayStats.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {runwayStats.statusText}
                    </span>
                  </div>

                  {/* SVG forecast bar representation */}
                  <div className="h-16 flex items-end justify-between gap-1.5 px-4 pt-2">
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const balanceAtMonth = formData.cashBalance + (formData.monthlyRevenue - formData.monthlyExpense) * (idx + 1);
                      const heightPercent = Math.max(10, Math.min(100, (balanceAtMonth / 15000000) * 100));
                      const isNegative = balanceAtMonth < 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-slate-800 rounded-sm relative h-10 overflow-hidden flex items-end">
                            <div
                              className={`w-full transition-all duration-300 ${isNegative ? 'bg-red-600' : 'bg-[#00F872]'}`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-slate-600">{idx + 1}M</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Minden készen áll!</h2>
                <p className="text-sm text-slate-400">Kérlek ellenőrizd az adataidat az indítás előtt.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-5 rounded-xl border border-slate-850">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Tulajdonos:</span>
                    <span className="font-semibold text-white">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Cég neve:</span>
                    <span className="font-semibold text-white">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Vállalkozási forma:</span>
                    <span className="font-semibold text-white">{formData.companyType}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Iparág:</span>
                    <span className="font-semibold text-white">{formData.industry}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm sm:border-l sm:border-slate-850 sm:pl-4">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Cash Balance:</span>
                    <span className="font-semibold text-[#00F872]">{formatHuf(formData.cashBalance)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Havi Cashflow:</span>
                    <span className={`font-semibold ${formData.monthlyRevenue >= formData.monthlyExpense ? 'text-[#00F872]' : 'text-red-500'}`}>
                      {formData.monthlyRevenue >= formData.monthlyExpense ? '+' : ''}
                      {formatHuf(formData.monthlyRevenue - formData.monthlyExpense)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Connected Feeds:</span>
                    <span className="font-semibold text-white">{formData.connected.length} db</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">Célkitűzés:</span>
                    <span className="font-semibold text-white">
                      {INTENTS.find(i => i.id === formData.intent)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            {currentStep > 0 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/20 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Vissza
              </button>
            ) : (
              <span />
            )}

            {currentStep < STEP_META.length - 1 ? (
              <button
                onClick={next}
                disabled={!isStepValid()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#101112] bg-[#00F872] hover:bg-[#00d762] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00F872]/10 cursor-pointer"
              >
                Tovább
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F5FAD] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Befejezés és Elemzés
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Connection Modal ── */}
      {activeConnection && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-center">
              {connectionState === 1 ? (
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                  <Loader2 className="w-6 h-6 text-[#1F5FAD] animate-spin" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                  <Check className="w-6 h-6 text-[#00F872] stroke-[3]" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-white">
                {connectionState === 1 ? 'Kapcsolat felépítése...' : 'Kapcsolódás sikeres!'}
              </h4>
              <p className="text-xs text-slate-400">
                {connectionState === 1
                  ? `Biztonságos kapcsolat létrehozása a(z) ${activeConnection.name} szerverével...`
                  : `A(z) ${activeConnection.name} adatkapcsolat sikeresen szinkronizálva.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitting Overlay ── */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
          <div className="space-y-4 text-center max-w-sm">
            <Loader2 className="w-10 h-10 text-[#00F872] animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Személyre szabott pénzügyi modell felépítése...</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tranzakciók kategorizálása, 6 hónapos cashflow szimuláció betöltése és a 2026-os legfrissebb adószabályok kalibrálása a cégprofilodhoz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
