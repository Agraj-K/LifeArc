import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import '../index.css'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setName('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const endpoint = mode === 'login' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'http://localhost:5000/api/auth/register';
      
      const payload = mode === 'login' 
        ? { email, password } 
        : { name, email, password };

      const { data } = await axios.post(endpoint, payload);
      
      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Liquid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
        <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/20 blur-[90px] animate-drift-3" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Back to Home */}
      <Link to="/" className="absolute top-6 left-8 z-20 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Home
      </Link>

      {/* Main Card */}
      <div className="animate-fade-rise relative z-10 w-full max-w-[420px] px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
          
          <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative p-8 md:p-10 flex flex-col gap-8">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border border-white/10 mb-4 shadow-inner">
                <svg className="text-teal-200" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <h1 className="text-4xl text-white tracking-wide" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {mode === 'login' ? 'Welcome Back' : 'Join Velorah'}
              </h1>
              <p className="text-white/50 text-sm tracking-wide">
                {mode === 'login' 
                  ? 'Enter your credentials to access your account.' 
                  : 'Create an account to start your journey.'}
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              
              {mode === 'signup' && (
                <div className="relative group animate-fade-rise">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                    placeholder="Full Name"
                  />
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                  placeholder="Email Address"
                />
              </div>
              
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-teal-400 transition-colors duration-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                  placeholder="Password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end animate-fade-rise">
                  <a href="#" className="text-xs text-white/40 hover:text-teal-400 transition-colors font-medium tracking-wide">
                    Forgot Password?
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="liquid-glass relative w-full py-3.5 mt-2 text-sm font-semibold tracking-wider uppercase text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/20 text-xs uppercase tracking-widest font-medium">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center gap-4">
              <button className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-110" aria-label="Google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-110" aria-label="Apple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
                  <path d="M10 2c1 .5 2 2 2 5"/>
                </svg>
              </button>
            </div>

            {/* Footer Toggle */}
            <div className="text-center pt-2">
              <p className="text-white/40 text-sm">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={toggleMode}
                  className="ml-2 text-teal-400 hover:text-teal-300 font-medium transition-colors hover:underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

          </div>
        </div>
        
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-teal-900/20 blur-xl rounded-full -z-10" />
      </div>
    </div>
  )
}