import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestedCategory, setSuggestedCategory] = useState(null)
  const categories = ['Career', 'Health', 'Learning', 'Relationships', 'Finance', 'Travel', 'Other']

  const suggestCategory = (title) => {
    const t = title.toLowerCase()
    if (/run|gym|workout|yoga|jog|swim|diet|health|exercise|walk|cycle|meditat|sleep|nutrition/.test(t)) return 'Health'
    if (/read|course|learn|study|book|tutorial|react|python|javascript|code|class|lecture|exam|university|college|degree|skill/.test(t)) return 'Learning'
    if (/job|work|project|client|meeting|interview|promotion|career|salary|office|deadline|task|deliver|launch|product/.test(t)) return 'Career'
    if (/family|friend|date|wedding|party|visit|relationship|social|dinner|birthday|anniversary|connect/.test(t)) return 'Relationships'
    if (/invest|save|budget|salary|pay|expense|finance|money|bank|loan|tax|stock|crypto/.test(t)) return 'Finance'
    if (/trip|travel|vacation|flight|hotel|explore|journey|tour|visit|abroad|country|city/.test(t)) return 'Travel'
    return null
  }

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events')
      setEvents(data)
    } catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const { data } = await API.put(`/events/${editingId}`, formData)
        setEvents(prev => prev.map(ev => ev._id === editingId ? data : ev))
        toast.success('Event updated')
        setEditingId(null)
      } else {
        const { data } = await API.post('/events', formData)
        setEvents(prev => [data, ...prev])
        toast.success('Event created')
      }
      setFormData({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' })
      setSuggestedCategory(null)
      setIsCreating(false)
    } catch { toast.error('Failed to save event') }
  }

  const handleEdit = (event) => {
    setFormData({ title: event.title, category: event.category, description: event.description, startDate: event.startDate?.split('T')[0] || '', targetDate: event.targetDate?.split('T')[0] || '', progress: event.progress, location: event.location })
    setSuggestedCategory(null)
    setEditingId(event._id); setIsCreating(true)
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`)
      setEvents(prev => prev.filter(ev => ev._id !== id))
      toast.success('Event deleted')
    } catch { toast.error('Failed to delete event') }
  }

  const filteredEvents = events.filter(ev =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryColor = (cat) => {
    const colors = { Career: 'text-blue-400 border-blue-500/30', Health: 'text-emerald-400 border-emerald-500/30', Learning: 'text-purple-400 border-purple-500/30', Relationships: 'text-pink-400 border-pink-500/30', Finance: 'text-yellow-400 border-yellow-500/30', Travel: 'text-cyan-400 border-cyan-500/30', Other: 'text-white/40 border-white/10' }
    return colors[cat] || colors.Other
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
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Life <em className="not-italic text-white/40">Events</em></h1>
            <p className="text-white/50 text-base mt-4">Track milestones, achievements, and meaningful moments.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events..." className="w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <button onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' }) }} className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New Event
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
                  <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        const val = e.target.value
                        setFormData({...formData, title: val})
                        const suggestion = suggestCategory(val)
                        setSuggestedCategory(suggestion && suggestion !== formData.category ? suggestion : null)
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300"
                      placeholder="Event title..."
                      required
                    />
                    {suggestedCategory && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-white/30 text-xs">✨ AI Suggests:</span>
                        <button
                          type="button"
                          onClick={() => { setFormData(f => ({...f, category: suggestedCategory})); setSuggestedCategory(null) }}
                          className="px-3 py-1 rounded-full text-xs border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/60 transition-all duration-300 animate-fade-rise"
                        >
                          {suggestedCategory}
                        </button>
                        <span className="text-white/20 text-xs">click to apply</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300">
                      {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)]">{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/40 text-sm mb-2 block">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300 resize-none" placeholder="Describe this event..." />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Target Date</label>
                    <input type="date" value={formData.targetDate} onChange={e => setFormData({...formData, targetDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" placeholder="Location..." />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Progress: {formData.progress}%</label>
                    <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})} className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-500" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300">Cancel</button>
                    <button type="submit" className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">{editingId ? 'Update Event' : 'Create Event'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 text-white/40">Loading events...</div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <div key={event._id} className="relative flex gap-6 animate-fade-rise" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500/60 border-2 border-[hsl(201,100%,13%)] z-10" />
                  </div>
                  <div className="flex-1 group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getCategoryColor(event.category)}`}>{event.category}</span>
                        <span className="text-white/30 text-sm">{event.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(event)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(event._id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl text-white font-medium mb-2 group-hover:text-teal-200 transition-colors" style={{ fontFamily: "'Instrument Serif', serif" }}>{event.title}</h3>
                    <p className="text-white/40 text-sm mb-4">{event.description}</p>
                    <div className="flex items-center gap-6">
                      {event.location && (
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {event.location}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white/40 text-xs">Progress</span>
                          <span className="text-white/60 text-xs">{event.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${event.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-24">
                  <h3 className="text-2xl text-white/60 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>No events found</h3>
                  <p className="text-white/40 mb-8">{searchQuery ? 'Try a different search term.' : 'Start tracking your life journey.'}</p>
                  {!searchQuery && <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-8 py-3 text-white hover:scale-105 transition-transform">Create First Event</button>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}