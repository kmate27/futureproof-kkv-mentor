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
  Sparkles,
  Sun,
  Moon
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  // Theme Sync effect
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

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
    <div className="min-h-screen bg-bg-main text-text-main transition-colors duration-200">
      {/* Mobile Header (top) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-45 bg-sidebar-bg text-text-bright border-b border-sidebar-border px-4 py-3 shadow-sm flex items-center justify-between transition-colors duration-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00F872]/20 flex items-center justify-center border border-[#00F872]/30">
            <Sparkles className="w-4 h-4 text-[#00F872]" />
          </div>
          <span className="font-bold text-text-bright font-display">KKV Mentor</span>
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-card-bg transition-colors text-text-muted hover:text-text-bright"
            aria-label="Téma váltás"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="p-2 rounded-lg hover:bg-card-bg transition-colors text-text-muted hover:text-text-bright"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-card-bg transition-colors text-text-muted hover:text-text-bright relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00F872] rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (Indigo Navy Theme) */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-full w-72 bg-sidebar-bg border-r border-sidebar-border flex-col transition-colors duration-200">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base text-text-bright font-display tracking-tight truncate">KKV Mentor</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mt-0.5 truncate">AI Pénzügyi Szaki</p>
            </div>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-card-border hover:bg-card-bg transition-colors text-text-muted hover:text-text-bright cursor-pointer shrink-0 ml-2"
            aria-label="Téma váltás"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
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
                    ? 'bg-active-nav-bg text-[#00F872] shadow-sm border-l-2 border-[#00F872]'
                    : 'text-text-muted hover:bg-card-bg hover:text-text-bright'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F872]' : 'text-text-muted group-hover:text-text-bright'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#00F872]" />}
              </Link>
            )
          })}

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group text-text-muted hover:bg-card-bg hover:text-text-bright text-left cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-text-muted group-hover:text-text-bright" />
            <span>AI Mentor Chat</span>
            <span className="ml-auto text-[9px] bg-input-bg text-text-muted px-1 py-0.5 rounded border border-card-border">⌘ K</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-card-border bg-card-bg transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-input-bg flex items-center justify-center border border-card-border">
              <User className="w-5 h-5 text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-bright truncate">Kovács János</p>
              <p className="text-xs text-text-muted truncate">Kovács Kft.</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-input-bg transition-colors cursor-pointer text-text-muted hover:text-text-bright border border-transparent hover:border-card-border">
              <LogOut className="w-4 h-4" />
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-sidebar-bg border-t border-sidebar-border pb-safe shadow-lg transition-colors duration-200">
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
                  ${isActive ? 'bg-active-nav-bg text-[#00F872]' : 'bg-transparent'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F872]' : 'text-text-muted'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#00F872]' : 'text-text-muted'}`}>
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
              <MessageSquare className="w-5 h-5 text-text-muted" />
            </div>
            <span className="text-[10px] font-medium text-text-muted">AI Chat</span>
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
