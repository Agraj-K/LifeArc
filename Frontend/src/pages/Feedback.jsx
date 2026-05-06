import { useState } from 'react'
import { toast } from 'sonner'

export default function Feedback() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', type: 'Feedback' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for your feedback!')
      setFormData({ name: '', email: '', message: '', type: 'Feedback' })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Motion Background (Tailwind Re-implementation) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-cyan-900/20 blur-[80px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-24 animate-fade-rise">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl p-8 md:p-12">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              We'd Love to <em className="text-white/40 not-italic">Hear from You</em>
            </h1>
            <p className="text-white/50 text-sm mt-4 max-w-md mx-auto">
              Your feedback helps us build a better space for everyone. Reach out with thoughts, bugs, or just a hello.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 ml-1">Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 ml-1">Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40 ml-1">Message</label>
              <textarea 
                required 
                rows="5" 
                placeholder="What's on your mind?"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="liquid-glass w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Subtle Decorative Element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/5 blur-[50px] rounded-full pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
