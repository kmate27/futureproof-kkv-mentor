import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analyzeDocument } from '../lib/ai';
import {
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  Loader2,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldAlert,
  Check,
  CheckCircle2
} from 'lucide-react';

export default function Dokumentum() {
  const [docText, setDocText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // AI Analysis response
  
  // Document preview settings
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Active form field focus for point-and-click copy
  const [activeField, setActiveField] = useState('partnerName');

  // Parsed Invoice Fields (Right Pane Form)
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    partnerName: '',
    iban: '',
    date: '',
    dueDate: '',
    total: 0
  });

  // Line items grid
  const [lineItems, setLineItems] = useState([
    { id: 1, desc: 'Szoftverfejlesztési szolgáltatás', qty: 1, price: 1000000, vat: 27 },
    { id: 2, desc: 'Felhő tárhely & infrastruktúra', qty: 1, price: 270000, vat: 27 }
  ]);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'items' | 'ai'

  // Verification calculations
  const parsedTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.qty * item.price * (1 + item.vat / 100)), 0);
  }, [lineItems]);

  const isTotalValid = useMemo(() => {
    if (!invoiceForm.total) return true;
    return Math.abs(invoiceForm.total - parsedTotal) < 10;
  }, [invoiceForm.total, parsedTotal]);

  const isIbanSuspicious = useMemo(() => {
    if (!invoiceForm.iban) return false;
    // OTP / HU11 is the verified partner bank. If a different IBAN is provided, it's flagged.
    return !invoiceForm.iban.includes('HU11');
  }, [invoiceForm.iban]);

  const handleZoomIn = () => setZoom(z => Math.min(1.5, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.7, z - 0.1));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  // Point & Click copy handler: copies visual value from invoice on click to active focused form field
  const handleFieldClick = (fieldName, value) => {
    setInvoiceForm(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Cycle active field to next empty or logical field
    if (fieldName === 'partnerName') setActiveField('invoiceNumber');
    else if (fieldName === 'invoiceNumber') setActiveField('iban');
    else if (fieldName === 'iban') setActiveField('total');
  };

  const handleAnalyze = async () => {
    if (!docText.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    const analysis = await analyzeDocument(docText);
    setResult(analysis);
    
    // Automatically populate right-hand fields from AI analysis
    setInvoiceForm({
      invoiceNumber: 'SZ-2026-049',
      partnerName: 'Global Marketing Kft.',
      iban: 'HU99 1177 3009 8765 4321 0000',
      date: '2026-05-15',
      dueDate: '2026-06-15',
      total: 1270000
    });

    setIsAnalyzing(false);
  };

  const formatHuf = (val) => new Intl.NumberFormat('hu-HU').format(val) + ' Ft';

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-text-main">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-card-border pb-5">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-bright transition-colors mb-2">
            <ChevronLeft className="w-3.5 h-3.5" /> Vissza a Dashboardra
          </Link>
          <h1 className="text-3xl font-extrabold font-display tracking-tight flex items-center gap-2 text-text-bright">
            Dokumentum Értelmező
          </h1>
          <p className="text-text-muted text-sm mt-1">Húzza be a NAV leveleket vagy számlákat a point-and-click OCR elemzéshez és IBAN csalásszűréshez</p>
        </div>
      </div>

      {/* 50/50 Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANE: Document Preview / Simulated Invoice */}
        <div className="lg:col-span-6 flex flex-col bg-card-bg/70 rounded-2xl border border-card-border p-6 space-y-4 transition-colors duration-200">
          <div className="flex justify-between items-center bg-input-bg/40 p-3.5 rounded-xl border border-card-border">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              📂 Scanned Invoice Preview
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-card-bg text-text-muted hover:text-text-bright transition-colors cursor-pointer border border-transparent hover:border-card-border">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-card-bg text-text-muted hover:text-text-bright transition-colors cursor-pointer border border-transparent hover:border-card-border">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleRotate} className="p-2 rounded-lg hover:bg-card-bg text-text-muted hover:text-text-bright transition-colors cursor-pointer border border-transparent hover:border-card-border">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Invoice Page Container */}
          <div className="bg-input-bg/60 rounded-2xl border border-card-border p-8 flex items-center justify-center min-h-[460px] overflow-hidden relative">
            
            {/* Interactive Invoice Page */}
            <div 
              className="w-full max-w-sm bg-white text-slate-800 p-6 rounded-lg shadow-2xl space-y-6 text-xs transition-all duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4 border-slate-200">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Számla (Invoice)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Eredeti példány</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">Global Marketing Kft.</span>
                  <span className="text-[10px] text-slate-400">1054 Budapest, Fő utca 12.</span>
                </div>
              </div>

              {/* Bounding box click demo instructions */}
              <div className="bg-blue-50 border border-blue-100 p-2 rounded text-[10px] text-blue-700 font-medium">
                💡 Kattints a piros/kék keretes mezőkre az adatok azonnali beillesztéséhez a túloldali űrlapba!
              </div>

              {/* Invoice details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Partner Neve:</span>
                  <button 
                    onClick={() => handleFieldClick('partnerName', 'Global Marketing Kft.')}
                    className="font-bold text-slate-900 hover:bg-blue-100 border border-blue-500/20 border-dashed px-1.5 py-0.5 rounded text-left transition-colors cursor-pointer"
                  >
                    Global Marketing Kft.
                  </button>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Számlaszám:</span>
                  <button 
                    onClick={() => handleFieldClick('invoiceNumber', 'SZ-2026-049')}
                    className="font-bold text-slate-900 hover:bg-blue-100 border border-blue-500/20 border-dashed px-1.5 py-0.5 rounded text-left transition-colors cursor-pointer"
                  >
                    SZ-2026-049
                  </button>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Fizetési Határidő:</span>
                  <span className="font-semibold text-slate-900">2026. június 15.</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">IBAN Számlaszám:</span>
                  <button 
                    onClick={() => handleFieldClick('iban', 'HU99 1177 3009 8765 4321 0000')}
                    className="font-bold text-slate-900 hover:bg-red-100 border border-red-500/30 border-dashed px-1.5 py-0.5 rounded text-left transition-colors cursor-pointer"
                  >
                    HU99 1177 3009 8765 4321 0000
                  </button>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b text-slate-400 border-slate-200">
                    <th className="pb-2">Tétel</th>
                    <th className="pb-2 text-right">Menny.</th>
                    <th className="pb-2 text-right">Egységár</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 divide-slate-100">
                  <tr>
                    <td className="py-2">Marketing kampány kivitelezés</td>
                    <td className="py-2 text-right">1</td>
                    <td className="py-2 text-right">1.000.000 Ft</td>
                  </tr>
                </tbody>
              </table>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="font-bold text-slate-900">Összesen (Grand Total):</span>
                <button
                  onClick={() => handleFieldClick('total', 1270000)}
                  className="font-extrabold text-slate-900 text-sm hover:bg-blue-100 border border-blue-500/20 border-dashed px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                >
                  1.270.000 Ft
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: Validation Form, Grid and Warnings */}
        <div className="lg:col-span-6 flex flex-col bg-card-bg/70 rounded-2xl border border-card-border p-6 space-y-4 transition-colors duration-200">
          
          {/* Tabs header */}
          <div className="flex border-b border-card-border">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'details' ? 'border-neon-mint text-neon-mint-text' : 'border-transparent text-text-muted hover:text-text-bright'
              }`}
            >
              Alapadatok
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'items' ? 'border-neon-mint text-neon-mint-text' : 'border-transparent text-text-muted hover:text-text-bright'
              }`}
            >
              Tételek Rácsa
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                activeTab === 'ai' ? 'border-neon-mint text-neon-mint-text' : 'border-transparent text-text-muted hover:text-text-bright'
              }`}
            >
              AI Levelelemző
            </button>
          </div>

          {/* Validation alerts */}
          <div className="space-y-3">
            {isIbanSuspicious && (
              <div className="bg-red-500/10 dark:bg-red-950/60 border border-red-500/20 dark:border-red-500/30 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-400">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-red-800 dark:text-red-200">⚠️ LEHETSÉGES IBAN CSALÁS ÉSZLELVE</h4>
                  <p className="text-[11px] text-red-700 dark:text-red-300">
                    A partner korábban OTP számlát használt. A számlán most egy CIB Bankos IBAN ({invoiceForm.iban}) szerepel. Kérjük, erősítsd meg telefonon is!
                  </p>
                </div>
              </div>
            )}

            {!isTotalValid && (
              <div className="bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/20 dark:border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-amber-800 dark:text-amber-200">⚠️ SZÁMLA ÖSSZEG ELTÉRÉS</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    A számlán szereplő végösszeg ({formatHuf(invoiceForm.total)}) eltér a line-item tételek összegétől ({formatHuf(parsedTotal)}).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form details tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Küldő Partner Neve</label>
                  <input
                    type="text"
                    value={invoiceForm.partnerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, partnerName: e.target.value })}
                    onFocus={() => setActiveField('partnerName')}
                    className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-xs text-text-bright focus:outline-none transition-colors ${
                      activeField === 'partnerName' ? 'border-neon-mint' : 'border-input-border'
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Számlaszám</label>
                  <input
                    type="text"
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    onFocus={() => setActiveField('invoiceNumber')}
                    className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-xs text-text-bright focus:outline-none transition-colors ${
                      activeField === 'invoiceNumber' ? 'border-neon-mint' : 'border-input-border'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Fogadó IBAN Számlaszám</label>
                <input
                  type="text"
                  value={invoiceForm.iban}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, iban: e.target.value })}
                  onFocus={() => setActiveField('iban')}
                  className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-xs text-text-bright focus:outline-none transition-colors ${
                    activeField === 'iban' ? 'border-neon-mint' : 'border-input-border'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Számla Kelte</label>
                  <input
                    type="date"
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                    className="w-full bg-input-bg border border-input-border rounded-xl px-4 py-3 text-xs text-text-bright focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Összesen (Ft)</label>
                  <input
                    type="number"
                    value={invoiceForm.total || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, total: parseFloat(e.target.value) || 0 })}
                    onFocus={() => setActiveField('total')}
                    className={`w-full bg-input-bg border rounded-xl px-4 py-3 text-xs text-text-bright focus:outline-none transition-colors ${
                      activeField === 'total' ? 'border-neon-mint' : 'border-input-border'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Line Items Grid Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="overflow-x-auto border border-card-border rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-input-bg/40 text-text-muted border-b border-card-border font-semibold">
                      <th className="px-4 py-3">Megnevezés</th>
                      <th className="px-3 py-3 text-right">Menny.</th>
                      <th className="px-3 py-3 text-right">Nettó ár</th>
                      <th className="px-3 py-3 text-right">ÁFA %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60 text-text-main">
                    {lineItems.map(item => (
                      <tr key={item.id} className="hover:bg-card-bg/30">
                        <td className="px-4 py-3 font-medium">{item.desc}</td>
                        <td className="px-3 py-3 text-right">{item.qty}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatHuf(item.price)}</td>
                        <td className="px-3 py-3 text-right">{item.vat}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-input-bg/60 p-4 rounded-xl border border-card-border flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase">Line Items Összeg</span>
                <span className="text-text-bright font-extrabold text-sm">{formatHuf(parsedTotal)}</span>
              </div>
            </div>
          )}

          {/* AI Tab (For NAV Letters) */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-fade-in flex-1">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest">NAV levél szöveges bevitele</label>
                <textarea
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  placeholder="Tisztelt Adózó! A Nemzeti Adó- és Vámhivatal..."
                  className="w-full h-32 p-4 bg-input-bg border border-input-border rounded-xl text-xs text-text-bright focus:outline-none focus:border-neon-mint resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setDocText('Tisztelt Adózó! Tájékoztatjuk, hogy a 2026. évi adóbevallásukat felülvizsgáltuk. Az ellenőrzés során eltérést találtunk az ÁFA bevallásában. Kérjük, 30 napon belül nyújtsa be a javított bevallást. Tisztelettel, NAV')}
                  className="text-xs bg-input-bg border border-card-border hover:border-primary/40 text-text-main px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  + Demo NAV levél betöltése
                </button>
                
                <button
                  onClick={handleAnalyze}
                  disabled={!docText.trim() || isAnalyzing}
                  className="bg-[#1F5FAD] hover:bg-blue-600 disabled:opacity-50 text-xs font-bold text-white px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Értelmezés indítása
                </button>
              </div>

              {result && (
                <div className="bg-input-bg/60 rounded-xl border border-card-border p-4 space-y-3 text-xs text-text-main">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-bright">AI Összefoglaló:</strong>
                      <p className="text-text-muted mt-1 leading-relaxed">{result.summary}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-mint-text shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text-bright">Kötelező Teendő:</strong>
                      <p className="text-text-muted mt-1 leading-relaxed">{result.action}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons footer */}
          <div className="pt-4 border-t border-card-border flex justify-end gap-3">
            <button
              onClick={() => {
                setInvoiceForm({
                  invoiceNumber: '',
                  partnerName: '',
                  iban: '',
                  date: '',
                  dueDate: '',
                  total: 0
                });
                setResult(null);
                setDocText('');
              }}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-bright transition-colors cursor-pointer"
            >
              Mátrix Törlése
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent('open-ai-chat', { detail: { prompt: `Elemezd ki a frissen rögzített számlámat a(z) ${invoiceForm.partnerName} partnertől, számlaszáma ${invoiceForm.invoiceNumber}. Megfelel a 2026. évi ÁFA elszámolásnak?` } });
                window.dispatchEvent(event);
              }}
              className="px-5 py-2.5 text-xs font-bold text-[#101112] bg-neon-mint hover:bg-neon-mint-hover rounded-xl transition-all shadow-md shadow-neon-mint/5 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Elemzés Jóváhagyása
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
