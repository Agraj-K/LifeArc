import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Journal from './pages/Journal'
import Events from './pages/Events'
import Goals from './pages/Goals'
import Habits from './pages/Habits'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import About from './pages/About'
import './index.css'

// Redirects to /login if user is not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

// Admin-only route guard
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function Navigation() {
  const location = useLocation()
  const { user, logout } = useAuth()
  if (location.pathname === '/') return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4" style={{ backgroundColor: 'hsla(201, 100%, 10%, 0.8)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
        <Link to="/" className="text-2xl tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif", textDecoration: 'none' }}>
          Velorah<sup className="text-xs">®</sup>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
          <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
          <Link to="/events" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Events</Link>
          <Link to="/goals" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Goals</Link>
          <Link to="/habits" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Habits</Link>
          <Link to="/journal" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Journal</Link>
          <Link to="/about" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>About</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="liquid-glass rounded-full px-5 py-2 text-sm text-white hover:scale-105 transition-transform"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="liquid-glass rounded-full px-5 py-2 text-sm text-white hover:scale-105 transition-transform" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function PageWrapper({ children }) {
  const location = useLocation()
  return (
    <div style={{ paddingTop: location.pathname === '/' ? 0 : '80px' }}>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <>
      <Navigation />
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journal"   element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/events"    element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/goals"     element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/habits"    element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin"     element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </PageWrapper>
    </>
  )
}