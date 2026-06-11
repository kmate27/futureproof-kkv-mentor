import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Calculator, Calendar, Landmark, FileText, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onOpenChat }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleAction = (action) => {
    onClose();
    if (action.type === 'route') {
      navigate(action.value);
    } else if (action.type === 'chat') {
      onOpenChat(action.value);
    }
  };

  const actions = [
    { label: 'Adóoptimalizálás megnyitása', type: 'route', value: '/adozas', icon: Calculator, category: 'Navigáció' },
    { label: 'Cashflow tervező megnyitása', type: 'route', value: '/cashflow', icon: Landmark, category: 'Navigáció' },
    { label: 'Dokumentum értelmező megnyitása', type: 'route', value: '/dokumentum', icon: FileText, category: 'Navigáció' },
    { label: 'Havi Pulzus áttekintése', type: 'route', value: '/dashboard', icon: Calendar, category: 'Navigáció' },
    { label: 'Kérdezd a mentort: "Megéri alkalmazottat felvennem?"', type: 'chat', value: 'Megéri alkalmazottat felvennem a 2026-os szabályok szerint?', icon: Sparkles, category: 'AI Mentor', highlight: true },
    { label: 'Kérdezd a mentort: "Mik az átalányadó feltételei?"', type: 'chat', value: 'Mik az átalányadó feltételei a cégem bevételi szintjén?', icon: Sparkles, category: 'AI Mentor', highlight: true },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh] p-4 animate-fade-in"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden transform scale-100 transition-transform">
        <div className="flex items-center gap-3 px-4 border-b border-slate-200/80">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keress a funkciók között vagy kérdezz az AI-tól..."
            className="w-full py-4 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
          />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto">
          {filteredActions.length > 0 ? (
            <div>
              {['Navigáció', 'AI Mentor'].map((cat) => {
                const catActions = filteredActions.filter((a) => a.category === cat);
                if (catActions.length === 0) return null;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">{cat}</div>
                    {catActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAction(action)}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                            action.highlight
                              ? 'hover:bg-purple-50/50 text-slate-700 hover:text-purple-600'
                              : 'hover:bg-blue-50/50 text-slate-700 hover:text-[#1F5FAD]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${action.highlight ? 'text-purple-500 animate-pulse' : 'text-slate-400'}`} />
                          <span className="flex-1 font-medium">{action.label}</span>
                          <kbd className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border font-mono">ENTER</kbd>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">Nincs találat a keresésre.</div>
          )}
        </div>
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-400">
          <span>Tipp: Nyomj <kbd className="font-mono bg-white px-1 py-0.5 rounded border">ESC</kbd>-et a bezáráshoz</span>
          <span>Gyorsbillentyű: <kbd className="font-mono bg-white px-1 py-0.5 rounded border">⌘ K</kbd></span>
        </div>
      </div>
    </div>
  );
}
