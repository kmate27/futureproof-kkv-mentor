import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Calculator,
  FileText,
  MessageSquare,
  ArrowRight,
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Database,
  Building,
  ArrowUpRight
} from 'lucide-react';

export default function Landing() {
  const [revenue, setRevenue] = useState(2500000);
  const [expense, setExpense] = useState(1800000);

  const runwayMonths = useMemo(() => {
    const net = revenue - expense;
    if (net >= 0) return '∞';
    return ((5000000) / Math.abs(net)).toFixed(1);
  }, [revenue, expense]);

  const formatHuf = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';

  return (
    <div className="min-h-screen bg-[#101112] text-white font-sans overflow-x-hidden selection:bg-[#00F872]/30 selection:text-white">
      {/* ───────── Fixed Navbar ───────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#101112]/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-display tracking-tight">KKV Mentor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 cursor-pointer"
            >
              Belépés
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#101112] bg-[#00F872] hover:bg-[#00d762] px-4 py-2 rounded-lg transition-all shadow-md shadow-[#00F872]/10 cursor-pointer"
            >
              Indítás ingyen
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── Hero Section with Interactive Sandbox ───────── */}
      <section className="relative pt-32 pb-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#101112]/0 to-[#101112]/0 pointer-events-none"></div>

        {/* Decorative Animated Shapes */}
        <div className="absolute top-24 left-10 w-96 h-96 bg-[#1F5FAD] opacity-[0.02] rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00F872] opacity-[0.02] rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left: Headlines */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00F872] bg-[#00F872]/10 border border-[#00F872]/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 2026-os Magyar Adó- és Pénzügyi Szabályozásokkal
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight">
                A KKV-d pénzügyi <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F872] to-blue-400">
                  irányítópultja.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                Tervezz Runway-t, hasonlítsd össze az adónemeket (KATA, átalányadó, KIVA, TAO) és fordítsd le a NAV leveleket másodpercek alatt az AI KKV Mentoroddal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center gap-2 bg-[#00F872] hover:bg-[#00d762] text-[#101112] font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-[#00F872]/10 hover:-translate-y-0.5 cursor-pointer text-base"
                >
                  Regisztráció Onboardingal
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 border border-slate-800 bg-slate-900/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-900 transition-all cursor-pointer text-base"
                >
                  Demo Fiók Megnyitása
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Hero Right: Interactive Sandbox Mockup */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/80 rounded-2xl border border-slate-850 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F872]/20 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-md">
                    Interaktív Homokozó
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-6">Pénzügyi Kifutó (Cash Runway) szimulátor</h3>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span>Tervezett havi bevétel</span>
                      <span className="text-[#00F872] font-semibold">{formatHuf(revenue)}</span>
                    </div>
                    <input
                      type="range"
                      min="500000"
                      max="10000000"
                      step="100000"
                      value={revenue}
                      onChange={(e) => setRevenue(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F872]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span>Tervezett havi kiadás</span>
                      <span className="text-red-500 font-semibold">{formatHuf(expense)}</span>
                    </div>
                    <input
                      type="range"
                      min="500000"
                      max="10000000"
                      step="100000"
                      value={expense}
                      onChange={(e) => setExpense(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F872]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-900/60 mt-6">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Havi Egyenleg</span>
                      <span className={`text-base font-bold block mt-1 ${revenue >= expense ? 'text-[#00F872]' : 'text-red-500'}`}>
                        {revenue >= expense ? '+' : ''}{formatHuf(revenue - expense)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Kifutási Idő</span>
                      <span className="text-base font-bold text-white block mt-1">
                        {runwayMonths === '∞' ? 'Végtelen (Biztonságos)' : `${runwayMonths} hónap`}
                      </span>
                    </div>
                  </div>

                  {/* SVG graphic forecast based on state */}
                  <div className="pt-4">
                    <span className="text-[10px] text-slate-500 uppercase block mb-3">6 hónapos készpénzállomány-becslés (5M kezdővel)</span>
                    <div className="h-20 flex items-end justify-between gap-2 px-1">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const balance = 5000000 + (revenue - expense) * (idx + 1);
                        const percent = Math.max(10, Math.min(100, (balance / 12000000) * 100));
                        const isNeg = balance < 0;
                        return (
                          <div key={idx} className="flex-1 flex flex-col gap-1 items-center">
                            <div className="w-full bg-slate-800 rounded-sm relative h-12 overflow-hidden flex items-end">
                              <div
                                className={`w-full transition-all duration-300 ${isNeg ? 'bg-red-500' : 'bg-gradient-to-t from-[#00F872]/80 to-[#00F872]'}`}
                                style={{ height: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[8px] text-slate-600 font-semibold">{idx + 1}H</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ───────── Trust Marquee Szekció ───────── */}
      <section className="py-8 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Integrált rendszerek és bankok</p>
          <div className="flex items-center justify-center gap-12 sm:gap-20 flex-wrap opacity-50 grayscale hover:opacity-85 transition-opacity duration-300">
            <span className="font-display font-bold text-sm tracking-widest text-slate-400">🏛️ NAV API</span>
            <span className="font-display font-bold text-sm tracking-widest text-slate-400">🧾 SZÁMLÁZZ.HU</span>
            <span className="font-display font-bold text-sm tracking-widest text-slate-400">🚀 BILINGO</span>
            <span className="font-display font-bold text-sm tracking-widest text-slate-400">💳 OTP BANK</span>
            <span className="font-display font-bold text-sm tracking-widest text-slate-400">✨ ERSTE CONNECT</span>
          </div>
        </div>
      </section>

      {/* ───────── Bento Grid Features Section ───────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">
              Mindent lát a cég pénzügyeiben.
            </h2>
            <p className="text-slate-400 text-lg">
              Az intelligens modulok közvetlenül összekapcsolódnak az állami és banki adatbázisokkal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Score & Cashflow (Large Column) */}
            <div className="md:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#00F872]/10 flex items-center justify-center border border-[#00F872]/20">
                  <HeartPulse className="w-6 h-6 text-[#00F872]" />
                </div>
                <h3 className="text-xl font-bold">Pénzügyi Egészségjelentés & KKV Score</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  Rendszeres elemzés a cashflow stabilitásáról, a kintlévőségekről és a tőkehelyzetről. Az AI folyamatosan figyeli a cég állapotát és KKV Score indexet számít, hogy lásd hol állsz a versenytársaidhoz képest.
                </p>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> Banki szinkronizáció</span>
                <span className="text-[#00F872] font-semibold">Aktív és automatikus</span>
              </div>
            </div>

            {/* Card 2: Tax Advice */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Calculator className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Adózási Tanácsadó</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automatizált összehasonlítás a KATA, átalányadó és a KIVA/TAO között. Az aktuális cashflow adatok alapján azonnal jelzi, ha adómegtakarítási lehetőség nyílik.
                </p>
              </div>
              <Link to="/onboarding" className="text-xs font-semibold text-[#00F872] hover:underline flex items-center gap-1">
                Kalkuláció indítása <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Card 3: Document Analyzer */}
            <div className="bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">NAV Dokumentum Értelmező</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Másold be vagy húzd be a hivatalos NAV leveleket. Az AI lefordítja száraz jogi nyelvről pontos teendőkre és a naptárba helyezi a határidőket.
                </p>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">point-and-click ocr</span>
            </div>

            {/* Card 4: AI Financial Chat (Large Column) */}
            <div className="md:col-span-2 bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between gap-6 hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <MessageSquare className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold">Nem-általános AI chat, ami ismeri a céged</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  Vége a listázó, HR stílusú AI válaszoknak. Az asszisztens beépül a cégadatokba, ismeri a cégnevet, a 2026-os legfrissebb adótörvényeket, és pontos forint összegekkel válaszol a konkrét kérdéseidre.
                </p>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><Building className="w-4 h-4 text-amber-500" /> Vállalkozói személyiség</span>
                <span className="text-white font-medium">„KKV Mentor” magyar hangvétel</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────── CTA Section ───────── */}
      <section className="py-24 bg-gradient-to-t from-slate-950 via-[#101112] to-[#101112] border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">Kezdd el ma a digitális pénzügyi tervezést</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Vedd kezedbe a cég cashflow irányítását. Az onboarding mindössze 3 percet vesz igénybe.
          </p>
          <div className="pt-4">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 bg-[#00F872] hover:bg-[#00d762] text-[#101112] font-bold px-10 py-4.5 rounded-xl transition-all shadow-lg shadow-[#00F872]/10 hover:-translate-y-0.5 text-lg"
            >
              Regisztrálok ingyenesen
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white font-display">KKV Mentor</span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link to="/onboarding" className="hover:text-white transition-colors">Regisztráció</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/cashflow" className="hover:text-white transition-colors">Cashflow</Link>
            </div>
            
            <p>© {new Date().getFullYear()} KKV Mentor. Minden jog fenntartva.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
