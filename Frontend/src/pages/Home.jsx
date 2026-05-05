import { Link } from 'react-router-dom'
import '../index.css'

export default function Home() {
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

      <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-3xl tracking-tight text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Velorah<sup className="text-xs">®</sup>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-white transition-colors">Home</Link>
          <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">Studio</Link>
          <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
          <Link to="/journal" className="text-sm text-white/60 hover:text-white transition-colors">Journal</Link>
          <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">Reach Us</Link>
        </div>

        <Link 
          to="/login"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white cursor-pointer hover:scale-105 transition-transform inline-block text-center no-underline"
        >
          Begin Journey
        </Link>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-[90px] pt-32 pb-40">
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl font-normal max-w-7xl leading-[0.95] tracking-[-2.46px]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-white/40">dreams</em> rise <em className="not-italic text-white/40">through the silence.</em>
        </h1>

        <p className="animate-fade-rise-delay text-white/50 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <Link 
          to="/login"
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 cursor-pointer inline-block text-center no-underline hover:scale-105 transition-transform"
        >
          Begin Journey
        </Link>
      </section>
    </div>
  )
}