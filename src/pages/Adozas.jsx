import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { generateTaxAdvice } from '../lib/ai';
import TaxCalendarWidget from '../components/TaxCalendarWidget';
import {
  Calculator,
  ChevronLeft,
  Sparkles,
  Loader2,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';

import { useFinance } from '../context/FinanceContext';

const REGIMES = ['KATA', 'Átalányadó', 'KIVA', 'TAO Kft.'];

export default function Adozas() {
  const { annualRevenue } = useFinance();
  const [revenue, setRevenue] = useState(annualRevenue || 18000000); // Raw number
  const [currentRegime, setCurrentRegime] = useState('KATA');
  const [employees, setEmployees] = useState(0);
  const [isCalculated, setIsCalculated] = useState(true); // Default to true so it shows results instantly
  
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculations based on 2026 Hungarian tax rules
  const taxes = useMemo(() => {
    const rev = revenue;
    
    // KATA: Évi 600.000 Ft. Ha > 18M, akkor a 18M feletti részre 40% büntetőadó.
    const kata = rev > 18000000 ? 600000 + (rev - 18000000) * 0.4 : 600000;
    
    // Átalányadó (2026): bevétel 55%-a az adóalap (45% költséghányad). Adómentes: 1.936.800 Ft jövedelem. Adó: 46.5%.
    const jovedelem = rev * 0.55;
    const adoalap = Math.max(0, jovedelem - 1936800);
    const atalany = adoalap * 0.465;
    
    // Alkalmazott éves bérköltség (2026 garantált bérminimum bruttó 373.200 Ft + 13% SZOCHO = kb 5.060.000 Ft/év)
    const personnelCost = employees * 5060000;
    
    // KIVA: 10% a személyi jellegű kifizetésekre
    const kiva = personnelCost * 0.10;
    
    // TAO: 9% nyereségadó. (A 13% szocho már benne van a bérköltségben, de a különbség miatt itt is hozzáadjuk a tao-hoz egy tiszta összehasonlításhoz)
    const profit = Math.max(0, rev - personnelCost);
    const tao = (profit * 0.09) + (employees * 373200 * 12 * 0.13);

    return {
      'KATA': Math.round(kata),
      'Átalányadó': Math.round(atalany),
      'KIVA': Math.round(kiva),
      'TAO Kft.': Math.round(tao)
    };
  }, [revenue, employees]);

  const bestRegime = Object.keys(taxes).reduce((a, b) => taxes[a] < taxes[b] ? a : b);
  const currentTax = taxes[currentRegime];

  const handleAiAdvice = async () => {
    setIsAiLoading(true);
    const result = await generateTaxAdvice({
      revenue,
      currentRegime,
      employees,
      taxes: {
        kata: taxes['KATA'],
        atalany: taxes['Átalányadó'],
        kiva: taxes['KIVA'],
        tao: taxes['TAO Kft.']
      }
    });
    setAiAdvice(result);
    setIsAiLoading(false);
  };

  const openAiChat = (prompt) => {
    const event = new CustomEvent('open-ai-chat', { detail: { prompt } });
    window.dispatchEvent(event);
  };

  const formatMoney = (val) => Math.round(val).toLocaleString('hu-HU').replace(/\s/g, '.') + ' Ft';

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-text-main">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-card-border pb-5">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-bright transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Vissza a Dashboardra
          </Link>
          <h1 className="text-3xl font-extrabold font-display tracking-tight flex items-center gap-2 text-text-bright">
            Adózási Tanácsadó
          </h1>
          <p className="text-text-muted text-sm mt-1">Hasonlítsa össze adóterheit és ellenőrizze határidőit a legújabb 2026-os magyar törvények alapján</p>
        </div>
      </div>

      {/* SECTION 1: Gyors diagnosztika */}
      <div className="bg-card-bg/70 rounded-2xl border border-card-border p-6 sm:p-8 transition-colors duration-200">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-500" /> Vállalkozási paraméterek beállítása
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders Left */}
          <div className="lg:col-span-7 space-y-6 w-full">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                <span>Várható éves bevétel</span>
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1000000}
                    max={60000000}
                    value={revenue}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v)) setRevenue(Math.min(60000000, Math.max(1000000, v)));
                    }}
                    className="bg-input-bg border border-input-border rounded-lg px-3 py-1 text-sm text-neon-mint-text font-bold tabular-nums w-40 text-right focus:outline-none focus:border-neon-mint"
                  />
                  <span className="text-neon-mint-text font-bold text-sm">Ft</span>
                </span>
              </div>
              <input 
                type="range" 
                min="1000000" 
                max="60000000" 
                step="10000"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-neon-mint"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>1M Ft</span>
                <span>60M Ft</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                <span>Alkalmazottak száma (fő)</span>
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={employees}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v)) setEmployees(Math.min(10, Math.max(0, v)));
                    }}
                    className="bg-input-bg border border-input-border rounded-lg px-3 py-1 text-sm text-text-bright font-bold tabular-nums w-20 text-right focus:outline-none focus:border-neon-mint"
                  />
                  <span className="text-text-bright font-bold text-sm">fő</span>
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>0 fő (Egyéni vállalkozó)</span>
                <span>10 fő</span>
              </div>
            </div>
          </div>

          {/* Radios Right */}
          <div className="lg:col-span-5 w-full space-y-3">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Jelenlegi adózási forma</label>
            <div className="grid grid-cols-2 gap-3">
              {REGIMES.map((regime) => (
                <button
                  key={regime}
                  onClick={() => setCurrentRegime(regime)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    currentRegime === regime
                      ? 'border-blue-500 bg-blue-500/5 text-blue-400 font-bold'
                      : 'border-card-border bg-input-bg/40 text-text-muted hover:border-primary/30'
                  }`}
                >
                  <span className="text-sm block">{regime}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Comparison Grid */}
      {isCalculated && (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-2xl transition-colors duration-200">
            <div className="p-5 border-b border-card-border bg-input-bg/20 flex justify-between items-center">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-neon-mint-text" /> Adóterhek Összehasonlító Mátrixa (2026)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-input-bg/40 border-b border-card-border text-text-muted text-xs font-semibold">
                    <th className="px-6 py-4 min-w-[220px]">Adózási Mutatók</th>
                    {REGIMES.map((regime) => {
                      const isBest = regime === bestRegime;
                      const isCurrent = regime === currentRegime;
                      return (
                        <th key={regime} className={`px-4 py-4 text-center ${isBest ? 'bg-neon-mint/[0.02]' : ''}`}>
                          <div className="flex flex-col items-center">
                            <span className={`text-sm sm:text-base font-bold whitespace-nowrap ${isBest ? 'text-neon-mint-text' : 'text-text-bright'}`}>
                              {regime}
                            </span>
                            {isCurrent && (
                              <span className="mt-1 text-[9px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">Jelenlegi</span>
                            )}
                            {isBest && (
                              <span className="mt-1 text-[9px] uppercase font-bold text-[#101112] bg-neon-mint px-2 py-0.5 rounded-full">Legjobb</span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60 text-sm">
                  {/* Éves adóteher */}
                  <tr className="hover:bg-card-bg/30">
                    <td className="px-6 py-4 text-text-muted font-medium">Éves adóteher (becsült)</td>
                    {REGIMES.map((regime) => {
                      const isBest = regime === bestRegime;
                      return (
                        <td key={regime} className={`px-4 py-4 text-center font-bold text-sm sm:text-base tabular-nums whitespace-nowrap ${isBest ? 'text-neon-mint-text bg-neon-mint/[0.02]' : 'text-text-bright'}`}>
                          {formatMoney(taxes[regime])}
                        </td>
                      );
                    })}
                  </tr>
                  
                  {/* Megtakarítás */}
                  <tr className="hover:bg-card-bg/30">
                    <td className="px-6 py-4 text-text-muted font-medium">Megtakarítás a jelenlegihez képest</td>
                    {REGIMES.map((regime) => {
                      const isBest = regime === bestRegime;
                      const diff = currentTax - taxes[regime];
                      const isPositive = diff > 0;
                      
                      return (
                        <td key={regime} className={`px-4 py-4 text-center font-bold text-sm tabular-nums whitespace-nowrap ${isBest ? 'bg-neon-mint/[0.02]' : ''} ${isPositive ? 'text-neon-mint-text' : diff === 0 ? 'text-text-muted' : 'text-red-500'}`}>
                          {diff === 0 ? (
                            <span>Alapértelmezett</span>
                          ) : (
                            <span>{isPositive ? '+' : ''}{formatMoney(diff)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Adminisztráció */}
                  <tr className="hover:bg-card-bg/30">
                    <td className="px-6 py-4 text-text-muted font-medium">Adminisztrációs teher</td>
                    <td className={`px-4 py-4 text-center text-xs font-semibold text-neon-mint-text ${bestRegime === 'KATA' ? 'bg-neon-mint/[0.02]' : ''}`}>Alacsony</td>
                    <td className={`px-4 py-4 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 ${bestRegime === 'Átalányadó' ? 'bg-neon-mint/[0.02]' : ''}`}>Közepes</td>
                    <td className={`px-4 py-4 text-center text-xs font-semibold text-red-500 ${bestRegime === 'KIVA' ? 'bg-neon-mint/[0.02]' : ''}`}>Magas</td>
                    <td className={`px-4 py-4 text-center text-xs font-semibold text-red-500 ${bestRegime === 'TAO Kft.' ? 'bg-neon-mint/[0.02]' : ''}`}>Magas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Advisor Panel */}
          <div className="bg-gradient-to-r from-blue-950/10 to-card-bg rounded-2xl border border-card-border p-6 relative overflow-hidden transition-colors duration-200">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-neon-mint opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Sparkles className="w-5 h-5 text-neon-mint-text" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-bright">AI Szakértői Vélemény</h3>
                  <p className="text-xs text-text-muted">Magyar adójogszabályok szerinti elemzés</p>
                </div>
              </div>
              
              {!aiAdvice && !isAiLoading ? (
                <div className="space-y-4">
                  <p className="text-text-main text-sm leading-relaxed max-w-2xl">
                    Kérj az AI adótanácsadótól egy részletes, szöveges elemzést, amely bemutatja az átmenetet a jelenlegi adónemedből a legoptimálisabba, a buktatókat és az adminisztrációs teendőket.
                  </p>
                  <button 
                    onClick={handleAiAdvice}
                    className="bg-neon-mint hover:bg-neon-mint-hover text-[#101112] font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-neon-mint/5 flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    Adóbevallás-elemzés generálása
                  </button>
                </div>
              ) : isAiLoading ? (
                <div className="flex items-center gap-3 text-text-muted py-4 text-xs font-semibold uppercase tracking-wider">
                  <Loader2 className="w-5 h-5 text-neon-mint-text animate-spin" />
                  <span>Szakértői vélemény kiszámítása...</span>
                </div>
              ) : (
                <div className="bg-input-bg border border-card-border rounded-xl p-5 mt-2 space-y-4">
                  <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
                  
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-text-muted font-medium">Kalkulált értékhatárok: 2026. évi adótörvények</span>
                    <button
                      onClick={() => openAiChat(`A(z) ${annualRevenue.toLocaleString()} Ft éves bevételi szintemen részletesen beszéld át velem az AI adótanácsadást, amit generáltál. Megéri KATA-ról váltani?`)}
                      className="text-neon-mint-text font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      AI Megbeszélés indítása <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tax Calendar Widget */}
          <TaxCalendarWidget activeRegime={currentRegime} />
        </div>
      )}
    </div>
  );
}
