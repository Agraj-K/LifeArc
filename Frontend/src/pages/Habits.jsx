import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newHabit, setNewHabit] = useState({ title: '', category: 'Health', color: 'teal' })

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)
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

  useEffect(() => { fetchHabits() }, [])

  const fetchHabits = async () => {
    try {
      const { data } = await API.get('/habits')
      setHabits(data)
    } catch { toast.error('Failed to load habits') }
    finally { setLoading(false) }
  }

  const toggleDay = async (habitId, day) => {
    try {
      const { data } = await API.patch(`/habits/${habitId}/toggle`, { day })
      setHabits(prev => prev.map(h => h._id === habitId ? data : h))
    } catch { toast.error('Failed to update habit') }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newHabit.title.trim()) return
    try {
      const { data } = await API.post('/habits', newHabit)
      setHabits(prev => [data, ...prev])
      setNewHabit({ title: '', category: 'Health', color: 'teal' })
      setIsCreating(false)
      toast.success('Habit created')
    } catch { toast.error('Failed to create habit') }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/habits/${id}`)
      setHabits(prev => prev.filter(h => h._id !== id))
      toast.success('Habit deleted')
    } catch { toast.error('Failed to delete habit') }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fade-rise">
          <div>
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Habit <em className="not-italic text-white/40">Tracker</em></h1>
            <p className="text-white/50 text-base mt-4">Build consistency, one day at a time.</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            New Habit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Habits', value: habits.length },
            { label: 'Active Streaks', value: habits.filter(h => h.streak > 0).length },
            { label: 'Best Streak', value: habits.length > 0 ? `${Math.max(...habits.map(h => h.streak))} days` : '0 days' },
            { label: 'Completed Today', value: habits.filter(h => h.completed.includes(new Date().getDate())).length },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-3xl text-white font-semibold mb-1">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Create New Habit</h2>
                  <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-white/40 text-sm mb-2 block">Habit Name</label>
                    <input type="text" value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" placeholder="e.g., Read 30 minutes..." required />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Category</label>
                    <select value={newHabit.category} onChange={e => setNewHabit({...newHabit, category: e.target.value})} className="w-40 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300">
                      {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)]">{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Color</label>
                    <div className="flex gap-2">
                      {colorOptions.map(color => {
                        const pal = getPalette(color)
                        const isSelected = newHabit.color === color
                        return (
                          <button key={color} type="button" onClick={() => setNewHabit({...newHabit, color})} className="w-8 h-8 rounded-full border-2 transition-all duration-300"
                            style={{ backgroundColor: pal.hex, borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)', boxShadow: isSelected ? `0 0 0 3px ${pal.hex}55` : 'none', transform: isSelected ? 'scale(1.2)' : 'scale(1)' }} title={color} />
                        )
                      })}
                    </div>
                  </div>
                  <button type="submit" className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">Create</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-24 text-white/40">Loading habits...</div>
        ) : (
          <div className="space-y-6">
            {habits.map((habit, index) => (
              <div key={habit._id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 animate-fade-rise" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: getPalette(habit.color).hex + '1a' }} />
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getPalette(habit.color).activeBg, border: `1px solid ${getPalette(habit.color).border}` }}>
                        <svg style={{ color: getPalette(habit.color).text }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-xl text-white group-hover:text-teal-200 transition-colors" style={{ fontFamily: "'Instrument Serif', serif" }}>{habit.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-white/40 text-sm">{habit.category}</span>
                          <span className="flex items-center gap-1 text-sm" style={{ color: getPalette(habit.color).text }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                            {habit.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(habit._id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white/40 text-xs uppercase tracking-wider">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs">{habit.completed.length} / {monthDays.length} days</span>
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(habit.completed.length / monthDays.length) * 100}%`, backgroundColor: getPalette(habit.color).hex }} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {weekDays.map(day => <div key={day} className="text-center text-white/30 text-xs py-2">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {monthDays.map(day => {
                        const isCompleted = habit.completed.includes(day)
                        const pal = getPalette(habit.color)
                        return (
                          <button key={day} onClick={() => toggleDay(habit._id, day)} className="aspect-square rounded-xl border transition-all duration-300 flex items-center justify-center text-sm"
                            style={isCompleted ? { backgroundColor: pal.activeBg, borderColor: pal.border, color: pal.text } : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {habits.length === 0 && (
              <div className="text-center py-24">
                <h3 className="text-2xl text-white/60 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>No habits tracked</h3>
                <p className="text-white/40 mb-8">Start building consistency by tracking your first habit.</p>
                <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-8 py-3 text-white hover:scale-105 transition-transform">Track First Habit</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}