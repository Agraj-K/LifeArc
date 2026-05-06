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
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = new FormData()
      Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]))
      selectedFiles.forEach(file => dataToSend.append('images', file))

      if (editingId) {
        const { data } = await API.put(`/events/${editingId}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setEvents(prev => prev.map(ev => ev._id === editingId ? data : ev))
        toast.success('Event updated')
        setEditingId(null)
      } else {
        const { data } = await API.post('/events', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setEvents(prev => [data, ...prev])
        toast.success('Event created')
      }
      resetForm()
    } catch (err) { 
      console.error(err)
      toast.error('Failed to save event') 
    }
  }

  const resetForm = () => {
    setFormData({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' })
    setSelectedFiles([])
    setPreviews([])
    setSuggestedCategory(null)
    setIsCreating(false)
  }

  const handleEdit = (event) => {
    setFormData({ title: event.title, category: event.category, description: event.description, startDate: event.startDate?.split('T')[0] || '', targetDate: event.targetDate?.split('T')[0] || '', progress: event.progress, location: event.location })
    setSuggestedCategory(null)
    setPreviews(event.images || [])
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
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Life <em className="not-italic text-white/40">Archive</em>
            </h1>
            <p className="text-white/50 text-base mt-4">Capturing moments, milestones, and your journey through time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search archive..." className="w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <button onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' }); setPreviews([]); setSelectedFiles([]) }} className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Memory
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>{editingId ? 'Update Memory' : 'Capture New Memory'}</h2>
                  <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="w-full h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden group">
                      <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                      {previews.length > 0 ? (
                        <div className="flex gap-2 p-4 overflow-x-auto w-full">
                          {previews.map((src, i) => (
                            <img key={i} src={src} className="h-32 w-32 object-cover rounded-xl border border-white/20" alt="Preview" />
                          ))}
                        </div>
                      ) : (
                        <>
                          <svg className="text-white/20 group-hover:text-teal-400 transition-colors" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          <span className="text-white/40">Drop photos here or click to upload</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Title</label>
                    <input type="text" value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); setSuggestedCategory(suggestCategory(e.target.value)) }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 transition-all" placeholder="What's this memory about?" required />
                    {suggestedCategory && suggestedCategory !== formData.category && (
                      <button type="button" onClick={() => { setFormData({...formData, category: suggestedCategory}); setSuggestedCategory(null) }} className="mt-2 text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full animate-fade-rise">✨ AI Suggests: {suggestedCategory}</button>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none">
                      {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)]">{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/40 text-sm mb-2 block">Tell the story</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 resize-none" placeholder="Add some context..." />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" placeholder="Where did this happen?" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-white/60 hover:text-white">Cancel</button>
                    <button type="submit" className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {editingId ? 'Update Memory' : 'Save to Archive'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            <div className="text-white/40 text-sm">Developing your memories...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <div 
                key={event._id} 
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm animate-fade-rise" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Main Photo */}
                <div className="absolute inset-0 z-0">
                  {event.images && event.images.length > 0 ? (
                    <img src={event.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-blue-900/40 flex items-center justify-center">
                      <svg className="text-white/10" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border uppercase tracking-wider ${getCategoryColor(event.category)}`}>{event.category}</span>
                      {event.images && event.images.length > 1 && (
                        <span className="text-white/40 text-[10px] flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 8h18"/><path d="M8 3v18"/></svg>
                          +{event.images.length - 1}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl text-white font-medium mb-1 truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>{event.title}</h3>
                    <div className="flex items-center gap-3 text-white/40 text-[10px]">
                      <span className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => handleEdit(event)} className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8 animate-float">
              <svg className="text-white/20" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <h3 className="text-3xl text-white/60 mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {searchQuery ? 'No memories match your search' : 'Your archive is empty'}
            </h3>
            <p className="text-white/40 mb-10 max-w-sm mx-auto">
              {searchQuery ? 'Try searching for something else.' : 'Every journey begins with a single moment. Capture yours today.'}
            </p>
            <button onClick={() => setIsCreating(true)} className="liquid-glass rounded-full px-10 py-4 text-white font-medium hover:scale-105 transition-transform">
              Start Your Archive
            </button>
          </div>
        )}
      </main>
    </div>
  )
}