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
import Feedback from './pages/Feedback'
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
  
  // Custom transparent navbar for landing page
  const isLanding = location.pathname === '/'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 transition-all duration-500 ${
      isLanding ? 'bg-transparent' : 'bg-[hsla(201,100%,10%,0.8)] backdrop-blur-xl border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
        <Link to="/" className="text-2xl tracking-tight text-white group" style={{ fontFamily: "'Instrument Serif', serif", textDecoration: 'none' }}>
          Velora<span className="text-teal-400 group-hover:animate-pulse">.</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            /* Registered User Links */
            <>
              <Link to="/dashboard" className="nav-link font-medium text-white/90">Dashboard</Link>
              <Link to="/events" className="nav-link">Events</Link>
              <Link to="/journal" className="nav-link">Journal</Link>
              <Link to="/goals" className="nav-link">Goals</Link>
              <Link to="/habits" className="nav-link">Habits</Link>
              <Link to="/feedback" className="nav-link">Feedback</Link>
            </>
          ) : (
            /* Guest User Links */
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/journal" className="nav-link">Journal</Link>
              <Link to="/feedback" className="nav-link">Feedback</Link>
            </>
          )}
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link text-purple-400">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Link to="/profile" className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="liquid-glass rounded-full px-5 py-2 text-sm text-white hover:scale-105 active:scale-95 transition-all"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="liquid-glass rounded-full px-5 py-2 text-sm text-white hover:scale-105 active:scale-95 transition-all" style={{ textDecoration: 'none' }}>
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
  const { user } = useAuth()
  return (
    <>
      <Navigation />
      <PageWrapper>
        <Routes>
          <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register"  element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journal"   element={<Journal />} />
          <Route path="/about"     element={<About />} />
          <Route path="/feedback"  element={<Feedback />} />
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