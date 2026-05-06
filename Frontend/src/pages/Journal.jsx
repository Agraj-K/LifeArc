import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import API from '../api'
import '../index.css'

export default function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [publicEntries, setPublicEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('my') // 'my' or 'community'
  const [isWriting, setIsWriting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [mood, setMood] = useState('Neutral')
  
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState('')

  const moods = ['Happy', 'Grateful', 'Neutral', 'Stressed', 'Reflective', 'Productive']

  useEffect(() => { 
    // Guests are locked to 'community'
    if (!user) {
      setActiveTab('community')
      fetchPublicEntries()
    } else {
      if (activeTab === 'my') fetchEntries()
      else fetchPublicEntries()
    }
  }, [activeTab, user])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/journal')
      setEntries(data)
    } catch { toast.error('Failed to load entries') }
    finally { setLoading(false) }
  }

  const fetchPublicEntries = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/journal/public')
      setPublicEntries(data)
    } catch { toast.error('Failed to load community feed') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return
    try {
      const payload = { title, content, isPublic, mood }
      if (editingId) {
        const { data } = await API.put(`/journal/${editingId}`, payload)
        setEntries(prev => prev.map(e => e._id === editingId ? data : e))
        toast.success('Entry updated')
        setEditingId(null)
      } else {
        const { data } = await API.post('/journal', payload)
        setEntries(prev => [data, ...prev])
        toast.success('Entry saved')
      }
      resetForm()
    } catch { toast.error('Failed to save entry') }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setIsPublic(false)
    setMood('Neutral')
    setEditingId(null)
    setIsWriting(false)
  }

  const handleEdit = (entry) => {
    setTitle(entry.title)
    setContent(entry.content)
    setIsPublic(entry.isPublic || false)
    setMood(entry.mood || 'Neutral')
    setEditingId(entry._id)
    setIsWriting(true)
    setSelectedEntry(null)
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/journal/${id}`)
      setEntries(prev => prev.filter(e => e._id !== id))
      if (selectedEntry?._id === id) setSelectedEntry(null)
      toast.success('Entry deleted')
    } catch { toast.error('Failed to delete entry') }
  }

  const handleNew = () => { resetForm(); setIsWriting(true); setSelectedEntry(null) }

  const generateWeeklySummary = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekEntries = entries.filter(e => new Date(e.createdAt) >= oneWeekAgo)

    if (weekEntries.length === 0) {
      setWeeklySummary('You have no journal entries from the past 7 days. Start writing to see your weekly summary!')
      setShowSummary(true)
      return
    }

    const summary = `This week, you wrote ${weekEntries.length} journal ${weekEntries.length === 1 ? 'entry' : 'entries'}. Your consistency in reflection is building a stronger self-narrative. Keep capturing your journey!`
    setWeeklySummary(summary)
    setShowSummary(true)
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const fmtRelative = (d) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(d)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-12 animate-fade-rise">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {activeTab === 'my' ? 'Personal' : 'Community'} <em className="not-italic text-white/40">Feed</em>
            </h1>
            
            <div className="flex items-center gap-3">
              {user && (
                <button onClick={isWriting ? resetForm : handleNew} className="liquid-glass rounded-full px-5 py-2.5 text-sm text-white flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {isWriting ? <path d="M18 6 6 18M6 6l12 12"/> : <path d="M12 5v14M5 12h14"/>}
                  </svg>
                  {isWriting ? 'Close' : 'Post Reflection'}
                </button>
              )}
            </div>
          </div>

          {/* Tab Switcher (Only for Users) */}
          {user && (
            <div className="flex items-center gap-8 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('my')} 
                className={`text-sm pb-4 transition-all relative ${activeTab === 'my' ? 'text-white font-medium' : 'text-white/40 hover:text-white'}`}
              >
                For You
                {activeTab === 'my' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('community')} 
                className={`text-sm pb-4 transition-all relative ${activeTab === 'community' ? 'text-white font-medium' : 'text-white/40 hover:text-white'}`}
              >
                Community
                {activeTab === 'community' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />}
              </button>
            </div>
          )}

          {/* Guest CTA */}
          {!user && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-6 backdrop-blur-md">
              <div>
                <h3 className="text-white font-medium">New to Velora?</h3>
                <p className="text-white/40 text-sm mt-1">Join the community to start sharing your own reflections.</p>
              </div>
              <Link to="/register" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white whitespace-nowrap" style={{ textDecoration: 'none' }}>Join Now</Link>
            </div>
          )}
        </div>

        {/* Weekly Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <div className="relative max-w-lg w-full rounded-3xl border border-white/10 bg-[hsl(201,100%,8%)] p-8 animate-fade-rise">
              <h2 className="text-xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>Weekly Journal Summary</h2>
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
                <p className="text-white/80 leading-relaxed text-sm">{weeklySummary}</p>
              </div>
              <button onClick={() => setShowSummary(false)} className="mt-6 w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all">Close</button>
            </div>
          </div>
        )}

        {/* Writing View */}
        {isWriting && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-2xl">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-6">
                  {moods.map(m => (
                    <button key={m} onClick={() => setMood(m)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${mood === m ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' : 'border-white/5 text-white/30 hover:border-white/10'}`}>{m}</button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Reflection Title" 
                  className="w-full bg-transparent border-none text-white text-2xl mb-4 focus:outline-none placeholder:text-white/20" 
                  style={{ fontFamily: "'Instrument Serif', serif" }} 
                />
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="What's on your mind?" 
                  rows={6} 
                  className="w-full bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-white/20 resize-none leading-relaxed" 
                />
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="hidden" />
                    <div className={`w-10 h-5 rounded-full transition-all relative ${isPublic ? 'bg-teal-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isPublic ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-xs text-white/40 group-hover:text-white/60">Public Post</span>
                  </label>
                  <div className="flex gap-4">
                    <button onClick={resetForm} className="text-sm text-white/40 hover:text-white">Discard</button>
                    <button onClick={handleSave} className="liquid-glass px-6 py-2 rounded-full text-sm text-white font-medium">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Entry View */}
        {selectedEntry && !isWriting && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-2xl p-8">
              <button onClick={() => setSelectedEntry(null)} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                Back to feed
              </button>
              <h2 className="text-4xl text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>{selectedEntry.title}</h2>
              <div className="flex items-center gap-3 mb-8">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-400 uppercase tracking-widest">{selectedEntry.mood}</span>
                <span className="text-white/30 text-xs">{fmt(selectedEntry.createdAt)}</span>
              </div>
              <p className="text-white/80 text-xl leading-relaxed whitespace-pre-wrap font-light">{selectedEntry.content}</p>
              {user && selectedEntry.userId?._id === user.id && (
                <div className="flex gap-4 mt-12 pt-8 border-t border-white/5">
                  <button onClick={() => handleEdit(selectedEntry)} className="text-xs text-white/40 hover:text-white">Edit Reflection</button>
                  <button onClick={() => handleDelete(selectedEntry._id)} className="text-xs text-red-400/60 hover:text-red-400">Delete Permanently</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feed View */}
        {!selectedEntry && (
          <div className="flex flex-col gap-px bg-white/5 border-x border-white/5">
            {loading ? (
              <div className="text-center py-24">
                <div className="w-6 h-6 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                <span className="text-white/20 text-sm">Synchronizing feed...</span>
              </div>
            ) : (activeTab === 'my' ? entries : publicEntries).length === 0 ? (
              <div className="text-center py-32 bg-[hsl(201,100%,10%)]">
                <h3 className="text-2xl text-white/40" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {activeTab === 'my' ? 'Silence in your space' : 'The community is quiet'}
                </h3>
                <p className="text-white/20 text-sm mt-2">Be the one to break it.</p>
              </div>
            ) : (
              (activeTab === 'my' ? entries : publicEntries).map((entry, index) => (
                <div 
                  key={entry._id} 
                  onClick={() => !isWriting && setSelectedEntry(entry)} 
                  className="group bg-[hsl(201,100%,11%)] hover:bg-[hsl(201,100%,13%)] border-b border-white/5 p-6 cursor-pointer transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Twitter-style Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                        {entry.userId?.name?.charAt(0) || 'V'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="font-bold text-white truncate">{entry.userId?.name || 'Explorer'}</span>
                        <span className="text-white/40 text-sm truncate">@{entry.userId?.name?.toLowerCase().replace(/\s/g, '') || 'velorah_user'}</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-sm">{fmtRelative(entry.createdAt)}</span>
                        {entry.mood && (
                           <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/30 uppercase tracking-tighter">{entry.mood}</span>
                        )}
                      </div>

                      <h3 className="text-lg text-white font-medium mb-1 line-clamp-1" style={{ fontFamily: "'Instrument Serif', serif" }}>{entry.title}</h3>
                      <p className="text-white/60 leading-relaxed text-[15px] line-clamp-4 font-light">{entry.content}</p>

                      <div className="flex items-center gap-10 mt-4 text-white/20">
                        <div className="flex items-center gap-2 group/icon">
                          <div className="p-2 rounded-full group-hover/icon:bg-teal-500/10 group-hover/icon:text-teal-400 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <span className="text-xs group-hover/icon:text-teal-400">2</span>
                        </div>
                        <div className="flex items-center gap-2 group/icon">
                          <div className="p-2 rounded-full group-hover/icon:bg-red-500/10 group-hover/icon:text-red-400 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          </div>
                          <span className="text-xs group-hover/icon:text-red-400">12</span>
                        </div>
                        <div className="flex items-center gap-2 group/icon ml-auto">
                           <div className="p-2 rounded-full group-hover/icon:bg-white/10 transition-all">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}