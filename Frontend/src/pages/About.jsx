import { Link } from 'react-router-dom'
import '../index.css'

export default function About() {
  const team = [
    { name: 'Agraj K', role: 'Lead Developer', roll: 'AM.SC.U4AIE23105', avatar: 'AK' },
    { name: 'Jaydeep Dileep', role: 'Backend Engineer', roll: 'AM.SC.U4AIE23114', avatar: 'JD' },
    { name: 'Keziah Suzaine', role: 'UI/UX Designer', roll: 'AM.SC.U4AIE23122', avatar: 'KS' },
  ]

  const features = [
    { 
      title: 'Life Events', 
      description: 'Record and organize significant moments in your life journey. Tag locations, add images, and track progress.',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    },
    { 
      title: 'Goal Tracking', 
      description: 'Set meaningful goals with milestones. Break down big dreams into achievable steps and watch your progress grow.',
      icon: 'M12 20V10M18 20V4M6 20v-6'
    },
    { 
      title: 'Habit Builder', 
      description: 'Build consistency with daily habit tracking. Visual calendars show your streaks and motivate you to keep going.',
      icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z'
    },
    { 
      title: 'Journal', 
      description: 'A private space for reflections, thoughts, and daily musings. Everything stays here, safe and personal.',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
    },
    { 
      title: 'Analytics', 
      description: 'Beautiful dashboards visualize your growth. See patterns, celebrate milestones, and stay motivated.',
      icon: 'M3 3v18h18 M18.7 8l-5.1 5.2-2.8-2.7L7 14.3'
    },
    { 
      title: 'Secure & Private', 
      description: 'Your data is encrypted and protected. JWT authentication ensures only you can access your personal growth data.',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
    },
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
        <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/20 blur-[90px] animate-drift-3" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        
        {/* Hero */}
        <div className="text-center mb-20 animate-fade-rise">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border border-white/10 mb-8">
            <svg className="text-teal-200" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-7xl text-white tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            About <em className="not-italic text-white/40">Velorah</em>
          </h1>
          
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            LifeArc is a structured personal growth management system built to help you record, organize, and analyze your life journey. Built with the MERN stack as part of our Full Stack Development course at Amrita Vishwa Vidyapeetham.
          </p>

          <div className="flex items-center justify-center gap-4 text-white/30 text-sm">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Secure & Private
            </span>
            <span>·</span>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              MERN Stack
            </span>
            <span>·</span>
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              2026
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>
            What You Can <em className="not-italic text-white/40">Do</em>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-teal-500/30 transition-colors duration-300">
                  <svg className="text-teal-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                
                <h3 className="text-xl text-white mb-3 group-hover:text-teal-200 transition-colors" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>
            The <em className="not-italic text-white/40">Team</em>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-white font-semibold">{member.avatar}</span>
                </div>
                
                <h3 className="text-xl text-white mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {member.name}
                </h3>
                <p className="text-teal-400 text-sm mb-2">{member.role}</p>
                <p className="text-white/30 text-xs">{member.roll}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-20">
          <h2 className="text-3xl text-white text-center mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Built <em className="not-italic text-white/40">With</em>
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['MongoDB', 'Express.js', 'React', 'Node.js', 'Tailwind CSS', 'JWT Auth'].map((tech, i) => (
              <div key={i} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300">
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Ready to Start Your Journey?
          </h2>
          <Link 
            to="/login"
            className="liquid-glass inline-block rounded-full px-12 py-5 text-base text-white cursor-pointer hover:scale-105 transition-transform no-underline"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  )
}