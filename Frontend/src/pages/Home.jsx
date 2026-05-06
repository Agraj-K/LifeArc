import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../index.css'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>


      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-[90px] pt-32 pb-40">
        <div className="animate-fade-rise flex flex-col items-center">
          <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">Your Personal Growth Sanctuary</span>
          <h1
            className="text-6xl sm:text-8xl md:text-9xl font-normal max-w-7xl leading-[0.9] tracking-[-0.04em]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Velora. <em className="not-italic text-white/30">Where clarity meets ambition.</em>
          </h1>
        </div>

        <p className="animate-fade-rise-delay text-white/50 text-lg sm:text-xl max-w-2xl mt-10 leading-relaxed font-light">
          Document your reflections, conquer your habits, and witness your journey rise through the silence. A sanctuary for deep thinkers and bold creators.
        </p>

        <div className="animate-fade-rise-delay-2 flex flex-col sm:flex-row items-center gap-6 mt-14">
          {user ? (
            <Link
              to="/dashboard"
              className="liquid-glass rounded-full px-16 py-5 text-base text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(20,184,166,0.2)]"
            >
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/register"
                className="liquid-glass rounded-full px-16 py-5 text-base text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(20,184,166,0.2)]"
              >
                Begin Your Journey
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}