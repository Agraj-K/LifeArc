import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../index.css'

export default function Journal() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('velorah-journal')
    return saved ? JSON.parse(saved) : []
  })
  
  const [isWriting, setIsWriting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => {
    localStorage.setItem('velorah-journal', JSON.stringify(entries))
  }, [entries])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    if (editingId) {
      setEntries(prev => prev.map(entry => 
        entry.id === editingId 
          ? { ...entry, title, content, updatedAt: `${dateStr} at ${timeStr}` }
          : entry
      ))
      setEditingId(null)
    } else {
      const newEntry = {
        id: Date.now(),
        title: title || 'Untitled Entry',
        content,
        createdAt: `${dateStr} at ${timeStr}`,
        updatedAt: null
      }
      setEntries(prev => [newEntry, ...prev])
    }

    setTitle('')
    setContent('')
    setIsWriting(false)
  }

  const handleEdit = (entry) => {
    setTitle(entry.title)
    setContent(entry.content)
    setEditingId(entry.id)
    setIsWriting(true)
    setSelectedEntry(null)
  }

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
  }

  const handleNew = () => {
    setTitle('')
    setContent('')
    setEditingId(null)
    setIsWriting(true)
    setSelectedEntry(null)
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setEditingId(null)
    setIsWriting(false)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      
      {/* Liquid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
        <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/20 blur-[90px] animate-drift-3" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fade-rise">
          <div>
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Your <em className="not-italic text-white/40">Journal</em>
            </h1>
            <p className="text-white/50 text-base mt-4 max-w-xl leading-relaxed">
              A quiet space for your thoughts, reflections, and daily musings. Everything stays here, safe and private.
            </p>
          </div>
          
          <button 
            onClick={isWriting ? handleClose : handleNew}
            className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isWriting ? (
                <><path d="M18 6 6 18M6 6l12 12"/></>
              ) : (
                <><path d="M12 5v14M5 12h14"/></>
              )}
            </svg>
            {isWriting ? 'Close' : 'New Entry'}
          </button>
        </div>

        {/* Write / Edit Mode */}
        {isWriting && (
          <div className="animate-fade-rise mb-16">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {editingId ? 'Edit Entry' : 'New Entry'}
                  </h2>
                  <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors text-sm">
                    Cancel
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Entry Title..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    />
                  </div>

                  <div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your thoughts here..."
                      rows={12}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all duration-300 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={handleClose}
                      className="px-6 py-3 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSave}
                      className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      {editingId ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Selected Entry */}
        {selectedEntry && !isWriting && (
          <div className="animate-fade-rise mb-16">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <button 
                      onClick={() => setSelectedEntry(null)}
                      className="text-white/40 hover:text-white transition-colors text-sm mb-4 flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                      Back to all entries
                    </button>
                    <h2 className="text-3xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {selectedEntry.title}
                    </h2>
                    <p className="text-white/40 text-sm mt-2">
                      {selectedEntry.createdAt}
                      {selectedEntry.updatedAt && ` · Edited ${selectedEntry.updatedAt}`}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleEdit(selectedEntry)}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300"
                      title="Edit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                      title="Delete"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content || <span className="text-white/30 italic">No content written...</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries Grid */}
        {!selectedEntry && (
          <div>
            {entries.length === 0 ? (
              <div className="text-center py-24 animate-fade-rise">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
                  <svg className="text-white/30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <path d="M12 18v-6"/>
                    <path d="M9 15l3 3 3-3"/>
                  </svg>
                </div>
                <h3 className="text-2xl text-white/60 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  No entries yet
                </h3>
                <p className="text-white/40 mb-8">
                  Start your journey by writing your first journal entry.
                </p>
                <button 
                  onClick={handleNew}
                  className="liquid-glass rounded-full px-8 py-3 text-white hover:scale-105 transition-transform"
                >
                  Write First Entry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry, index) => (
                  <div 
                    key={entry.id}
                    onClick={() => !isWriting && setSelectedEntry(entry)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-teal-500/30 transition-colors duration-300">
                        <svg className="text-white/40 group-hover:text-teal-400 transition-colors duration-300" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <span className="text-white/30 text-xs">{entry.createdAt.split(' at ')[0]}</span>
                    </div>

                    <h3 className="text-lg text-white font-medium mb-2 group-hover:text-teal-200 transition-colors duration-300" style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {entry.title}
                    </h3>
                    
                    <p className="text-white/40 text-sm line-clamp-3 leading-relaxed">
                      {entry.content || <span className="italic">No content...</span>}
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-white/30 text-xs">
                        {entry.updatedAt ? 'Edited' : 'Created'} {entry.updatedAt || entry.createdAt.split(' at ')[1]}
                      </span>
                      <svg className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                        <path d="m12 5 7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}