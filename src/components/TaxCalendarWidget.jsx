import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  FileCheck
} from 'lucide-react';

const DEADLINES = [
  {
    regimes: ['KATA'],
    title: 'Havi KATA tételes adó befizetés',
    desc: '50.000 Ft fix összegű adó megfizetése az adóhatóság felé.',
    date: 'Minden hónap 12.',
    severity: 'info',
    status: 'pending'
  },
  {
    regimes: ['KATA', 'Átalányadó', 'KIVA', 'TAO Kft.'],
    title: 'Havi/Negyedéves ÁFA bevallás',
    desc: 'A fizetendő és levonható ÁFA elszámolása és bevallása.',
    date: 'Minden hónap 20.',
    severity: 'warning',
    status: 'pending'
  },
  {
    regimes: ['Átalányadó'],
    title: 'Havi járulékbevallás és járulékfizetés',
    desc: 'TB járulék és SZOCHO bevallása és megfizetése a minimálbér alapján.',
    date: 'Minden hónap 12.',
    severity: 'warning',
    status: 'pending'
  },
  {
    regimes: ['TAO Kft.', 'KIVA'],
    title: 'Társasági adó (TAO) / KIVA előleg fizetés',
    desc: 'A becsült negyedéves eredmény utáni adóelőleg megfizetése.',
    date: 'Negyedévente 20.',
    severity: 'info',
    status: 'completed'
  },
  {
    regimes: ['KATA', 'Átalányadó', 'KIVA', 'TAO Kft.'],
    title: 'Helyi Iparűzési Adó (HIPA) befizetés',
    desc: 'Az önkormányzat felé fizetendő HIPA első részletének megfizetése.',
    date: 'Szeptember 15.',
    severity: 'info',
    status: 'pending'
  },
  {
    regimes: ['TAO Kft.'],
    title: 'Kft. Éves beszámoló & Társasági adó bevallás',
    desc: 'Az előző üzleti év beszámolójának letétbe helyezése és a TAO bevallása.',
    date: 'Május 31.',
    severity: 'critical',
    status: 'completed'
  }
];

export default function TaxCalendarWidget({ activeRegime }) {
  const { annualRevenue } = useFinance();

  // Threshold limits
  const KATA_LIMIT = 18000000;
  const AFA_LIMIT = 12000000;

  // Filter deadlines based on active regime
  const filteredDeadlines = useMemo(() => {
    return DEADLINES.filter(d => d.regimes.includes(activeRegime));
  }, [activeRegime]);

  // Calculations for thresholds
  const kataProgress = Math.min(100, (annualRevenue / KATA_LIMIT) * 100);
  const afaProgress = Math.min(100, (annualRevenue / AFA_LIMIT) * 100);

  const formatHuf = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';

  return (
    <div className="space-y-6 text-text-main">
      {/* SECTION 1: Compliance Progress Bars (Thresholds) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ÁFA Limit Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-4 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm text-text-bright">ÁFA Alanyi Adómentesség</h4>
              <p className="text-[11px] text-text-muted mt-0.5">Éves alanyi adómentes keret (12M Ft)</p>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              annualRevenue >= AFA_LIMIT ? 'bg-red-500/10 text-red-500' : 'bg-neon-mint/10 text-neon-mint-text'
            }`}>
              {annualRevenue >= AFA_LIMIT ? 'ÁFA köteles' : 'Adómentes'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-input-bg border border-card-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  annualRevenue >= AFA_LIMIT ? 'bg-red-500' : 'bg-neon-mint'
                }`}
                style={{ width: `${afaProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted font-medium">
              <span>{formatHuf(annualRevenue)}</span>
              <span>Keret: {formatHuf(AFA_LIMIT)}</span>
            </div>
          </div>

          {annualRevenue >= AFA_LIMIT * 0.8 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex gap-2 text-[11px] text-amber-500">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>AI Figyelmeztetés:</strong> Közeledik az ÁFA határ! Javasoljuk a kimenő számlák ütemezését vagy a cégforma felülvizsgálatát.
              </p>
            </div>
          )}
        </div>

        {/* KATA Limit Card */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 space-y-4 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm text-text-bright">KATA Éves Értékhatár</h4>
              <p className="text-[11px] text-text-muted mt-0.5">Éves fix adózási értékhatár (18M Ft)</p>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              annualRevenue >= KATA_LIMIT ? 'bg-red-500/10 text-red-500' : 'bg-neon-mint/10 text-neon-mint-text'
            }`}>
              {annualRevenue >= KATA_LIMIT ? '40% adóteher' : 'KATA alatt'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-input-bg border border-card-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  annualRevenue >= KATA_LIMIT ? 'bg-red-500' : 'bg-neon-mint'
                }`}
                style={{ width: `${kataProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted font-medium">
              <span>{formatHuf(annualRevenue)}</span>
              <span>Keret: {formatHuf(KATA_LIMIT)}</span>
            </div>
          </div>

          {annualRevenue >= KATA_LIMIT && (
            <div className="bg-red-600/5 border border-red-600/10 rounded-xl p-3 flex gap-2 text-[11px] text-red-500">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Figyelem:</strong> Túllépted a KATA bevételi határt! A 18M Ft feletti részre 40%-os büntetőadó fizetendő. Azonnali adómód-váltás javasolt!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Vertical Compliance Deadlines Timeline */}
      <div className="bg-card-bg/70 border border-card-border rounded-2xl p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-neon-mint-text" />
          <h3 className="font-bold text-sm text-text-muted uppercase tracking-widest">Compliance Határidő Napló ({activeRegime})</h3>
        </div>

        <div className="space-y-6 relative border-l border-card-border ml-4 pl-6">
          {filteredDeadlines.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isWarning = item.severity === 'warning';
            const isCritical = item.severity === 'critical';

            return (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all group-hover:scale-110 ${
                  isCompleted 
                    ? 'bg-bg-main border-neon-mint' 
                    : isCritical
                    ? 'bg-red-950 border-red-500 animate-pulse'
                    : isWarning
                    ? 'bg-amber-950 border-amber-500'
                    : 'bg-bg-main border-card-border'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-2.5 h-2.5 text-neon-mint-text" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                  )}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-muted bg-input-bg border border-card-border px-2 py-0.5 rounded-md">
                      {item.date}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted ? 'text-neon-mint-text' : 'text-text-muted'
                    }`}>
                      {isCompleted ? 'Teljesítve' : 'Teendő'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-text-bright pt-1">{item.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed max-w-xl">{item.desc}</p>
                </div>
              </div>
            );
          })}

          {filteredDeadlines.length === 0 && (
            <p className="text-xs text-text-muted italic">Nincs rögzített határidő ehhez az adózási formához.</p>
          )}
        </div>
      </div>
    </div>
  );
}
