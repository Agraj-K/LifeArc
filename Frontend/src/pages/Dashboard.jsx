import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, goals: 0, habits: 0, journalEntries: 0, streak: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profileRes, eventsRes, goalsRes] = await Promise.all([
          API.get('/profile'),
          API.get('/events'),
          API.get('/goals'),
        ])
        setStats(profileRes.data.stats)
        setRecentEvents(eventsRes.data.slice(0, 4))
        setGoals(goalsRes.data.slice(0, 3))
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        
        {/* Header */}
        <div className="mb-12 animate-fade-rise">
          <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Your <em className="not-italic text-white/40">Dashboard</em>
          </h1>
          <p className="text-white/50 text-base mt-4 max-w-xl">
            Track your growth, monitor progress, and stay focused on what matters most.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Life Events', value: stats.events, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', color: 'teal' },
            { label: 'Active Goals', value: stats.goals, icon: 'M12 20V10M18 20V4M6 20v-6', color: 'blue' },
            { label: 'Habit Streak', value: `${stats.streak} days`, icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', color: 'cyan' },
            { label: 'Journal Entries', value: stats.journalEntries, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', color: 'emerald' },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <svg className={`text-${stat.color}-400 mb-4`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={stat.icon} />
              </svg>
              <div className="text-3xl text-white font-semibold mb-1">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Events */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
            <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Recent Events
                </h2>
                <Link to="/events" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {recentEvents.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No events yet. <Link to="/events" className="text-teal-400 hover:text-teal-300">Create one →</Link></p>
                ) : recentEvents.map((event) => (
                  <div key={event._id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/30 transition-colors">
                      <svg className="text-white/40 group-hover:text-teal-400 transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium group-hover:text-teal-200 transition-colors">{event.title}</h3>
                      <p className="text-white/40 text-xs">{event.category} · {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm">{event.progress}%</div>
                      <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-teal-500/60 rounded-full" style={{ width: `${event.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
            <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Active Goals
                </h2>
                <Link to="/goals" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                  View All →
                </Link>
              </div>

              <div className="space-y-6">
                {goals.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No goals yet. <Link to="/goals" className="text-teal-400 hover:text-teal-300">Create one →</Link></p>
                ) : goals.map((goal) => (
                  <div key={goal._id}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{goal.title}</h3>
                      <span className="text-white/40 text-sm">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No date'}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <div className="text-right text-white/40 text-xs mt-1">{goal.progress}% complete</div>
                  </div>
                ))}
              </div>

              <Link 
                to="/goals"
                className="mt-6 block w-full py-3 text-center rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-300 text-sm"
              >
                + Create New Goal
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Event', path: '/events', icon: 'M12 5v14M5 12h14' },
            { label: 'New Goal', path: '/goals', icon: 'M12 20V10M18 20V4M6 20v-6' },
            { label: 'Journal', path: '/journal', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
            { label: 'Habits', path: '/habits', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
          ].map((action, i) => (
            <Link 
              key={i}
              to={action.path}
              className="group flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/30 transition-colors">
                <svg className="text-white/40 group-hover:text-teal-400 transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={action.icon} />
                </svg>
              </div>
              <span className="text-white/60 group-hover:text-white transition-colors text-sm">{action.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}