import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateMonthlyPulse } from '../lib/gemini';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const formatHufShort = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}e`;
  return value.toString();
};

const formatHuf = (value) => value.toLocaleString('hu-HU').replace(/\s/g, '.') + ' Ft';

const mockCashflow3Months = [
  { name: 'Ápr', bevétel: 4500000, kiadás: 3500000 },
  { name: 'Máj', bevétel: 4100000, kiadás: 3300000 },
  { name: 'Jún', bevétel: 4250000, kiadás: 3180000 },
];

function ScoreRing({ score, size = 180, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  let color = '#991B1B'; // Red 0-39
  if (score >= 40 && score <= 69) color = '#F59E0B'; // Yellow 40-69
  if (score >= 70) color = '#1A7A4A'; // Green 70-100

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
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
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-[#1E293B]">{score}</span>
        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider mt-1">Pont</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-[#E2E8F0] p-2 text-xs">
      <p className="font-semibold text-[#1E293B] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === 'bevétel' ? 'Bev' : 'Kiad'}: {formatHuf(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const companyData = location.state?.companyData || {
    name: 'Kovács Bt.',
    industry: 'Kereskedelem',
    revenue: '18M Ft',
    taxRegime: 'KATA',
    employees: '2'
  };

  const [pulse, setPulse] = useState(null);
  const [isPulseLoading, setIsPulseLoading] = useState(false);

  // Score számítás
  // Cashflow (40) + Adó (35) + Kintlévőség (25)
  // Demo célból fixáljuk ha nincs adat, vagy variáljuk
  const scoreData = {
    cashflow: 32, // max 40
    ado: 28,      // max 35
    kintlevoseg: 15, // max 25
  };
  const totalScore = scoreData.cashflow + scoreData.ado + scoreData.kintlevoseg; // 75

  useEffect(() => {
    // Csak ha van valami adat, vagy demo jelleggel mindig lehívjuk
    setIsPulseLoading(true);
    generateMonthlyPulse(companyData).then((res) => {
      setPulse(res);
      setIsPulseLoading(false);
    });
  }, [companyData]);

  const today = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            Üdvözlöm{companyData?.name ? `, ${companyData.name}` : '!'}
          </h1>
          <p className="text-[#64748B] mt-1">Pénzügyi áttekintés • {today}</p>
        </div>
      </div>

      {!location.state?.companyData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Demo Üzemmód: Kovács Bt.</h3>
            <p className="text-sm text-blue-600 mt-1">Az alkalmazás jelenleg egy minta felhasználó, a Kovács Bt. adatait mutatja. A személyre szabott elemzéshez adja meg saját cége paramétereit az Onboarding oldalon.</p>
          </div>
        </div>
      )}

      {/* KKV Score Szekció */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          <div className="flex flex-col items-center flex-shrink-0">
            <h2 className="text-lg font-bold text-[#1E293B] mb-6">KKV Score</h2>
            <ScoreRing score={totalScore} />
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${totalScore >= 70 ? 'bg-[#1A7A4A]' : totalScore >= 40 ? 'bg-[#F59E0B]' : 'bg-[#991B1B]'}`}></div>
              <span className="font-semibold text-[#1E293B]">
                {totalScore >= 70 ? 'Kiváló egészség' : totalScore >= 40 ? 'Átlagos' : 'Kritikus'}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-[#64748B]">Cashflow stabilitás</span>
                <span className="text-sm font-bold text-[#1F5FAD]">{scoreData.cashflow}/40</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1F5FAD]" style={{ width: `${(scoreData.cashflow/40)*100}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Kiegyensúlyozott bevétel-kiadás arány az elmúlt 3 hónapban.</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-[#64748B]">Adóoptimalizáltság</span>
                <span className="text-sm font-bold text-[#1A7A4A]">{scoreData.ado}/35</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1A7A4A]" style={{ width: `${(scoreData.ado/35)*100}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Megfelelő adózási forma, bár van még mozgástér a TAO irányába.</p>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-[#64748B]">Kintlévőség-arány</span>
                <span className="text-sm font-bold text-amber-500">{scoreData.kintlevoseg}/25</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(scoreData.kintlevoseg/25)*100}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">A kintlévőségek aránya kissé magas, érdemes behajtást kezdeményezni.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gyors Áttekintés - 3 oszlopos rács */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Havi Pulzus (AI) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Sparkles className="w-5 h-5 text-blue-100" />
            <h2 className="text-lg font-bold">Havi Pulzus (AI)</h2>
          </div>

          {isPulseLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 relative z-10">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-blue-100 text-sm">Adatok elemzése és tanácsok generálása...</p>
            </div>
          ) : (
            <div className="relative z-10 space-y-5">
              <p className="text-blue-50 text-sm leading-relaxed">
                {pulse?.summary}
              </p>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-3">Kiemelt Teendők</h3>
                <ul className="space-y-3">
                  {pulse?.tasks?.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-white">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/chat" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100 hover:text-white transition-colors">
                Részletes megbeszélés az asszisztenssel <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Jobb oldali oszlop: Adó + Cashflow */}
        <div className="space-y-6">
          
          {/* Adózási státusz */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-2 mb-4 text-[#1E293B]">
              <Calculator className="w-5 h-5 text-[#1F5FAD]" />
              <h2 className="text-base font-bold">Adózási Státusz</h2>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-amber-800 text-sm block">Váltás ajánlott</span>
                  <p className="text-xs text-amber-700 mt-1 mb-2">Az Ön bevételei alapján az Átalányadó helyett a KATA vagy TAO kedvezőbb lehet.</p>
                  <span className="inline-block bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                    Évi ~468.000 Ft megtakarítás
                  </span>
                </div>
              </div>
            </div>
            
            <Link to="/adozas" className="mt-4 flex items-center justify-center gap-2 w-full text-sm font-semibold text-[#1F5FAD] bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              Adókalkulátor megnyitása
            </Link>
          </div>

          {/* Mini Cashflow */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#1E293B]">
                <TrendingUp className="w-5 h-5 text-[#1A7A4A]" />
                <h2 className="text-base font-bold">Utolsó 3 hónap</h2>
              </div>
              <Link to="/cashflow" className="text-xs font-semibold text-[#1F5FAD] hover:underline">
                Részletek
              </Link>
            </div>
            
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockCashflow3Months} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="miniBevetel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="miniKiadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#991B1B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#991B1B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="bevétel" stroke="#1A7A4A" fill="url(#miniBevetel)" strokeWidth={2} />
                  <Area type="monotone" dataKey="kiadás" stroke="#991B1B" fill="url(#miniKiadas)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[#64748B] px-2">
              <span>Április</span>
              <span>Június</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
