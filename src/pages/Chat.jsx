import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sendChatMessage } from '../lib/gemini';
import {
  Bot,
  User,
  SendHorizontal,
  ChevronLeft,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

const quickPrompts = [
  'Megéri-e alkalmazottat felvennem?',
  'Mikor kell belépnem az ÁFA-körbe?',
  'Optimális az adózási formám?',
];

export default function Chat() {
  const location = useLocation();
  // Alapértelmezett mock adatok, ha nem az onboarding felől jövünk
  const companyData = location.state?.companyData || {
    name: 'Kovács Bt.',
    industry: 'Kereskedelem',
    revenue: '12-25M Ft',
    taxRegime: 'KATA',
    employees: '1-2'
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Üdvözlöm! Én vagyok a KKV Mentor AI asszisztense. Látom, hogy a(z) ${companyData.industry} szektorban tevékenykedik. Miben segíthetek ma?`,
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

    // Formázzuk a korábbi üzeneteket a Gemini API számára (az első üdvözlést is belerakhatjuk)
    const history = messages.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Hívjuk a Gemini-t
    const responseText = await sendChatMessage(history, text.trim(), companyData);

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

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-['Inter',sans-serif]">
      {/* Header Bar */}
      <div className="bg-white border-b border-[#E2E8F0] flex-shrink-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#1E293B] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] rounded-xl flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E293B]">
                AI Pénzügyi Tanácsadó
              </h1>
              <p className="text-xs text-[#1A7A4A] font-medium flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A7A4A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A7A4A]"></span>
                </span>
                Online – Gemini AI
              </p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-[#1F5FAD]" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#1F5FAD] text-white rounded-br-sm'
                    : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-bl-sm'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p
                  className={`text-[10px] mt-2 font-medium ${
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
              <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-3">
                <span className="text-sm font-medium text-[#64748B]">KKV Mentor gondolkodik...</span>
                <div className="flex items-center gap-1.5 h-6">
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-[#94A3B8] rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Quick Prompts + Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0] pb-safe">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Quick Prompts */}
          <div className="py-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isTyping}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-sm font-medium text-[#1F5FAD] hover:bg-[#1F5FAD] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="pb-6 flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tedd fel a pénzügyi vagy adózási kérdésed..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FAFC] text-[15px] text-[#1E293B] focus:outline-none focus:ring-0 focus:border-[#1F5FAD] transition-all placeholder:text-[#94A3B8] resize-none h-14 min-h-[56px] max-h-32"
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
              className="w-14 h-14 bg-[#1F5FAD] hover:bg-[#2E75B6] disabled:bg-[#CBD5E1] text-white rounded-2xl flex items-center justify-center transition-all shadow-md disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
            >
              <SendHorizontal className="w-6 h-6 ml-1" />
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
