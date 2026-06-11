import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Calculator,
  FileText,
  MessageSquare,
  LogOut,
  ChevronRight,
  User,
  Bell,
  Sparkles
} from 'lucide-react'
import CommandPalette from './CommandPalette'
import ChatDrawer from './ChatDrawer'

const navItems = [
  { path: '/dashboard', label: 'KKV Score', short: 'Főoldal', icon: LayoutDashboard },
  { path: '/cashflow', label: 'Cashflow', short: 'Cashflow', icon: TrendingUp },
  { path: '/adozas', label: 'Adózás', short: 'Adózás', icon: Calculator },
  { path: '/dokumentum', label: 'Dokumentumok', short: 'Iratok', icon: FileText },
]

export default function AppLayout({ children }) {
  const location = useLocation()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(prev => !prev)
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Listen for custom open-ai-chat events from child pages
  useEffect(() => {
    const handleOpenChat = (e) => {
      if (e.detail?.prompt) {
        setChatPrompt(e.detail.prompt)
      }
      setIsChatOpen(true)
    };
    window.addEventListener('open-ai-chat', handleOpenChat)
    return () => window.removeEventListener('open-ai-chat', handleOpenChat)
  }, [])

  const handleOpenChatWithPrompt = (prompt) => {
    setChatPrompt(prompt)
    setIsChatOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header (top) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-45 bg-[#101112] text-white px-4 py-3 shadow-sm flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00F872]/20 flex items-center justify-center border border-[#00F872]/30">
            <Sparkles className="w-4 h-4 text-[#00F872]" />
          </div>
          <span className="font-bold text-white font-display">KKV Mentor</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00F872] rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Indigo Navy Theme) */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-full w-72 bg-[#101112] border-r border-slate-800 flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white font-display tracking-tight">KKV Mentor</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">AI Pénzügyi Szaki</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-white/10 text-[#00F872] shadow-sm border-l-2 border-[#00F872]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F872]' : 'text-slate-500 group-hover:text-white'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#00F872]" />}
              </Link>
            )
          })}

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-slate-400 hover:bg-white/5 hover:text-white text-left cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-white" />
            <span>AI Mentor Chat</span>
            <span className="ml-auto text-[9px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700">⌘ K</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-850 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Kovács János</p>
              <p className="text-xs text-slate-500 truncate">Kovács Kft.</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4 text-slate-500 hover:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-[#101112] border-t border-slate-800 pb-safe shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-full py-1 gap-1 relative group"
              >
                <div className={`
                  flex items-center justify-center w-10 h-8 rounded-full transition-colors
                  ${isActive ? 'bg-white/10 text-[#00F872]' : 'bg-transparent'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F872]' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#00F872]' : 'text-slate-400'}`}>
                  {item.short}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex flex-col items-center justify-center w-full py-1 gap-1 relative group cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-8 rounded-full transition-colors bg-transparent">
              <MessageSquare className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">AI Chat</span>
          </button>
        </div>
      </nav>

      {/* Global Interactive Widgets */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenChat={handleOpenChatWithPrompt}
      />
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setChatPrompt('')
        }}
        defaultPrompt={chatPrompt}
      />
    </div>
  )
}
