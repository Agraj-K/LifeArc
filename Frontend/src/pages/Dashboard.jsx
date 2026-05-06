import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Dashboard() {
  const [stats, setStats] = useState({ events: 0, goals: 0, habits: 0, journalEntries: 0, streak: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [goals, setGoals] = useState([])
  const [habitsData, setHabitsData] = useState([])
  const [aiInsights, setAiInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [upNext, setUpNext] = useState(null)

  useEffect(() => {
    if (goals.length > 1) {
      const interval = setInterval(() => {
        setCurrentGoalIndex(prev => (prev + 1) % goals.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [goals])

  useEffect(() => {
    if (recentEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentEventIndex(prev => (prev + 1) % recentEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [recentEvents]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profileRes, eventsRes, goalsRes, journalRes] = await Promise.all([
          API.get('/profile'),
          API.get('/events'),
          API.get('/goals'),
          API.get('/journal')
        ])
        setStats(profileRes.data.stats)
        setRecentEvents(eventsRes.data.slice(0, 4))
        
        const topGoals = goalsRes.data.slice(0, 3)
        setGoals(topGoals)

        const logsPromises = topGoals.map(g => API.get(`/habits/goal/${g._id}/logs`).catch(() => ({ data: { logs: [] } })))
        const logsResponses = await Promise.all(logsPromises)
        
        const trackingData = topGoals.map((g, i) => ({
           goalId: g._id,
           logs: logsResponses[i]?.data?.logs || []
        }))
        setHabitsData(trackingData)
        
        const now = new Date();
        const futureItems = [
          ...eventsRes.data.filter(e => e.startDate && new Date(e.startDate) > now).map(e => ({ ...e, type: 'Event', date: new Date(e.startDate) })),
          ...goalsRes.data.filter(g => g.targetDate && new Date(g.targetDate) > now).map(g => ({ ...g, type: 'Goal', date: new Date(g.targetDate) }))
        ].sort((a, b) => a.date - b.date);
        setUpNext(futureItems.length > 0 ? futureItems[0] : null);
        // Compute AI insights from last 5 journal entries
        const recentJournal = journalRes.data.slice(0, 5)
        setAiInsights(computeInsights(recentJournal))
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const computeInsights = (entries) => {
    if (localStorage.getItem('aiEnabled') === 'false') return null
    if (!entries || entries.length === 0) return null
    const positiveWords = ['happy', 'excited', 'great', 'amazing', 'proud', 'motivated', 'joy', 'achieved', 'awesome', 'wonderful', 'love', 'grateful', 'progress', 'success', 'confident']
    const negativeWords = ['stressed', 'tired', 'anxious', 'overwhelmed', 'deadline', 'failed', 'behind', 'worried', 'difficult', 'bad', 'sad', 'exhausted', 'frustrated', 'stuck']
    const allText = entries.map(e => `${e.title || ''} ${e.content || ''}`).join(' ').toLowerCase()
    let pos = 0, neg = 0
    positiveWords.forEach(w => { if (allText.includes(w)) pos++ })
    negativeWords.forEach(w => { if (allText.includes(w)) neg++ })
    const mood = pos > neg + 1 ? 'positive' : neg > pos + 1 ? 'stressed' : 'neutral'
    const recommendations = {
      positive: [
        '🚀 Your momentum is great — set a stretch goal this week!',
        '🏆 Log your recent win as a Life Event to celebrate progress.',
      ],
      stressed: [
        '🎯 Break your current goals into smaller, manageable milestones.',
        '🌿 Consider adding a short daily self-care habit to your routine.',
      ],
      neutral: [
        '💡 Reflect on what matters most to you this week.',
        '🔁 A consistent daily habit compounds into big growth over time.',
      ],
    }
    const moodMeta = {
      positive: { emoji: '😊', label: 'Positive', color: 'emerald' },
      stressed: { emoji: '😓', label: 'Stressed', color: 'amber' },
      neutral:  { emoji: '😐', label: 'Neutral',  color: 'blue' },
    }
    return { mood, meta: moodMeta[mood], recs: recommendations[mood], entriesAnalyzed: entries.length }
  }

  const calculateYearProgress = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const progress = ((now - start) / (end - start)) * 100;
    return {
      percentage: progress.toFixed(1),
      daysLeft: Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    };
  };
  const yearProgress = calculateYearProgress();

  const quotes = [
    "The secret of getting ahead is getting started.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you can imagine is real.",
    "Whatever you are, be a good one.",
    "Turn your wounds into wisdom."
  ];
  const quoteOfDay = quotes[new Date().getDay() % quotes.length];

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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Memories Carousel (Recent Events) */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl shadow-black/50 min-h-[400px]">
            {recentEvents.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                <h2 className="text-3xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Memories</h2>
                <p className="text-white/40 text-sm mb-4">No memories yet. Start capturing your journey.</p>
                <Link to="/events" className="text-teal-400 hover:text-teal-300 text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">Capture Memory →</Link>
              </div>
            ) : (
              <>
                {recentEvents.map((event, index) => {
                  const isActive = index === currentEventIndex;
                  const hasImage = event.images && event.images.length > 0;
                  return (
                    <div 
                      key={event._id} 
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      {hasImage ? (
                        <img 
                          src={event.images[0]} 
                          className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`} 
                          alt={event.title} 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[hsl(201,100%,10%)] to-blue-900/60 flex items-center justify-center relative overflow-hidden">
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                           <svg className="text-white/10 w-1/3 h-1/3 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}
                      
                      {/* Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />
                      
                      {/* Event Info */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-start">
                          <h2 className="text-2xl text-white/90 drop-shadow-md" style={{ fontFamily: "'Instrument Serif', serif" }}>
                            Memories
                          </h2>
                          <Link to="/events" className="text-xs text-white/70 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto transition-colors">
                            View All
                          </Link>
                        </div>
                        <div className="translate-y-4 transition-transform duration-1000" style={{ transform: isActive ? 'translateY(0)' : 'translateY(1rem)' }}>
                          <div className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border border-white/20 bg-white/10 backdrop-blur-md text-white mb-3 drop-shadow-md">
                            {event.category}
                          </div>
                          <h3 className="text-3xl text-white font-medium mb-2 drop-shadow-lg leading-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{event.title}</h3>
                          <div className="text-white/80 text-sm drop-shadow-md flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            
            {/* Carousel Indicators */}
            {recentEvents.length > 1 && (
              <div className="absolute bottom-8 right-8 flex gap-1.5 z-20">
                {recentEvents.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentEventIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>
            )}
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
                ) : (
                  (() => {
                    const goal = goals[currentGoalIndex]
                    const tracking = habitsData.find(h => h.goalId === goal._id) || { logs: [] }
                    const today = new Date()
                    const createdDate = new Date(goal.createdAt || today)
                    createdDate.setHours(0, 0, 0, 0)
                    const todayMid = new Date(today)
                    todayMid.setHours(0, 0, 0, 0)
                    const daysSinceCreation = Math.max(1, Math.floor((todayMid.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                    const attendedCount = tracking.logs?.filter(l => l.status === 'attended').length || 0

                    let computedScore = 0
                    if (goal.targetDate) {
                      const target = new Date(goal.targetDate)
                      target.setHours(0, 0, 0, 0)
                      const totalDaysToTarget = Math.max(daysSinceCreation, Math.floor((target.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                      computedScore = parseFloat(((attendedCount / totalDaysToTarget) * 100).toFixed(2))
                    } else {
                      computedScore = parseFloat(((attendedCount / daysSinceCreation) * 100).toFixed(2))
                    }

                    const showComputed = !goal.milestones || goal.milestones.length === 0
                    const displayProgress = showComputed ? Math.min(100, computedScore) : goal.progress

                    // Calendar Logic
                    const currentYear = today.getFullYear()
                    const currentMonth = today.getMonth()
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
                    
                    const calendarDays = []
                    for(let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
                    for(let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(currentYear, currentMonth, d))

                    return (
                      <div key={goal._id} className="animate-fade-in relative flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{goal.title}</h3>
                          <span className="text-white/40 text-[10px] tracking-widest uppercase font-bold">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No target'}</span>
                        </div>
                        
                        <div className="mb-6">
                           <div className="flex justify-between text-xs text-white/40 mb-2 font-medium tracking-wide uppercase text-[9px]">
                              <span>Momentum</span>
                              <span className="text-white">{displayProgress}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                             <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${displayProgress}%` }} />
                           </div>
                        </div>

                        {/* Miniature Habit Calendar */}
                        <div className="p-4 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                           </div>
                           <div className="grid grid-cols-7 gap-1">
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                 <div key={idx} className="text-center text-[8px] uppercase tracking-[0.1em] text-white/20 font-bold pb-1">
                                    {d}
                                 </div>
                              ))}
                              {calendarDays.map((dateObj, i) => {
                                 if (!dateObj) return <div key={i} className="aspect-square bg-transparent" />
                                 
                                 const dateObjTime = dateObj.getTime()
                                 const isPast = dateObjTime < todayMid.getTime()
                                 const isAfterCreation = dateObjTime >= createdDate.getTime()

                                 const log = tracking.logs?.find(l => new Date(l.date).toLocaleDateString() === dateObj.toLocaleDateString())
                                 
                                 let isAttended = log?.status === 'attended'
                                 let isMissed = log?.status === 'missed'
                                 
                                 if (!log && isPast && isAfterCreation) {
                                   isMissed = true
                                 }
                                 
                                 let cellClass = "aspect-square rounded-[0.4rem] flex items-center justify-center text-[9px] font-bold transition-all "
                                 
                                 if (isAttended) {
                                   cellClass += "bg-teal-500/20 text-teal-400 border border-teal-500/30 "
                                 } else if (isMissed) {
                                   cellClass += "bg-red-500/10 text-red-500/50 border border-red-500/10 "
                                 } else {
                                   cellClass += "bg-white/[0.02] text-white/20 "
                                 }

                                 return (
                                   <div key={i} className={cellClass}>
                                      {isAttended && log.photo ? (
                                        <div className="w-full h-full rounded-[0.4rem] bg-cover bg-center border border-teal-500/50 opacity-80" style={{ backgroundImage: `url(${log.photo})` }} />
                                      ) : isMissed ? (
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                      ) : (
                                        dateObj.getDate()
                                      )}
                                   </div>
                                 )
                              })}
                           </div>
                        </div>

                        {/* Dots indicator */}
                        {goals.length > 1 && (
                          <div className="flex justify-center gap-2 mt-6">
                            {goals.map((_, i) => (
                              <button 
                                key={i} 
                                onClick={() => setCurrentGoalIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentGoalIndex ? 'bg-teal-400 w-4' : 'bg-white/10 hover:bg-white/30'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()
                )}
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

        {/* New Insight Widgets */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Up Next Widget */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-2xl shadow-2xl p-8 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h3 className="text-white/60 text-sm font-medium tracking-wide uppercase">Up Next</h3>
              </div>
              
              {upNext ? (
                <div>
                  <h4 className="text-3xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{upNext.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs border border-white/10">{upNext.type}</span>
                    <span className="text-teal-400 text-sm font-medium">
                      In {Math.ceil((upNext.date - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-2xl text-white/40 mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Nothing approaching</h4>
                  <p className="text-white/30 text-sm">You have no upcoming events or goals scheduled.</p>
                </div>
              )}
            </div>
            
            {upNext && (
              <div className="mt-8">
                <div className="text-white/40 text-xs mb-2">Target Date</div>
                <div className="text-white/80">{upNext.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
            )}
          </div>

          {/* Year in Progress & Quote */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-white/60 text-sm font-medium tracking-wide uppercase">Year in Progress</h3>
                <span className="text-white text-2xl font-semibold">{yearProgress.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-2">
                <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" style={{ width: `${yearProgress.percentage}%` }} />
              </div>
              <div className="text-right text-white/40 text-xs">{yearProgress.daysLeft} days remaining in {new Date().getFullYear()}</div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 relative">
              <div className="absolute -top-3 -left-2 text-4xl text-white/10 font-serif">"</div>
              <p className="text-white/80 text-lg italic relative z-10 leading-relaxed" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {quoteOfDay}
              </p>
              <div className="text-white/30 text-xs mt-3">— Daily Motivation</div>
            </div>
          </div>
          
        </div>

        {/* AI Insights Card */}
        {aiInsights && (
          <div className="mt-8 relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 animate-fade-rise">
            <div className="absolute -top-[120px] -right-[120px] w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[60px] -left-[60px] w-[200px] h-[200px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="text-purple-400" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>AI Insights</h2>
                  <p className="text-white/30 text-xs">Based on your last {aiInsights.entriesAnalyzed} journal {aiInsights.entriesAnalyzed === 1 ? 'entry' : 'entries'}</p>
                </div>
                <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full border ${
                  aiInsights.mood === 'positive' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                  aiInsights.mood === 'stressed' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' :
                  'border-blue-500/30 bg-blue-500/10 text-blue-300'
                }`}>
                  <span className="text-lg">{aiInsights.meta.emoji}</span>
                  <span className="text-sm font-medium">{aiInsights.meta.label} Mood</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Recommendations for you</p>
                {aiInsights.recs.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-purple-500/15 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/25 transition-all duration-300">
                    <span className="text-lg leading-none mt-0.5">{rec.split(' ')[0]}</span>
                    <p className="text-white/70 text-sm leading-relaxed">{rec.split(' ').slice(1).join(' ')}</p>
                  </div>
                ))}
              </div>

              <Link to="/journal" className="mt-5 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                Write in your journal →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}