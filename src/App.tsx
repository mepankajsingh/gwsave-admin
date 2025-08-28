import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Settings, Database, Plus, BarChart3 } from 'lucide-react'
import { PromoCodeForm } from './components/PromoCodeForm'
import { PromoCodeStats } from './components/PromoCodeStats'
import { PromoCodeList } from './components/PromoCodeList'
import { LoginPage } from './components/LoginPage'
import { UserMenu } from './components/UserMenu'
import { useAuth } from './hooks/useAuth'

function AppContent() {
  const { isAuthenticated, user, loading, signOut } = useAuth()
  const location = useLocation()

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'add-codes', name: 'Add Codes', icon: Plus, path: '/add' },
    { id: 'view-codes', name: 'View Codes', icon: Database, path: '/view' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://assets.gwsave.com/icon.svg"
                alt="GWSave Icon" 
                className="w-8 h-8"
                onError={(e) => {
                  // Fallback to Settings icon if image fails to load
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <Settings className="w-8 h-8 text-blue-600 hidden" />
              <div className="flex items-center gap-2">
                <img 
                  src="https://assets.gwsave.com/header-logo.svg"
                  alt="GWSave"
                  width="80"
                  className="h-auto"
                  onError={(e) => {
                    // Fallback to text if logo fails to load
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <h1 className="text-xl font-semibold text-gray-900 hidden">
                  Google Workspace Promo Code Manager
                </h1>
                <span className="text-xl font-semibold text-gray-900 ml-2">Admin</span>
              </div>
            </div>
            <div className="flex items-center">
              {user && <UserMenu user={user} onSignOut={signOut} />}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = location.pathname === tab.path
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<PromoCodeStats />} />
          <Route path="/add" element={<PromoCodeForm />} />
          <Route path="/view" element={<PromoCodeList />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  )
}

export default App
