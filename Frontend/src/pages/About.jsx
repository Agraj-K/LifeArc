import { Link } from 'react-router-dom'
import '../index.css'

export default function About() {
  const team = [
    { name: 'Agraj K', role: 'Lead Architect', roll: 'AM.SC.U4AIE23105', avatar: 'AK' },
    { name: 'Jaydeep Dileep', role: 'Core Engineer', roll: 'AM.SC.U4AIE23114', avatar: 'JD' },
    { name: 'Keziah Suzaine', role: 'Design Director', roll: 'AM.SC.U4AIE23122', avatar: 'KS' },
  ]

  const pillars = [
    { 
      title: 'Intentional Awareness', 
      desc: 'Most digital tools demand your attention. Velora gives it back. We provide a space to map your life events and goals without the clutter of traditional social media.',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    },
    { 
      title: 'The Art of Consistency', 
      desc: 'Growth isn’t an event; it’s a habit. Our tracking systems are designed to be friction-less, turning daily discipline into a visual masterpiece of your progress.',
      icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
    },
    { 
      title: 'Quiet Reflection', 
      desc: 'Through our Twitter-style public feeds and private journals, we bridge the gap between community inspiration and personal introspection.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
    }
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Background with deepened atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,18%)] opacity-95" />
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-teal-900/20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[120px] animate-pulse" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-8 pt-32 pb-24">
        
        {/* Section 1: The Manifesto */}
        <section className="text-center mb-32 animate-fade-rise">
          <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.4em] mb-8 block">The Philosophy</span>
          <h1 className="text-6xl md:text-8xl text-white tracking-tight mb-10 leading-[0.9]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Reclaiming the <em className="not-italic text-white/30 text-7xl md:text-9xl">Inner Arc.</em>
          </h1>
          <p className="text-white/60 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light italic">
            "In an age of constant noise, Velora was built as a sanctuary—a digital space designed not for distraction, but for the deliberate documentation of one's existence."
          </p>
        </section>

        {/* Section 2: The Origin */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
          <div className="space-y-8 animate-fade-rise">
            <h2 className="text-4xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Born in the <em className="text-white/40 not-italic">Halls of Amrita.</em>
            </h2>
            <div className="space-y-6 text-white/50 leading-relaxed text-lg font-light">
              <p>
                Velora started as a vision within the Full Stack Development course at Amrita Vishwa Vidyapeetham. We didn't want to build just another CRUD application; we wanted to build a legacy tool.
              </p>
              <p>
                Our team set out to combine the high-performance capabilities of the MERN stack with a design language that speaks to the soul—one that feels as quiet as a library and as sharp as a diamond.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                Version 2.0 Deployment Active
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-rise">
            <div className="aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/10 to-blue-500/10 backdrop-blur-2xl p-1">
              <div className="h-full w-full rounded-[22px] overflow-hidden bg-black/40 flex items-center justify-center p-12 text-center">
                <div>
                   <svg className="text-teal-400/20 mx-auto mb-8" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                     <path d="M12 3v19M5 8h14M5 16h14"/>
                   </svg>
                   <p className="text-white/30 text-sm tracking-[0.2em] uppercase font-bold">The Blueprint of Focus</p>
                </div>
              </div>
            </div>
            {/* Decorative Orbs */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
          </div>
        </section>

        {/* Section 3: The Pillars */}
        <section className="mb-40">
           <div className="text-center mb-16">
             <h2 className="text-4xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>Our Founding <em className="text-white/40 not-italic">Pillars</em></h2>
             <p className="text-white/40 text-sm tracking-widest uppercase">The values that guide every line of code.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((p, i) => (
                <div key={i} className="group p-10 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-8 border border-teal-500/20 group-hover:scale-110 transition-transform">
                    <svg className="text-teal-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={p.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>{p.title}</h3>
                  <p className="text-white/40 leading-relaxed font-light">{p.desc}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Section 4: The Architects */}
        <section className="mb-40">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 px-4">
            <div>
              <h2 className="text-5xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>The <em className="text-white/40 not-italic">Architects.</em></h2>
              <p className="text-white/40 mt-4 max-w-md">Meet the humans behind the sanctuary—a dedicated trio of engineers and designers committed to mindful technology.</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-white/5 mx-12 mb-4" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md p-10 transition-all duration-700 hover:bg-white/10">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-teal-500 to-blue-600 p-[1px] mb-8 group-hover:rotate-6 transition-transform duration-500">
                  <div className="h-full w-full rounded-[1.9rem] bg-[hsl(201,100%,10%)] flex items-center justify-center">
                    <span className="text-3xl text-white font-serif">{member.avatar}</span>
                  </div>
                </div>
                <h3 className="text-2xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>{member.name}</h3>
                <p className="text-teal-400 text-sm mt-1 mb-4">{member.role}</p>
                <div className="h-px w-12 bg-white/10 mb-4 group-hover:w-full transition-all duration-700" />
                <p className="text-white/30 text-xs tracking-widest">{member.roll}</p>
              </div>
            ))}
          </div>
        </section>



        {/* Final CTA */}
        <section className="text-center">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full" />
             <div className="relative">
                <h2 className="text-5xl text-white mb-10" style={{ fontFamily: "'Instrument Serif', serif" }}>Begin Your <em className="text-white/40 not-italic">Own Arc.</em></h2>
                <Link 
                  to="/register"
                  className="liquid-glass inline-block rounded-full px-16 py-6 text-lg text-white cursor-pointer hover:scale-105 transition-all no-underline shadow-2xl"
                >
                  Join the Sanctuary
                </Link>
             </div>
          </div>
        </section>
      </main>
    </div>
  )
}