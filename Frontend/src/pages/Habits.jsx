import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [activeHabitForLog, setActiveHabitForLog] = useState(null)
  
  // New Habit State
  const [newHabit, setNewHabit] = useState({ title: '', category: 'Health', color: 'teal', goalId: '' })
  
  // Log State
  const [logNote, setLogNote] = useState('')
  const [logPhoto, setLogPhoto] = useState(null)
  const [logPreview, setLogPreview] = useState(null)

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const categories = ['Health', 'Learning', 'Mindfulness', 'Career', 'Finance', 'Other']
  const colorOptions = ['teal', 'blue', 'emerald', 'purple', 'cyan', 'yellow', 'pink']

  const colorPalette = {
    teal:    { hex: '#14b8a6', bg: 'rgba(20,184,166,0.15)',   border: 'rgba(20,184,166,0.4)',   text: '#5eead4', activeBg: 'rgba(20,184,166,0.25)' },
    blue:    { hex: '#3b82f6', bg: 'rgba(59,130,246,0.15)',   border: 'rgba(59,130,246,0.4)',   text: '#93c5fd', activeBg: 'rgba(59,130,246,0.25)' },
    emerald: { hex: '#10b981', bg: 'rgba(16,185,129,0.15)',   border: 'rgba(16,185,129,0.4)',   text: '#6ee7b7', activeBg: 'rgba(16,185,129,0.25)' },
    purple:  { hex: '#a855f7', bg: 'rgba(168,85,247,0.15)',   border: 'rgba(168,85,247,0.4)',   text: '#d8b4fe', activeBg: 'rgba(168,85,247,0.25)' },
    cyan:    { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)',    border: 'rgba(6,182,212,0.4)',    text: '#67e8f9', activeBg: 'rgba(6,182,212,0.25)' },
    yellow:  { hex: '#eab308', bg: 'rgba(234,179,8,0.15)',    border: 'rgba(234,179,8,0.4)',    text: '#fde047', activeBg: 'rgba(234,179,8,0.25)' },
    pink:    { hex: '#ec4899', bg: 'rgba(236,72,153,0.15)',   border: 'rgba(236,72,153,0.4)',   text: '#f9a8d4', activeBg: 'rgba(236,72,153,0.25)' },
  }

  const getPalette = (color) => colorPalette[color] || colorPalette.teal

  useEffect(() => { 
    fetchHabits()
    fetchGoals()
  }, [])

  const fetchHabits = async () => {
    try {
      const { data } = await API.get('/habits')
      setHabits(data)
    } catch { toast.error('Failed to load habits') }
    finally { setLoading(false) }
  }

  const fetchGoals = async () => {
    try {
      const { data } = await API.get('/goals')
      setGoals(data)
    } catch { console.error('Failed to load goals') }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newHabit.title.trim()) return
    try {
      const { data } = await API.post('/habits', newHabit)
      setHabits(prev => [data, ...prev])
      setNewHabit({ title: '', category: 'Health', color: 'teal', goalId: '' })
      setIsCreating(false)
      toast.success('Habit created')
    } catch { toast.error('Failed to create habit') }
  }

  const handleLogSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('note', logNote)
      if (logPhoto) formData.append('photo', logPhoto)
      
      const { data } = await API.post(`/habits/${activeHabitForLog._id}/log`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Update habit in state (to update streak and heatmap)
      fetchHabits()
      toast.success('Habit logged!')
      closeLogModal()
    } catch { toast.error('Failed to log habit') }
  }

  const closeLogModal = () => {
    setActiveHabitForLog(null)
    setLogNote('')
    setLogPhoto(null)
    setLogPreview(null)
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/habits/${id}`)
      setHabits(prev => prev.filter(h => h._id !== id))
      toast.success('Habit deleted')
    } catch { toast.error('Failed to delete habit') }
  }

  // Generate 52 weeks of dates for heatmap
  const getHeatmapDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      d.setHours(0,0,0,0)
      dates.push(d)
    }
    return dates
  }

  const heatmapDates = getHeatmapDates()

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fade-rise">
          <div>
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              The <em className="not-italic text-white/40">Consistency</em> Heatmap
            </h1>
            <p className="text-white/50 text-base mt-4">Every small win contributes to your greater goals.</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-6 py-3 text-sm text-white flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            New Habit
          </button>
        </div>

        {isCreating && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl">
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Design a New Habit</h2>
                  <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="md:col-span-1">
                    <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block font-medium">Habit Name</label>
                    <input type="text" value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50" placeholder="e.g., Morning Workout" required />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block font-medium">Linked Goal</label>
                    <select value={newHabit.goalId} onChange={e => setNewHabit({...newHabit, goalId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none">
                      <option value="" className="bg-[hsl(201,100%,13%)]">No linked goal</option>
                      {goals.map(g => <option key={g._id} value={g._id} className="bg-[hsl(201,100%,13%)]">{g.title}</option>)}
                    </select>
                  </div>
                  <div>
                     <label className="text-white/40 text-xs uppercase tracking-widest mb-2 block font-medium">Color Identity</label>
                     <div className="flex gap-2">
                      {colorOptions.map(color => (
                        <button key={color} type="button" onClick={() => setNewHabit({...newHabit, color})} className={`w-8 h-8 rounded-full transition-all ${newHabit.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-60'}`} style={{ backgroundColor: getPalette(color).hex }} />
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                     <button type="submit" className="liquid-glass px-10 py-3 rounded-xl text-white font-medium hover:scale-[1.02] transition-all">Establish Habit</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Log Modal */}
        {activeHabitForLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <div className="relative max-w-lg w-full rounded-3xl border border-white/10 bg-[hsl(201,100%,8%)] p-8 animate-fade-rise">
              <h2 className="text-xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Check-in: {activeHabitForLog.title}</h2>
              <p className="text-white/30 text-xs mb-6">Capture your progress for today</p>
              <form onSubmit={handleLogSubmit} className="space-y-6">
                <div className="w-full h-40 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  {logPreview ? (
                    <img src={logPreview} className="w-full h-full object-cover" alt="Log" />
                  ) : (
                    <span className="text-white/20 text-sm group-hover:text-teal-400 transition-colors text-center px-4">📸 Click to add progress snap (optional)</span>
                  )}
                  <input type="file" onChange={e => {
                    const file = e.target.files[0]
                    setLogPhoto(file)
                    if (file) setLogPreview(URL.createObjectURL(file))
                  }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <textarea value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="How did it go? (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white resize-none" rows={3} />
                <div className="flex gap-3">
                   <button type="button" onClick={closeLogModal} className="flex-1 py-3 text-white/40 hover:text-white">Cancel</button>
                   <button type="submit" className="flex-1 liquid-glass py-3 rounded-xl text-white font-medium">Log Progress</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-white/40">Syncing with your journey...</div>
        ) : (
          <div className="space-y-12">
            {habits.map((habit, index) => {
              const palette = getPalette(habit.color)
              return (
                <div key={habit._id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl animate-fade-rise" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: palette.activeBg, border: `1px solid ${palette.border}` }}>
                          <svg style={{ color: palette.text }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <div>
                          <h3 className="text-2xl text-white font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>{habit.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="text-white/30 text-xs font-medium uppercase tracking-wider">{habit.category}</span>
                            {habit.goalId && <span className="text-teal-400/60 text-xs border border-teal-500/20 px-2 py-0.5 rounded-full">Linked to: {habit.goalId.title}</span>}
                            <span className="flex items-center gap-1 text-xs" style={{ color: palette.text }}>🔥 {habit.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setActiveHabitForLog(habit)} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">Log Progress</button>
                        <button onClick={() => handleDelete(habit._id)} className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 transition-all">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Custom 52-week Heatmap */}
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                      <div className="flex gap-1 min-w-[700px]">
                         {/* Week labels */}
                         <div className="flex flex-col justify-between py-1 pr-2">
                           {weekDays.map(d => <span key={d} className="text-[9px] text-white/20 h-3 leading-none">{d}</span>)}
                         </div>
                         {/* Grid of days */}
                         <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
                           {heatmapDates.map((date, i) => {
                             const dayOfMonth = date.getDate()
                             // Simple matching for now: checks if habit.completed has this day number (simplified version)
                             const isCompleted = habit.completed.includes(dayOfMonth) && (date.getMonth() === new Date().getMonth())
                             return (
                               <div key={i} className="w-3 h-3 rounded-sm transition-all hover:scale-125 cursor-default relative group/day" 
                                 style={{ backgroundColor: isCompleted ? palette.hex : 'rgba(255,255,255,0.05)' }}>
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black rounded text-[8px] text-white opacity-0 group-hover/day:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                   {date.toLocaleDateString()}
                                 </div>
                               </div>
                             )
                           })}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {habits.length === 0 && (
              <div className="text-center py-24">
                <h3 className="text-2xl text-white/60 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>No habits tracked</h3>
                <p className="text-white/40 mb-8">Establish a new habit to start your consistency streak.</p>
                <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-10 py-3 text-white transition-transform hover:scale-105">Initialize Habit</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}