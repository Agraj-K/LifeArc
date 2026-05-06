import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import '../index.css'

export default function Suspended() {
  const [reason, setReason] = useState('No reason provided.')
  const [appealMessage, setAppealMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedReason = localStorage.getItem('suspensionReason')
    if (savedReason) {
      setReason(savedReason)
    } else {
      // If someone just randomly navigated here, boot them to login
      navigate('/login')
    }
  }, [navigate])

  const handleAppeal = async (e) => {
    e.preventDefault();
    if (!appealMessage.trim()) return toast.error('Please enter an appeal message');
    
    setSubmitting(true);
    try {
      const email = localStorage.getItem('suspensionEmail') || 'unknown_suspended_user@velora.com';
      await axios.post('http://localhost:5000/api/feedback', {
        name: 'Suspended User',
        email: email,
        message: appealMessage,
        type: 'Appeal'
      });
      toast.success('Appeal submitted successfully. The admins will review it.');
      setAppealMessage('');
      localStorage.removeItem('suspensionReason');
      localStorage.removeItem('suspensionEmail');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      toast.error('Failed to submit appeal. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-red-900/20 blur-[120px] animate-drift-1" />
      </div>

      <div className="animate-fade-rise relative z-10 w-full max-w-[420px] px-4">
        <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-red-500/10 p-8 md:p-10 flex flex-col gap-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-inner bg-red-500/20 border border-red-500/30">
              <svg className="text-red-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-4xl text-white tracking-wide" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Account Suspended
            </h1>
            <p className="text-white/50 text-sm tracking-wide">
              Your access to the platform has been restricted.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Reason for suspension</div>
              <div className="text-white/80 text-sm">{reason}</div>
            </div>
            
            <form onSubmit={handleAppeal} className="flex flex-col gap-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs text-white/40 uppercase tracking-wider">Submit an Appeal</label>
                <textarea 
                  required
                  value={appealMessage}
                  onChange={e => setAppealMessage(e.target.value)}
                  placeholder="Explain why your account should be reinstated. Please include your email."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300 resize-none h-24"
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm font-semibold transition-all border border-red-500/30"
              >
                {submitting ? 'Submitting...' : 'Send Appeal'}
              </button>
              <Link 
                to="/login"
                className="text-white/40 text-sm hover:text-white transition-colors mt-2 text-center w-full block"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('suspensionReason');
                  localStorage.removeItem('suspensionEmail');
                }}
              >
                Back to Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
