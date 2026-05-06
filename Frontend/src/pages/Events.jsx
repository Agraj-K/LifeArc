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

  const suggestCategory = (text) => {
    if (!text || text.trim().length < 3) return null;
    
    const t = text.toLowerCase();
    
    const dict = {
      Health: ['run', 'gym', 'workout', 'yoga', 'jog', 'swim', 'diet', 'health', 'exercise', 'walk', 'cycle', 'meditate', 'sleep', 'nutrition', 'hospital', 'doctor', 'therapy', 'sick', 'protein', 'fitness', 'weight', 'mental', 'running', 'walking', 'swimming', 'cycling'],
      Learning: ['read', 'course', 'learn', 'study', 'book', 'tutorial', 'react', 'python', 'javascript', 'code', 'class', 'lecture', 'exam', 'university', 'college', 'degree', 'skill', 'school', 'math', 'science', 'history', 'student', 'reading', 'learning', 'studying'],
      Career: ['job', 'work', 'project', 'client', 'meeting', 'interview', 'promotion', 'career', 'salary', 'office', 'deadline', 'task', 'deliver', 'launch', 'product', 'boss', 'colleague', 'business', 'startup', 'company', 'hire', 'fired', 'working'],
      Relationships: ['family', 'friend', 'date', 'wedding', 'party', 'visit', 'relationship', 'social', 'dinner', 'birthday', 'anniversary', 'connect', 'love', 'mom', 'dad', 'sister', 'brother', 'wife', 'husband', 'partner', 'together', 'hangout', 'friends', 'dating'],
      Finance: ['invest', 'save', 'budget', 'salary', 'pay', 'expense', 'finance', 'money', 'bank', 'loan', 'tax', 'stock', 'crypto', 'bought', 'buy', 'purchase', 'cost', 'price', 'wallet', 'rich', 'poor', 'debt', 'investing', 'saving', 'buying'],
      Travel: ['trip', 'travel', 'vacation', 'flight', 'hotel', 'explore', 'journey', 'tour', 'visit', 'abroad', 'country', 'city', 'drive', 'roadtrip', 'beach', 'mountain', 'passport', 'fly', 'plane', 'train', 'ticket', 'airport', 'trek', 'trekking', 'hike', 'hiking', 'camp', 'camping', 'nature', 'traveling', 'exploring']
    };

    let scores = { Health: 0, Learning: 0, Career: 0, Relationships: 0, Finance: 0, Travel: 0 };
    let maxScore = 0;
    let bestCat = null;
    
    Object.keys(dict).forEach(cat => {
      dict[cat].forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = t.match(regex);
        if (matches) {
          scores[cat] += matches.length;
        }
      });
      if (scores[cat] > maxScore) {
        maxScore = scores[cat];
        bestCat = cat;
      }
    });

    return maxScore > 0 ? bestCat : null;
  }

  // Real-time AI categorization
  useEffect(() => {
    if (isCreating) {
      const aiEnabled = localStorage.getItem('aiEnabled') !== 'false';
      if (aiEnabled) {
        const suggested = suggestCategory(`${formData.title} ${formData.description}`);
        setSuggestedCategory(suggested);
      } else {
        setSuggestedCategory(null);
      }
    }
  }, [formData.title, formData.description, isCreating]);

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events')
      setEvents(data)
    } catch { toast.error('Failed to load archive') }
    finally { setLoading(false) }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = [...selectedFiles, ...files]
    setSelectedFiles(newFiles)
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    const src = previews[index]
    
    // If it's a new upload (blob), remove from selectedFiles
    if (src.startsWith('blob:')) {
      const blobIndex = previews.filter((p, i) => i < index && p.startsWith('blob:')).length
      setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex))
    }
    
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = new FormData()
      Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]))
      selectedFiles.forEach(file => dataToSend.append('images', file))

      if (editingId) {
        // Separate existing URLs from new blobs in previews
        const existingImages = previews.filter(p => !p.startsWith('blob:'))
        dataToSend.append('existingImages', JSON.stringify(existingImages))

        const { data } = await API.put(`/events/${editingId}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setEvents(prev => prev.map(ev => ev._id === editingId ? data : ev))
        toast.success('Memory updated')
        setEditingId(null)
      } else {
        const { data } = await API.post('/events', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setEvents(prev => [data, ...prev])
        toast.success('Memory created')
      }
      resetForm()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save memory')
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
      toast.success('Memory deleted')
    } catch { toast.error('Failed to delete memory') }
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-rise">
          <div className="flex-1">
            <h1 className="text-6xl md:text-7xl text-white tracking-tighter leading-none" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Velora <em className="not-italic text-white/20">Archive</em>
            </h1>
            <p className="text-white/40 text-lg mt-4 font-light max-w-xl leading-relaxed">Capturing moments, milestones, and your journey through time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search archive..." className="w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
            <button onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ title: '', category: 'Career', description: '', startDate: '', targetDate: '', progress: 0, location: '' }); setPreviews([]); setSelectedFiles([]) }} className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Add Memory
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-2xl animate-fade-in" onClick={(e) => e.target === e.currentTarget && setIsCreating(false)}>
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/10 bg-[hsl(201,100%,8%)] shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-fade-rise">
              <div className="relative p-8 md:p-14">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-4xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>{editingId ? 'Update' : 'Capture'} <em className="text-white/30 not-italic">Memory</em></h2>
                  <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/30 ml-1 block">Gallery Archive</label>
                    
                    {/* Previews List - Separate from input */}
                    {previews.length > 0 && (
                      <div className="flex gap-4 p-2 overflow-x-auto w-full scrollbar-hide pb-2">
                        {previews.map((src, i) => (
                          <div key={i} className="relative flex-shrink-0 group">
                            <img src={src} className="h-32 w-32 object-cover rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-[1.05] group-hover:border-teal-500/30" alt="Preview" />
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-[110]"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Box - No longer covers previews */}
                    <div className="w-full h-32 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 hover:border-teal-500/30 transition-all cursor-pointer relative overflow-hidden group">
                      <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                          <svg className="text-teal-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        </div>
                        <span className="text-white/40 text-sm font-medium tracking-wide">Add photos to your memory</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 transition-all" placeholder="What's this memory about?" required />
                    {suggestedCategory && suggestedCategory !== formData.category && (
                      <button type="button" onClick={() => { setFormData({ ...formData, category: suggestedCategory }); setSuggestedCategory(null) }} className="mt-2 text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full animate-fade-rise">✨ AI Suggests: {suggestedCategory}</button>
                    )}
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none">
                      {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)]">{cat}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/40 text-sm mb-2 block">Tell the story</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 resize-none" placeholder="Add some context..." />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white" placeholder="Where did this happen?" />
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
                      <svg className="text-white/10" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
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
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 8h18" /><path d="M8 3v18" /></svg>
                          +{event.images.length - 1}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl text-white font-medium mb-1 truncate" style={{ fontFamily: "'Instrument Serif', serif" }}>{event.title}</h3>
                    <div className="flex items-center gap-3 text-white/40 text-[10px]">
                      <span className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'No date'}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => handleEdit(event)} className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all text-xs flex items-center gap-1.5 shadow-lg">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-500/40 transition-all text-xs flex items-center gap-1.5 shadow-lg">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      Delete
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
              <svg className="text-white/20" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
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