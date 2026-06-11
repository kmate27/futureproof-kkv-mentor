import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../lib/ai';
import { useFinance } from '../context/FinanceContext';
import { Bot, User, SendHorizontal, Sparkles, X, Loader2 } from 'lucide-react';

const quickPrompts = [
  'Megéri-e alkalmazottat felvennem?',
  'Mikor kell belépnem az ÁFA-körbe?',
  'Optimális az adózási formám?',
];

export default function ChatDrawer({ isOpen, onClose, defaultPrompt }) {
  const { incomes, expenses, annualRevenue } = useFinance();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Üdvözlöm! Én vagyok a KKV Mentor AI asszisztense. Látom a cége pénzügyeit (Éves bevétel: ${new Intl.NumberFormat('hu-HU').format(annualRevenue)} Ft, ${incomes.length} bevételi forrás, ${expenses.length} kiadási tétel). Miben segíthetek ma?`,
      timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (defaultPrompt) {
      sendMessage(defaultPrompt);
    }
  }, [defaultPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    let history = messages.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    const companyData = {
      name: 'Kovács Kft.',
      industry: 'Kereskedelem',
      taxRegime: 'KATA',
      employees: '1-2',
      incomes,
      expenses,
      annualRevenue
    };

    try {
      const responseText = await sendChatMessage(history, text.trim(), companyData);

      const aiResponse = {
        id: Date.now() + 1,
        role: 'ai',
        content: responseText,
        timestamp: getCurrentTime(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>

      {/* Drawer */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">KKV Mentor AI Asszisztens</h3>
              <p className="text-[10px] text-slate-500">Mindig képben a cége számaival</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#1F5FAD]" />
                </div>
              )}
              <div className="flex flex-col space-y-1 max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#1F5FAD] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className={`text-[9px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#1F5FAD]" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600 px-3 py-1.5 rounded-full shrink-0 transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Kérdezz a cég adózásáról, cashflow-ról..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#1F5FAD]/20 focus:border-[#1F5FAD] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#1F5FAD] hover:bg-[#194d8e] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
