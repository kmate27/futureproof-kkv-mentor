import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Cashflow from './pages/Cashflow'
import Adozas from './pages/Adozas'
import Dokumentum from './pages/Dokumentum'
import Chat from './pages/Chat'

import { FinanceProvider } from './context/FinanceContext'

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected routes with sidebar layout */}
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/cashflow" element={<AppLayout><Cashflow /></AppLayout>} />
          <Route path="/adozas" element={<AppLayout><Adozas /></AppLayout>} />
          <Route path="/dokumentum" element={<AppLayout><Dokumentum /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  )
}

export default App
