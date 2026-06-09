import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeDocument } from '../lib/ai';
import {
  FileSearch,
  ChevronLeft,
  FileText,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react';

export default function Dokumentum() {
  const [docText, setDocText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // { summary, action, deadline, risk }

  const handleAnalyze = async () => {
    if (!docText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    const analysis = await analyzeDocument(docText);
    setResult(analysis);
    
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F5FAD] to-[#2E75B6] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Vissza a Dashboardra
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Dokumentum Értelmező
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-1">
                Bemásolt szövegek azonnali AI alapú jogi és pénzügyi elemzése
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Input Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
          <h2 className="text-lg font-semibold text-[#1E293B] flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#1F5FAD]" />
            Dokumentum szövege
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Másold be ide a kapott hivatalos levelet, szerződést vagy számlát. Az adatokat bizalmasan kezeljük.
          </p>
          
          <textarea
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Tisztelt Adózó! Tájékoztatjuk, hogy a Nemzeti Adó- és Vámhivatal..."
            className="w-full h-48 p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1F5FAD] text-sm text-[#1E293B] resize-y transition-colors placeholder:text-slate-400"
          ></textarea>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setDocText('Tisztelt Adózó! Tájékoztatjuk, hogy a 2025. évi adóbevallásukat felülvizsgáltuk. Az ellenőrzés során eltérést találtunk az ÁFA bevallásában. Kérjük, 30 napon belül nyújtsa be a javított bevallást. Tisztelettel, NAV')}
              className="text-sm font-medium text-[#1F5FAD] hover:underline"
            >
              + Demó dokumentum betöltése
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!docText.trim() || isAnalyzing}
              className="bg-[#1F5FAD] hover:bg-[#2E75B6] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Elemzés folyamatban...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Értelmezés
                </>
              )}
            </button>
          </div>
        </div>

        {/* Eredmények */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-[#1E293B]">AI Elemzés Eredménye</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Összefoglaló */}
              <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#1F5FAD] border-y border-r border-[#E2E8F0] p-6">
                <div className="flex items-center gap-2 mb-3 text-[#1F5FAD]">
                  <Info className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-[#1E293B]">Összefoglaló</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.summary}
                </p>
              </div>

              {/* Teendő */}
              <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#1A7A4A] border-y border-r border-[#E2E8F0] p-6">
                <div className="flex items-center gap-2 mb-3 text-[#1A7A4A]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-[#1E293B]">Mi a teendő?</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.action}
                </p>
              </div>

              {/* Határidő */}
              <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-amber-500 border-y border-r border-[#E2E8F0] p-6">
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-[#1E293B]">Határidő</h3>
                </div>
                <p className="text-slate-700 text-sm font-medium">
                  {result.deadline}
                </p>
              </div>

              {/* Kockázat */}
              <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#991B1B] border-y border-r border-[#E2E8F0] p-6">
                <div className="flex items-center gap-2 mb-3 text-[#991B1B]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-[#1E293B]">Kockázat</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {result.risk}
                </p>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
