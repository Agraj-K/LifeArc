import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [goalTracking, setGoalTracking] = useState({}) // goalId -> { habitId, logs: [] }
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const heatmapScrollRefs = useRef({})

  const [formData, setFormData] = useState({ title: '', category: 'Career', description: '', targetDate: '', progress: 0, milestones: [] })
  const [newMilestone, setNewMilestone] = useState('')

  const [activeGoalForLog, setActiveGoalForLog] = useState(null)
  const [logNote, setLogNote] = useState('')
  const [logPhoto, setLogPhoto] = useState(null)
  const [logPreview, setLogPreview] = useState(null)

  const [showGuidance, setShowGuidance] = useState(false)

  const categories = ['Career', 'Health', 'Learning', 'Relationships', 'Finance', 'Travel', 'Other']
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  useEffect(() => { fetchGoals() }, [])


  const fetchGoals = async () => {
    try {
      const { data } = await API.get('/goals')
      setGoals(data)
      data.forEach(g => fetchGoalLogs(g._id))
    } catch { toast.error('Failed to load goals') }
    finally { setLoading(false) }
  }

  const fetchGoalLogs = async (goalId) => {
    try {
      const { data } = await API.get(`/habits/goal/${goalId}/logs`)
      setGoalTracking(prev => ({ ...prev, [goalId]: data }))
      // Auto-scroll to the end (today) once logs load
      setTimeout(() => {
        if (heatmapScrollRefs.current[goalId]) {
          heatmapScrollRefs.current[goalId].scrollLeft = heatmapScrollRefs.current[goalId].scrollWidth
        }
      }, 100)
    } catch (err) { console.error('Failed to fetch logs', err) }
  }

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return
    setFormData({ ...formData, milestones: [...formData.milestones, { text: newMilestone, done: false }] })
    setNewMilestone('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { data } = await API.put(`/goals/${editingId}`, formData)
        setGoals(prev => prev.map(g => g._id === editingId ? data : g))
        toast.success('Goal updated')
        setEditingId(null)
      } else {
        const { data } = await API.post('/goals', formData)
        setGoals(prev => [data, ...prev])
        fetchGoalLogs(data._id)
        toast.success('Goal established')
      }
      setFormData({ title: '', category: 'Career', description: '', targetDate: '', progress: 0, milestones: [] })
      setIsCreating(false)
    } catch { toast.error('Failed to save goal') }
  }

  const handleLog = async (goalId, status) => {
    const tracking = goalTracking[goalId]
    if (!tracking?.habitId) return
    try {
      const normalizedDate = new Date()
      normalizedDate.setHours(0, 0, 0, 0)
      const fData = new FormData()
      fData.append('date', normalizedDate.toISOString())
      fData.append('status', status)
      await API.post(`/habits/${tracking.habitId}/log`, fData)
      fetchGoalLogs(goalId)
      toast.success(status === 'attended' ? 'Momentum captured! ✅' : 'Marked as missed ❌')
    } catch { toast.error('Failed to update momentum') }
  }

  const handleLogSubmit = async (e) => {
    e.preventDefault()
    const tracking = goalTracking[activeGoalForLog._id]
    if (!tracking?.habitId) return
    try {
      const fData = new FormData()
      fData.append('status', 'attended')
      fData.append('note', logNote)
      if (logPhoto) fData.append('photo', logPhoto)
      await API.post(`/habits/${tracking.habitId}/log`, fData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchGoalLogs(activeGoalForLog._id)
      toast.success('Progress snap saved!')
      closeLogModal()
    } catch { toast.error('Failed to log snap') }
  }

  const closeLogModal = () => {
    setActiveGoalForLog(null)
    setLogNote('')
    setLogPhoto(null)
    setLogPreview(null)
  }

  const heatmapDates = (() => {
    const dates = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      dates.push(d)
    }
    return dates
  })()

  const toggleMilestone = async (goalId, milestoneIndex) => {
    try {
      const { data } = await API.patch(`/goals/${goalId}/milestone`, { index: milestoneIndex })
      setGoals(prev => prev.map(g => g._id === goalId ? data : g))
    } catch { toast.error('Failed to update milestone') }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/goals/${id}`)
      setGoals(prev => prev.filter(g => g._id !== id))
      toast.success('Goal deleted')
    } catch { toast.error('Failed to delete goal') }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 10%)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(201,100%,15%)] via-[hsl(201,100%,10%)] to-[hsl(201,100%,8%)] opacity-90" />
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-teal-900/20 blur-[150px] animate-drift-1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[120px] animate-drift-2" />
      </div>

      <main className="relative z-10 w-full max-w-7xl xl:max-w-[100rem] mx-auto px-6 sm:px-12 pt-32 pb-24">

        {/* Elite Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-24 animate-fade-rise">
          <div className="max-w-3xl w-full">
            <h1 className="text-6xl md:text-8xl text-white tracking-tighter leading-none mb-10" style={{ fontFamily: "'Instrument Serif', serif" }}>
              The <em className="not-italic text-white/50">Relentless</em> Pursuit
            </h1>

            {!showGuidance ? (
              <button onClick={() => setShowGuidance(true)} className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-teal-500/30 transition-all duration-300 backdrop-blur-xl shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal-500 group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                <span className="text-white/60 group-hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-colors">Operational Guidance</span>
              </button>
            ) : (
              <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-black/80 to-black/40 border border-teal-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(20,184,166,0.1)] relative overflow-hidden group">
                <button onClick={() => setShowGuidance(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors" title="Minimize">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                  </div>
                  <h3 className="text-white font-medium text-base tracking-wide flex items-center gap-3">
                    Operational Guidance
                  </h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-[0_0_10px_rgba(20,184,166,0.2)]">1</span>
                    <p className="text-white/50 text-sm leading-relaxed"><strong className="text-white/80 font-medium">Establish Your Arcs:</strong> Create objectives with specific target dates to track exactly how close you are to your desired goal.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-[0_0_10px_rgba(20,184,166,0.2)]">2</span>
                    <p className="text-white/50 text-sm leading-relaxed"><strong className="text-white/80 font-medium">Show Up Daily:</strong> Hit 'Completed' to lock in your daily momentum. Feeling proud? Use the camera to upload optional visual proof.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-[0_0_10px_rgba(20,184,166,0.2)]">3</span>
                    <p className="text-white/50 text-sm leading-relaxed"><strong className="text-white/80 font-medium">The Cross of Shame:</strong> Go ahead, skip a day. The system will gladly permanently scar your beautiful calendar with a massive red X. Do better.</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ title: '', category: 'Career', description: '', targetDate: '', progress: 0, milestones: [] }) }} className="group relative px-10 py-5 rounded-full overflow-hidden shrink-0 shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(20,184,166,0.5)] hover:-translate-y-1 transition-all duration-500">
            <div className="absolute inset-0 bg-teal-500 transition-all" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3 text-[hsl(201,100%,10%)] font-black uppercase tracking-widest text-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              Establish Goal
            </div>
          </button>
        </div>

        {isCreating && (
          <div className="animate-fade-rise mb-20">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
              <div className="relative p-12">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-4xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>{editingId ? 'Edit' : 'Create'} <em className="not-italic text-white/40">Goal</em></h2>
                  <button onClick={() => setIsCreating(false)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold ml-2">Goal Title</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white text-lg focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all" placeholder="What is the objective?" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold ml-2">Category</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white text-lg focus:outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer">
                        {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)] text-lg py-2">{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold ml-2">Target Date (Optional)</label>
                      <input type="date" value={formData.targetDate} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white text-lg focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold ml-2">Description (Optional)</label>
                      <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-white text-lg focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all" placeholder="Add context..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-6 pt-6">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-5 text-white/40 hover:text-white font-bold tracking-widest uppercase text-sm transition-colors">Cancel</button>
                    <button type="submit" className="liquid-glass px-14 py-5 rounded-3xl text-white font-bold uppercase tracking-widest text-sm shadow-2xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all">{editingId ? 'Update Arc' : 'Establish Arc'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Snap Modal */}
        {activeGoalForLog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
            <div className="relative max-w-lg w-full rounded-[3rem] border border-white/10 bg-gradient-to-b from-[hsl(201,100%,15%)] to-[hsl(201,100%,8%)] p-12 animate-fade-rise shadow-2xl">
              <h2 className="text-4xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Daily <em className="not-italic text-white/40">Snap</em></h2>
              <p className="text-white/40 text-sm mb-10">Capture this specific moment of your journey.</p>

              <form onSubmit={handleLogSubmit} className="space-y-8">
                <div className="w-full h-64 border-2 border-dashed border-white/20 hover:border-teal-500/50 rounded-[2rem] bg-black/20 flex flex-col items-center justify-center relative overflow-hidden group transition-colors cursor-pointer">
                  {logPreview ? (
                    <img src={logPreview} className="w-full h-full object-cover" alt="Log" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                      </div>
                      <span className="text-white/40 text-sm font-medium tracking-wide">Click to upload visual proof</span>
                    </div>
                  )}
                  <input type="file" onChange={e => {
                    const file = e.target.files[0]
                    setLogPhoto(file)
                    if (file) setLogPreview(URL.createObjectURL(file))
                  }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <textarea value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="Add a quick reflection..." className="w-full bg-black/20 border border-white/10 rounded-3xl py-5 px-8 text-white focus:outline-none focus:border-teal-500/50 resize-none transition-colors" rows={3} />
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeLogModal} className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold tracking-widest uppercase text-xs transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-5 rounded-2xl bg-teal-500 text-white font-bold tracking-widest uppercase text-xs shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:bg-teal-400 transition-all">Save Snap</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
              <span className="text-white/40 uppercase tracking-[0.4em] text-sm font-bold">Syncing Arcs...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
            {goals.map((goal, index) => {
              const tracking = goalTracking[goal._id] || { logs: [] }
              const today = new Date()
              const todayLog = tracking.logs?.find(l => new Date(l.date).toLocaleDateString() === today.toLocaleDateString())
              const hasAttended = todayLog?.status === 'attended'
              const hasMissed = todayLog?.status === 'missed'

              const createdDate = new Date(goal.createdAt || today)
              createdDate.setHours(0, 0, 0, 0)
              const todayMid = new Date(today)
              todayMid.setHours(0, 0, 0, 0)
              const daysSinceCreation = Math.max(1, Math.floor((todayMid.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
              const attendedCount = tracking.logs?.filter(l => l.status === 'attended').length || 0

              let computedScore = 0
              let progressLabel = 'Consistency Score'
              let progressSub = 'Based on daily check-ins'

              if (goal.targetDate) {
                const target = new Date(goal.targetDate)
                target.setHours(0, 0, 0, 0)
                // Prevent negative target days if target date is somehow in the past
                const totalDaysToTarget = Math.max(daysSinceCreation, Math.floor((target.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
                computedScore = parseFloat(((attendedCount / totalDaysToTarget) * 100).toFixed(2))
                progressLabel = 'Target Completion'
                progressSub = 'Pacing towards objective'
              } else {
                computedScore = parseFloat(((attendedCount / daysSinceCreation) * 100).toFixed(2))
              }

              const showComputed = !goal.milestones || goal.milestones.length === 0
              const displayProgress = showComputed ? Math.min(100, computedScore) : goal.progress
              const displayLabel = showComputed ? progressLabel : 'Arc Completion'
              const displaySub = showComputed ? progressSub : 'Add milestones to track progress'

              // Calendar Logic
              const currentYear = today.getFullYear()
              const currentMonth = today.getMonth()
              const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
              const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

              const calendarDays = []
              for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
              for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(currentYear, currentMonth, d))

              return (
                <div key={goal._id} className="group relative overflow-hidden rounded-[3.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-rise hover:bg-white/[0.04] transition-colors duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                  {/* Subtle ambient glow behind card */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

                  <div className="relative p-6 lg:p-8">
                    <div className="flex flex-col gap-6">

                      {/* Left Side: The Vision */}
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <span className="inline-flex px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-white/10 text-white/60 bg-black/20 mb-4">{goal.category}</span>
                            <h3 className="text-3xl lg:text-4xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>{goal.title}</h3>
                            {goal.targetDate && (
                              <p className="mt-4 text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <button onClick={() => handleDelete(goal._id)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
                          </div>
                        </div>

                        {/* Progress Engine */}
                        <div className="p-6 lg:p-8 rounded-[2rem] bg-black/40 border border-white/5 mb-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]">
                          <div className="flex items-end justify-between mb-6">
                            <div>
                              <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-black mb-1">
                                {displayLabel}
                              </p>
                              <p className="text-white/30 text-[9px] italic">{displaySub}</p>
                            </div>
                            <p className="text-3xl lg:text-4xl text-white font-light tracking-tighter" style={{ fontFamily: "'Instrument Serif', serif" }}>
                              {displayProgress}<span className="text-teal-500 text-xl">%</span>
                            </p>
                          </div>
                          <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border border-white/5 relative">
                            <div className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${displayProgress}%` }}>
                              <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-white/50 to-transparent blur-[2px]" />
                              {/* Scanning light effect */}
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                          </div>
                        </div>

                        {/* Milestones */}
                        {goal.milestones?.length > 0 && (
                          <div className="space-y-3 flex-1">
                            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold mb-5 pl-2">Key Milestones</p>
                            {goal.milestones.map((m, i) => (
                              <button key={i} onClick={() => toggleMilestone(goal._id, i)} className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 ${m.done ? 'bg-teal-500/10 border-teal-500/30' : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
                                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${m.done ? 'bg-teal-500 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]' : 'border-white/20'}`}>
                                  {m.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
                                </div>
                                <span className={`text-left text-base ${m.done ? 'text-white/40 line-through' : 'text-white/80'}`}>{m.text}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Side: The Momentum Engine */}
                      <div className="flex flex-col gap-6">

                        {/* Action Center - Refined Drive Version */}
                        <div className="p-6 lg:p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col justify-center relative overflow-hidden group/action">
                          {/* Subtle glow effect behind the buttons */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/5 blur-[50px] pointer-events-none" />

                          <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                            <div>
                              <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Today's Action
                              </p>
                              <h4 className="text-white text-xl lg:text-2xl font-medium tracking-tight">Show up today?</h4>
                            </div>
                            <button onClick={() => setActiveGoalForLog(goal)} className="p-3 lg:p-4 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-teal-400 hover:border-teal-500/40 hover:bg-teal-500/10 transition-all group/cam" title="Add Visual Proof">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/cam:scale-110 transition-transform"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </button>
                          </div>

                          {hasAttended ? (
                            <div className="relative z-10 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                              <span className="font-bold tracking-[0.1em] uppercase text-[10px]">Secured</span>
                            </div>
                          ) : hasMissed ? (
                            <div className="relative z-10 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                              <span className="font-bold tracking-[0.1em] uppercase text-[10px]">Missed</span>
                            </div>
                          ) : (
                            <div className="relative z-10 flex flex-col gap-3">
                              <button onClick={() => handleLog(goal._id, 'attended')} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all duration-300 group/btn shadow-[0_0_20px_rgba(20,184,166,0.05)] hover:shadow-[0_0_40px_rgba(20,184,166,0.2)]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/btn:scale-110 transition-transform"><path d="M20 6L9 17l-5-5" /></svg>
                                <span className="font-bold tracking-[0.1em] uppercase text-[10px]">Completed</span>
                              </button>
                              <button onClick={() => handleLog(goal._id, 'missed')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group/btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn:scale-110 transition-transform"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                <span className="font-bold tracking-[0.1em] uppercase text-[10px]">Missed</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Visual Momentum Calendar */}
                        <div className="p-6 lg:p-8 rounded-[2rem] bg-black/30 border border-white/5 flex-1 flex flex-col justify-center shadow-inner relative overflow-hidden">
                          {/* Ambient Glow */}
                          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />

                          <div className="flex items-center justify-between mb-6">
                            <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold">
                              {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5 relative z-10">
                            {/* Days Header */}
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                              <div key={idx} className="text-center text-[9px] uppercase tracking-[0.1em] text-white/30 font-bold pb-2">
                                {d}
                              </div>
                            ))}

                            {/* Calendar Grid */}
                            {calendarDays.map((dateObj, i) => {
                              if (!dateObj) return <div key={i} className="aspect-square rounded-2xl bg-transparent" />

                              const dateObjTime = dateObj.getTime()
                              const isToday = dateObjTime === todayMid.getTime()
                              const isPast = dateObjTime < todayMid.getTime()
                              const isAfterCreation = dateObjTime >= createdDate.getTime()

                              const logs = tracking.logs || []
                              const log = logs.find(l => new Date(l.date).toLocaleDateString() === dateObj.toLocaleDateString())

                              let isAttended = log?.status === 'attended'
                              let isMissed = log?.status === 'missed'
                              const hasPhoto = !!log?.photo

                              // Auto-miss for past days after goal creation if no log exists
                              if (!log && isPast && isAfterCreation) {
                                isMissed = true
                              }

                              let cellClass = "relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500 group/day "

                              if (isAttended) {
                                cellClass += "border-[1.5px] border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:scale-105 z-10 cursor-pointer "
                              } else if (isMissed) {
                                cellClass += "border-[1.5px] border-red-500/20 bg-red-500/5 "
                              } else {
                                cellClass += "bg-white/[0.03] hover:bg-white/[0.08] cursor-default "
                              }

                              return (
                                <div key={i} className={cellClass}>
                                  {/* Image Background */}
                                  {isAttended && hasPhoto && (
                                    <div
                                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/day:scale-110"
                                      style={{ backgroundImage: `url(${log.photo})` }}
                                    />
                                  )}

                                  {/* Darken Overlay for images */}
                                  {(isAttended && hasPhoto) && (
                                    <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover/day:bg-black/30" />
                                  )}

                                  {/* Subtle overlay for attended without photo */}
                                  {(isAttended && !hasPhoto) && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-teal-500/5" />
                                  )}

                                  {/* Missed Cross */}
                                  {isMissed && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                                      <svg width="45%" height="45%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </div>
                                  )}

                                  {/* Date Text */}
                                  <span
                                    className={`relative z-10 text-base sm:text-lg lg:text-xl font-black transition-all duration-300 ${isAttended ? 'text-white group-hover/day:scale-110' : isMissed ? 'text-white/40' : 'text-white/20 group-hover/day:text-white/40'}`}
                                    style={(isAttended || isMissed) ? {
                                      WebkitTextStroke: '0.5px rgba(0,0,0,0.8)',
                                      textShadow: '0px 2px 4px rgba(0,0,0,0.9)'
                                    } : {}}
                                  >
                                    {dateObj.getDate()}
                                  </span>

                                  {/* Hover Tooltip/Note */}
                                  {log?.note && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-[hsl(201,100%,15%)] border border-white/20 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] opacity-0 group-hover/day:opacity-100 pointer-events-none transition-all duration-300 scale-90 group-hover/day:scale-100 min-w-[120px] z-50">
                                      <p className="text-[11px] text-white/90 italic text-center line-clamp-2">"{log.note}"</p>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}