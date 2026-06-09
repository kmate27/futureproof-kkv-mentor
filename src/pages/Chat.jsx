import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../lib/gemini';
import {
  Bot,
  User,
  SendHorizontal,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

const quickPrompts = [
  'Megéri-e alkalmazottat felvennem?',
  'Mikor kell belépnem az ÁFA-körbe?',
  'Optimális az adózási formám?',
];

// Alapértelmezett mock adatok, ha nem az onboarding felől jövünk
const companyData = {
  name: 'Kovács Kft.',
  industry: 'Kereskedelem',
  revenue: '12-25M Ft',
  taxRegime: 'KATA',
  employees: '1-2'
};

export default function Chat() {
  const location = useLocation();
  const activeCompanyData = location.state?.companyData || companyData;

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Üdvözlöm! Én vagyok a KKV Mentor AI asszisztense. Látom, hogy a(z) ${activeCompanyData.industry} szektorban tevékenykedik. Miben segíthetek ma?`,
      timestamp: new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

    // A Gemini API megköveteli, hogy a history 'user' role-lal kezdődjön!
    // Mivel a mi listánk alapból az AI üdvözlésével indul, az első 'model' üzenetet levágjuk.
    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    const responseText = await sendChatMessage(history, text.trim(), activeCompanyData);

    const aiResponse = {
      id: Date.now() + 1,
      role: 'ai',
      content: responseText,
      timestamp: getCurrentTime(),
    };
    
    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  /* 
    Layout: A Chat-nek ki kell töltenie a teljes rendelkezésre álló magasságot
    az AppLayout main területén belül. Mobilon: felső header (64px) + alsó nav (~68px).
    Desktopon: nincs extra header/footer, csak a sidebar.
    Negatív margin-nal kioltjuk az AppLayout padding-jét, hogy edge-to-edge legyen.
  */
  return (
    <div className="flex flex-col -m-4 sm:-m-6 lg:-m-8"
         style={{ height: 'calc(100vh - 4rem - 5rem)', /* mobile: top header + bottom nav */ }}
    >
      {/* Desktop-on nincs külső header/footer, tehát teljes magasság kell */}
      <style>{`
        @media (min-width: 1024px) {
          .chat-container { height: 100vh !important; }
        }
      `}</style>

      <div className="chat-container flex flex-col flex-1 bg-[#F8FAFC]"
           style={{ height: 'inherit' }}>
        
        {/* Chat Header */}
        <div className="bg-white border-b border-[#E2E8F0] flex-shrink-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] rounded-xl flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#1E293B]">
                  AI Pénzügyi Tanácsadó
                </h1>
                <p className="text-xs text-[#1A7A4A] font-medium flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A7A4A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A7A4A]"></span>
                  </span>
                  Online
                </p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-[#1F5FAD]" />
          </div>
        </div>

        {/* Messages Area — ez görgethető */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#1F5FAD] text-white rounded-br-sm'
                      : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1.5 font-medium ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-[#94A3B8]'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm flex items-center gap-3">
                  <span className="text-sm font-medium text-[#64748B]">KKV Mentor gondolkodik...</span>
                  <div className="flex items-center gap-1.5 h-5">
                    <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area — mindig alul rögzítve */}
        <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Quick Prompts */}
            <div className="pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isTyping}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-[#1F5FAD] hover:bg-[#1F5FAD] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="pb-3 flex items-end gap-3"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tedd fel a pénzügyi vagy adózási kérdésed..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] text-[15px] text-[#1E293B] focus:outline-none focus:ring-0 focus:border-[#1F5FAD] transition-all placeholder:text-[#94A3B8] resize-none h-12 min-h-[48px] max-h-28"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-[#1F5FAD] hover:bg-[#2E75B6] disabled:bg-[#CBD5E1] text-white rounded-2xl flex items-center justify-center transition-all shadow-md disabled:shadow-none flex-shrink-0"
              >
                <SendHorizontal className="w-5 h-5 ml-0.5" />
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
}
