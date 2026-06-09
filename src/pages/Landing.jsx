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
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: HeartPulse,
    title: 'Pénzügyi Egészségjelentés',
    description: 'Átfogó KKV Score és cashflow előrejelzés',
    color: '#1A7A4A',
    bg: '#ECFDF5',
  },
  {
    icon: Calculator,
    title: 'Adózási Tanácsadó',
    description: 'KATA, átalányadó, társasági adó összehasonlítás',
    color: '#1F5FAD',
    bg: '#EFF6FF',
  },
  {
    icon: FileText,
    title: 'Dokumentum Értelmező',
    description: 'NAV levelek és számlák azonnali elemzése',
    color: '#9333EA',
    bg: '#F5F3FF',
  },
  {
    icon: MessageSquare,
    title: 'AI Pénzügyi Chat',
    description: 'Kérdezz bármit a vállalkozásodról',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
];

const stats = [
  { icon: TrendingUp, value: '10,000+', label: 'KKV' },
  { icon: Shield, value: '95%', label: 'pontosság' },
  { icon: Clock, value: '24/7', label: 'elérhetőség' },
];

const steps = [
  { number: '1', title: 'Regisztráció', description: 'Hozd létre fiókodat pár kattintással' },
  { number: '2', title: 'Adatok megadása', description: 'Add meg vállalkozásod alapadatait' },
  { number: '3', title: 'Azonnali elemzés', description: 'Kapj személyre szabott tanácsokat' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter]">
      {/* ───────── Navbar ───────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#1F5FAD] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1E293B]">KKV Mentor</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors px-3 py-2"
            >
              Belépés
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1F5FAD] hover:bg-[#2E75B6] px-4 py-2 rounded-lg transition-colors"
            >
              Regisztráció
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden pt-16">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6]" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-72 h-72 rounded-full opacity-10 bg-white"
            style={{
              top: '10%',
              right: '-5%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-48 h-48 rounded-full opacity-10 bg-white"
            style={{
              bottom: '15%',
              left: '-3%',
              animation: 'float 6s ease-in-out infinite 1s',
            }}
          />
          <div
            className="absolute w-32 h-32 rounded-full opacity-[0.07] bg-white"
            style={{
              top: '40%',
              left: '30%',
              animation: 'float 10s ease-in-out infinite 2s',
            }}
          />
          <div
            className="absolute w-20 h-20 rounded-full opacity-10 bg-white"
            style={{
              top: '20%',
              left: '60%',
              animation: 'float 7s ease-in-out infinite 0.5s',
            }}
          />
          <div
            className="absolute w-56 h-56 rounded-full opacity-[0.06] bg-white"
            style={{
              bottom: '5%',
              right: '20%',
              animation: 'float 9s ease-in-out infinite 3s',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44 flex flex-col items-center text-center">
          {/* Glass card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-12 max-w-2xl w-full shadow-2xl">
            <span className="inline-block text-sm font-medium text-white/80 bg-white/15 rounded-full px-4 py-1.5 mb-6">
              🇭🇺 Magyar kisvállalkozásoknak
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              KKV Mentor
            </h1>
            <p className="text-lg sm:text-xl text-white/85 mb-8 leading-relaxed">
              AI-alapú pénzügyi tanácsadó magyar kisvállalkozásoknak
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#1F5FAD] font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Ingyenes regisztráció
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
              >
                Belépés
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4">
              Minden, amire szükséged van
            </h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              Komplex pénzügyi döntések egyszerűen, AI segítségével
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 group"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: f.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-2">{f.title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-[#1F5FAD]" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#1E293B]">{s.value}</span>
                  <span className="text-[#64748B] text-sm mt-1">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ───────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4">Hogyan működik?</h2>
            <p className="text-[#64748B] text-lg">Három egyszerű lépés a jobb pénzügyi döntésekhez</p>
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 sm:gap-0">
            {/* Connecting line – desktop only */}
            <div className="hidden sm:block absolute top-8 left-[16.666%] right-[16.666%] h-0.5 bg-[#E2E8F0]" />

            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center flex-1 relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#1F5FAD] text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-[#1F5FAD]/25">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-1">{step.title}</h3>
                <p className="text-sm text-[#64748B] max-w-[200px]">{step.description}</p>

                {/* Arrow between steps on mobile */}
                {i < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-[#E2E8F0] mt-4 sm:hidden rotate-90" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="py-20 bg-[#1E293B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Kezdd el most – ingyenes!
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Nincs rejtett költség. Próbáld ki a KKV Mentor-t, és hozz jobb pénzügyi döntéseket még ma.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-[#1F5FAD] hover:bg-[#2E75B6] text-white font-semibold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
          >
            Regisztrálok ingyen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-white border-t border-[#E2E8F0] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1F5FAD] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#1E293B]">KKV Mentor</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#64748B]">
              <Link to="/" className="hover:text-[#1E293B] transition-colors">Főoldal</Link>
              <Link to="/onboarding" className="hover:text-[#1E293B] transition-colors">Regisztráció</Link>
              <Link to="/dashboard" className="hover:text-[#1E293B] transition-colors">Dashboard</Link>
            </div>
            <p className="text-sm text-[#64748B]">
              © {new Date().getFullYear()} KKV Mentor. Minden jog fenntartva.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
