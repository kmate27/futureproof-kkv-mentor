import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { generateTaxAdvice } from '../lib/gemini';
import {
  Calculator,
  ChevronLeft,
  Sparkles,
  CalendarDays,
  AlertTriangle,
  Info,
  Shield,
  Loader2,
  CheckCircle2,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

const REGIMES = ['KATA', 'Átalányadó', 'KIVA', 'TAO Kft.'];

export default function Adozas() {
  const [revenue, setRevenue] = useState(12); // in millions
  const [currentRegime, setCurrentRegime] = useState('KATA');
  const [employees, setEmployees] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculations
  const taxes = useMemo(() => {
    const rev = revenue * 1000000;
    
    // KATA: Évi 600.000 Ft. Ha > 18M, akkor a 18M feletti részre 40% büntetőadó.
    const kata = rev > 18000000 ? 600000 + (rev - 18000000) * 0.4 : 600000;
    
    // Átalányadó: bevétel 40%-a az adóalap, amire 15% SZJA + 18.5% TB (33.5%)
    const atalany = rev * 0.4 * 0.335;
    
    // Alkalmazott becsült éves bérköltség (kb. 350e bruttó/hó = 4.2M/év)
    const personnelCost = employees * 4200000;
    
    // KIVA: 10% a személyi jellegű kiadásokra
    const kiva = personnelCost * 0.10;
    
    // TAO: 9% nyereségadó + SZOCHO (13% a bérekre)
    const profit = Math.max(0, rev - personnelCost);
    const tao = (profit * 0.09) + (personnelCost * 0.13);

    return {
      'KATA': kata,
      'Átalányadó': atalany,
      'KIVA': kiva,
      'TAO Kft.': tao
    };
  }, [revenue, employees]);

  const bestRegime = Object.keys(taxes).reduce((a, b) => taxes[a] < taxes[b] ? a : b);
  const currentTax = taxes[currentRegime];

  const handleCalculate = () => {
    setIsCalculated(true);
    setAiAdvice(''); // Reset AI on new calculation
  };

  const handleAiAdvice = async () => {
    setIsAiLoading(true);
    const result = await generateTaxAdvice({
      revenue: revenue * 1000000,
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

  const formatMoney = (val) => val.toLocaleString('hu-HU') + ' Ft';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5FAD] to-[#2E75B6] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Vissza a főoldalra
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Adózási Tanácsadó
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-1">
                Kalkuláljon és találja meg az optimális adózási formát
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* SECTION 1: Gyors diagnosztika */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#1F5FAD]" />
            Alapadatok megadása
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Slider & Input */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-[#1E293B]">Várható éves bevétel</label>
                  <span className="text-lg font-bold text-[#1F5FAD]">{revenue} Millió Ft</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#1F5FAD]"
                />
                <div className="flex justify-between text-xs text-[#64748B] mt-1">
                  <span>1M Ft</span>
                  <span>50M Ft</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">Alkalmazottak száma (fő)</label>
                <input 
                  type="number" 
                  min="0"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full sm:w-1/2 rounded-lg border border-[#E2E8F0] p-3 focus:outline-none focus:ring-2 focus:ring-[#1F5FAD] transition"
                />
              </div>
            </div>

            {/* Right Col: Radio buttons */}
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-3">Jelenlegi adózási forma</label>
              <div className="grid grid-cols-2 gap-3">
                {REGIMES.map((regime) => (
                  <button
                    key={regime}
                    onClick={() => setCurrentRegime(regime)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left flex items-center gap-2 ${
                      currentRegime === regime
                        ? 'border-[#1F5FAD] bg-[#EFF6FF] text-[#1F5FAD]'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] text-[#1E293B]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentRegime === regime ? 'border-[#1F5FAD]' : 'border-gray-300'}`}>
                      {currentRegime === regime && <div className="w-2 h-2 rounded-full bg-[#1F5FAD]"></div>}
                    </div>
                    {regime}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleCalculate}
              className="bg-[#1A7A4A] hover:bg-[#15643D] text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Kiszámolom a legjobb opciót
            </button>
          </div>
        </div>

        {/* SECTION 2 & 3: Táblázat és AI (Csak ha már számoltunk) */}
        {isCalculated && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            
            {/* Összehasonlító Táblázat */}
            <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-[#1A7A4A]" />
                  Adóterhek Összehasonlítása
                </h2>
                <div className="text-sm px-3 py-1 bg-white border rounded-full shadow-sm">
                  Bevétel: <span className="font-bold">{revenue}M Ft</span> | Alkalmazott: <span className="font-bold">{employees} fő</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white">
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B] border-b border-r"></th>
                      {REGIMES.map((regime) => {
                        const isBest = regime === bestRegime;
                        const isCurrent = regime === currentRegime;
                        return (
                          <th key={regime} className={`px-4 py-4 border-b relative ${isBest ? 'bg-green-50' : ''}`}>
                            {isBest && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A7A4A]"></div>
                            )}
                            <div className="flex flex-col items-center">
                              <span className={`text-lg font-bold ${isBest ? 'text-[#1A7A4A]' : 'text-[#1E293B]'}`}>
                                {regime}
                              </span>
                              {isCurrent && (
                                <span className="mt-1 text-[10px] uppercase font-bold text-[#1F5FAD] bg-blue-100 px-2 py-0.5 rounded-full">Jelenlegi</span>
                              )}
                              {isBest && (
                                <span className="mt-1 text-[10px] uppercase font-bold text-white bg-[#1A7A4A] px-2 py-0.5 rounded-full">Legjobb választás</span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Éves adóteher */}
                    <tr>
                      <td className="px-6 py-5 text-sm font-semibold text-[#1E293B] border-r border-b">Éves adóteher (becsült)</td>
                      {REGIMES.map((regime) => {
                        const isBest = regime === bestRegime;
                        return (
                          <td key={regime} className={`px-4 py-5 text-center border-b ${isBest ? 'bg-green-50/50' : ''}`}>
                            <span className={`text-lg font-bold ${isBest ? 'text-[#1A7A4A]' : 'text-[#1E293B]'}`}>
                              {formatMoney(taxes[regime])}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    
                    {/* Megtakarítás */}
                    <tr>
                      <td className="px-6 py-5 text-sm font-semibold text-[#1E293B] border-r border-b">
                        Megtakarítás a jelenlegihez képest
                      </td>
                      {REGIMES.map((regime) => {
                        const isBest = regime === bestRegime;
                        const diff = currentTax - taxes[regime];
                        const isPositive = diff > 0;
                        const isNegative = diff < 0;
                        
                        return (
                          <td key={regime} className={`px-4 py-5 text-center border-b ${isBest ? 'bg-green-50/50' : ''}`}>
                            {diff === 0 ? (
                              <span className="text-[#64748B] font-medium">-</span>
                            ) : (
                              <span className={`font-bold ${isPositive ? 'text-[#1A7A4A]' : 'text-[#991B1B]'}`}>
                                {isPositive ? '+' : ''}{formatMoney(diff)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Adminisztráció */}
                    <tr>
                      <td className="px-6 py-4 text-sm font-semibold text-[#1E293B] border-r">Adminisztrációs teher</td>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${bestRegime === 'KATA' ? 'bg-green-50/50' : ''} text-[#1A7A4A]`}>Alacsony</td>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${bestRegime === 'Átalányadó' ? 'bg-green-50/50' : ''} text-amber-600`}>Közepes</td>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${bestRegime === 'KIVA' ? 'bg-green-50/50' : ''} text-[#991B1B]`}>Magas</td>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${bestRegime === 'TAO Kft.' ? 'bg-green-50/50' : ''} text-[#991B1B]`}>Magas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Tanácsadó Szekció */}
            <div className="bg-gradient-to-r from-[#1F5FAD] to-[#2E75B6] rounded-xl shadow-lg p-6 lg:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">AI Szakértői Elemzés</h2>
                </div>
                
                {!aiAdvice && !isAiLoading ? (
                  <div>
                    <p className="text-blue-100 mb-6 max-w-2xl">
                      Kérjen személyre szabott, szöveges értékelést a Gemini AI adószakértőnktől, aki részletesen elmagyarázza a fenti számokat és javaslatot tesz a váltásra.
                    </p>
                    <button 
                      onClick={handleAiAdvice}
                      className="bg-white text-[#1F5FAD] hover:bg-blue-50 font-semibold py-2.5 px-6 rounded-lg shadow transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Részletes AI elemzés kérése
                    </button>
                  </div>
                ) : isAiLoading ? (
                  <div className="flex items-center gap-3 text-blue-50">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Szakértői elemzés generálása folyamatban...</span>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-5 mt-2">
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{aiAdvice}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gemini AI által generálva</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Naptár (Mindig látszik alul) */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 mt-6">
          <h2 className="text-lg font-semibold text-[#1E293B] flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-[#1F5FAD]" />
            Adónaptár – Közelgő határidők
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Június 20.</p>
                <p className="text-xs text-amber-700">ÁFA bevallás (12 nap)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1F5FAD] flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">Július 12.</p>
                <p className="text-xs text-[#64748B]">KATA befizetés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1F5FAD] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">Szept. 30.</p>
                <p className="text-xs text-[#64748B]">Iparűzési adó</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
