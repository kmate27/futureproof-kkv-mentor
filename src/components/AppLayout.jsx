import { useState } from 'react'
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

const navItems = [
  { path: '/dashboard', label: 'KKV Score', short: 'Főoldal', icon: LayoutDashboard },
  { path: '/cashflow', label: 'Cashflow', short: 'Cashflow', icon: TrendingUp },
  { path: '/adozas', label: 'Adózás', short: 'Adózás', icon: Calculator },
  { path: '/dokumentum', label: 'Dokumentumok', short: 'Iratok', icon: FileText },
  { path: '/chat', label: 'AI Chat', short: 'AI Chat', icon: MessageSquare },
]

export default function AppLayout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header (top) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">KKV Mentor</span>
          </Link>
          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F5FAD] to-[#2E75B6] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">KKV Mentor</h1>
              <p className="text-xs text-slate-400">AI Pénzügyi Tanácsadó</p>
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
                    ? 'bg-[#1F5FAD] text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1F5FAD]'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}

        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">Kovács János</p>
              <p className="text-xs text-slate-400 truncate">Kovács Kft.</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4 text-slate-400" />
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
                  ${isActive ? 'bg-[#1F5FAD]' : 'bg-transparent group-hover:bg-blue-50'}
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#1F5FAD]' : 'text-[#64748B]'}`}>
                  {item.short}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
