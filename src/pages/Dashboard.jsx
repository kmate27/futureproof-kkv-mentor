import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateMonthlyPulse } from '../lib/ai';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  Info,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatHufShort = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}e`;
  return value.toString();
};

const formatHuf = (value) => value.toLocaleString('hu-HU').replace(/\s/g, '.') + ' Ft';

const mockCashflowHistory = [
  { name: 'Jan', bevétel: 3800000, kiadás: 3200000 },
  { name: 'Feb', bevétel: 4100000, kiadás: 3400000 },
  { name: 'Már', bevétel: 3900000, kiadás: 3100000 },
  { name: 'Ápr', bevétel: 4500000, kiadás: 3500000 },
  { name: 'Máj', bevétel: 4100000, kiadás: 3300000 },
  { name: 'Jún', bevétel: 4250000, kiadás: 3180000 },
];

function ScoreRing({ score, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  let color = '#991B1B'; // Red 0-39
  let shadowColor = 'rgba(153, 27, 27, 0.4)';
  if (score >= 40 && score <= 69) {
    color = '#F59E0B'; // Yellow 40-69
    shadowColor = 'rgba(245, 158, 11, 0.4)';
  }
  if (score >= 70) {
    color = '#00F872'; // Neon Mint 70-100
    shadowColor = 'rgba(0, 248, 114, 0.4)';
  }

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--card-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0px 0px 6px ${shadowColor})`
          }}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-text-bright font-display tracking-tight transition-transform group-hover:scale-105 duration-250">
          {score}
        </span>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Pont</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-3 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
      <p className="font-bold text-text-bright mb-1">{label} Hónap</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name === 'bevétel' ? 'Bevétel' : 'Kiadás'}:
          </span>
          <span className="font-bold text-text-bright tabular-nums">{formatHuf(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_COMPANY = {
  name: 'Kovács Kft.',
  industry: 'Kereskedelem',
  revenue: '18M Ft',
  taxRegime: 'KATA',
  employees: '2'
};

export default function Dashboard() {
  const location = useLocation();
  const { incomes, expenses, annualRevenue } = useFinance();
  const companyData = location.state?.companyData || DEFAULT_COMPANY;

  const [pulse, setPulse] = useState(null);
  const [isPulseLoading, setIsPulseLoading] = useState(true);

  // Score metrics
  const scoreData = {
    cashflow: 35, // max 40
    ado: 14,      // max 35
    kintlevoseg: 17, // max 25
  };
  const totalScore = scoreData.cashflow + scoreData.ado + scoreData.kintlevoseg; // 66

  useEffect(() => {
    let cancelled = false;
    const fullCompanyData = { ...companyData, incomes, expenses, annualRevenue };
    
    generateMonthlyPulse(fullCompanyData).then((res) => {
      if (!cancelled) {
        setPulse(res);
        setIsPulseLoading(false);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes, expenses, annualRevenue]);

  const openAiChat = (prompt) => {
    const event = new CustomEvent('open-ai-chat', { detail: { prompt } });
    window.dispatchEvent(event);
  };

  const today = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-bright font-display tracking-tight flex items-center gap-2">
            Üdvözölünk, {companyData?.name || 'Kovács János'}!
          </h1>
          <p className="text-text-muted text-sm mt-1">Pénzügyi Vezérlőpult • {today}</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to="/onboarding"
            className="text-xs font-semibold text-text-muted bg-card-bg border border-card-border hover:border-primary/30 px-4.5 py-2.5 rounded-xl transition-all"
          >
            Adatok újrakalibrálása
          </Link>
          <button
            onClick={() => openAiChat(`Kérlek adj egy átfogó értékelést a vállalkozásomról a megadott profil alapján!`)}
            className="text-xs font-bold text-[#101112] bg-[#00F872] hover:bg-[#00d762] px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-[#00F872]/5 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Tanácsadás
          </button>
        </div>
      </div>

      {!location.state?.companyData && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-bright">Demo Mód — Kovács Kft. mintaadatokkal</h3>
            <p className="text-xs text-text-muted">
              Jelenleg előre beállított adatokkal látod a felületet. A valódi, 5 lépéses testreszabott modellezéshez menj végig az <Link to="/onboarding" className="text-blue-400 underline font-semibold">onboarding varázslón</Link>.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-center text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Éves Becsült Bevétel</span>
            <Calendar className="w-4 h-4 text-text-muted/65" />
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-extrabold text-text-bright font-display tabular-nums tracking-tight truncate" title={formatHuf(annualRevenue)}>
            {formatHuf(annualRevenue)}
          </p>
          <span className="text-[10px] text-[#00F872] font-semibold mt-1 block">Contextből dinamikusan kalkulálva</span>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-center text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Havi Bevétel</span>
            <TrendingUp className="w-4 h-4 text-text-muted/65" />
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-extrabold text-text-bright font-display tabular-nums tracking-tight truncate" title={formatHuf(4250000)}>
            {formatHuf(4250000)}
          </p>
          <span className="text-[10px] text-[#00F872] font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +3.5% előző hónaphoz képest
          </span>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-center text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Havi Kiadás</span>
            <TrendingDown className="w-4 h-4 text-text-muted/65" />
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-extrabold text-text-bright font-display tabular-nums tracking-tight truncate" title={formatHuf(3180000)}>
            {formatHuf(3180000)}
          </p>
          <span className="text-[10px] text-red-500 font-semibold mt-1 block flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -1.2% költségcsökkentés
          </span>
        </div>

        <div className="bg-card-bg border border-card-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-center text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Havi Eredmény</span>
            <Wallet className="w-4 h-4 text-text-muted/65" />
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-extrabold text-[#00F872] font-display tabular-nums tracking-tight truncate" title={formatHuf(1070000)}>
            +{formatHuf(1070000)}
          </p>
          <span className="text-[10px] text-text-muted font-semibold mt-1 block">
            Nettó havi profitmarzs: 25.1%
          </span>
        </div>
      </div>

      {/* KKV Score Card (Radial and Breakdown) */}
      <div className="bg-card-bg/70 rounded-2xl border border-card-border p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Ring left */}
          <div className="flex flex-col items-center flex-shrink-0">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6">Pénzügyi Egészség (KKV Score)</h3>
            <ScoreRing score={totalScore} />
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${
                totalScore >= 70 ? 'bg-[#00F872]' : totalScore >= 40 ? 'bg-amber-500' : 'bg-red-600'
              }`}></span>
              <span className="font-bold text-text-bright text-sm">
                {totalScore >= 70 ? 'Kiváló' : totalScore >= 40 ? 'Átlagos / Javítható' : 'Kritikus figyelmet igényel'}
              </span>
            </div>
          </div>

          {/* Breakdown right */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-input-bg/40 rounded-xl p-5 border border-card-border hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-xs font-bold text-text-muted uppercase whitespace-nowrap">Cashflow</span>
                <span className="text-sm font-bold text-[#00F872]">{scoreData.cashflow}/40</span>
              </div>
              <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-[#00F872]" style={{ width: `${(scoreData.cashflow/40)*100}%` }}></div>
              </div>
              <p className="text-[11px] text-text-muted mt-3.5 leading-relaxed">Pozitív havi zárások az utóbbi 3 negyedévben. Likviditás stabil.</p>
            </div>

            <div className="bg-input-bg/40 rounded-xl p-5 border border-card-border hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-xs font-bold text-text-muted uppercase whitespace-nowrap">Adózás</span>
                <span className="text-sm font-bold text-[#00F872]">{scoreData.ado}/35</span>
              </div>
              <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-[#00F872]" style={{ width: `${(scoreData.ado/35)*100}%` }}></div>
              </div>
              <p className="text-[11px] text-text-muted mt-3.5 leading-relaxed">Jelenlegi adónem (KATA) nem a legkedvezőbb az éves bevétel mellett.</p>
            </div>

            <div className="bg-input-bg/40 rounded-xl p-5 border border-card-border hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-xs font-bold text-text-muted uppercase whitespace-nowrap">Kintlévőség</span>
                <span className="text-sm font-bold text-amber-500">{scoreData.kintlevoseg}/25</span>
              </div>
              <div className="w-full h-1.5 bg-card-border rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(scoreData.kintlevoseg/25)*100}%` }}></div>
              </div>
              <p className="text-[11px] text-text-muted mt-3.5 leading-relaxed">Partner számlák átlagos fizetési csúszása meghaladja a 18 napot.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Pulse & Interactive charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: AI Pulse (Interactive spark card) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-blue-950/10 to-card-bg rounded-2xl border border-card-border p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#00F872] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#00F872]" />
              <h2 className="text-lg font-bold text-text-bright">Havi Pulzus (AI Mentor Elemzés)</h2>
            </div>

            {isPulseLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-[#00F872] animate-spin" />
                <p className="text-text-muted text-xs font-semibold tracking-wider uppercase">Vállalkozási adatok mély-elemzése...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-main text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {pulse?.summary}
                </p>

                {/* Simulated Interactive quick actions */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">AI javasolt kérdések erről:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openAiChat(`A havi pulzus elemzésedben említetted az adóoptimalizálást. Milyen konkrét lépéseket javasolsz a(z) ${companyData.name} cégem számára?`)}
                      className="text-xs bg-input-bg border border-input-border hover:border-primary/40 hover:bg-input-bg text-text-main hover:text-text-bright px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      💡 Adótanácsok részletesen
                    </button>
                    <button
                      onClick={() => openAiChat(`Mit tehetnék a kintlévőségek csökkentése érdekében? Említetted, hogy ez húzza le a score értékemet.`)}
                      className="text-xs bg-input-bg border border-input-border hover:border-primary/40 hover:bg-input-bg text-text-main hover:text-text-bright px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      📈 Kintlévőségek kezelése
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-card-border mt-6 flex justify-between items-center text-xs">
            <span className="text-text-muted font-medium">Vállalkozás: {companyData.industry} szektor</span>
            <button
              onClick={() => openAiChat("Elemezd a cégem havi pulzusát részletesebben!")}
              className="text-[#00F872] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Csevegés indítása <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Tax Alerts & Mini-Chart */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Tax Status Card */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-bright">
                <Calculator className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Adózási Optimalizáció</h3>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-2">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-text-bright text-xs block">Váltás javasolt</span>
                    <p className="text-[11px] text-text-muted mt-1">
                      A jelenlegi KATA adózás nem optimális az éves {formatHufShort(annualRevenue)} bevétel mellett.
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-input-bg/50 p-2.5 rounded-lg border border-card-border mt-2">
                  <span className="text-[10px] text-text-muted font-bold uppercase">Becsült megtakarítás</span>
                  <span className="text-[#00F872] font-bold text-xs">~468.000 Ft / év</span>
                </div>
              </div>
            </div>

            <Link
              to="/adozas"
              className="mt-6 inline-flex items-center justify-center gap-1.5 w-full text-xs font-bold text-text-bright bg-input-bg border border-input-border hover:border-primary/40 py-3 rounded-xl transition-all cursor-pointer"
            >
              Adókalkuláció megtekintése
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          </div>

          {/* Mini Cashflow Chart */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-text-bright">
                <TrendingUp className="w-5 h-5 text-[#00F872]" />
                <h3 className="font-bold text-sm">6 Hónapos Cashflow</h3>
              </div>
              <Link to="/cashflow" className="text-xs font-semibold text-blue-400 hover:underline">
                Részletek
              </Link>
            </div>

            {/* Interactive chart: click triggers chat context */}
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockCashflowHistory}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      const activeItem = mockCashflowHistory.find(h => h.name === data.activeLabel);
                      if (activeItem) {
                        openAiChat(`Szeretnék többet megtudni a(z) ${activeItem.name} havi bevételeimről (${formatHufShort(activeItem.bevétel)} Ft) és kiadásaimról (${formatHufShort(activeItem.kiadás)} Ft). Hogyan állt össze ez a cashflow egyenleg?`);
                      }
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="glowBevetel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F872" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00F872" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="glowKiadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#991B1B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#991B1B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="bevétel" stroke="#00F872" fill="url(#glowBevetel)" strokeWidth={2.5} name="bevétel" />
                  <Area type="monotone" dataKey="kiadás" stroke="#ef4444" fill="url(#glowKiadas)" strokeWidth={2} name="kiadás" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-[9px] text-text-muted font-bold uppercase tracking-wider mt-2.5 px-1">
              <span>Január</span>
              <span className="text-text-muted/70 italic cursor-help">Kattints a pontokra az elemzéshez!</span>
              <span>Június</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
