import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../index.css'

export default function Goals() {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Get Promoted to Lead', category: 'Career', description: 'Become team lead by end of year', targetDate: '2026-12-31', progress: 35, milestones: [{ text: 'Complete leadership course', done: true }, { text: 'Mentor 2 juniors', done: false }, { text: 'Lead a project', done: false }] },
    { id: 2, title: 'Run Full Marathon', category: 'Health', description: 'Complete 42km marathon', targetDate: '2026-11-20', progress: 60, milestones: [{ text: 'Run 5k daily', done: true }, { text: 'Complete half marathon', done: true }, { text: 'Run 30k practice', done: false }] },
    { id: 3, title: 'Launch LifeArc App', category: 'Learning', description: 'Ship v1.0 of personal growth app', targetDate: '2026-06-30', progress: 80, milestones: [{ text: 'Design system', done: true }, { text: 'Frontend complete', done: true }, { text: 'Backend API', done: false }] },
    { id: 4, title: 'Save $10,000', category: 'Finance', description: 'Emergency fund goal', targetDate: '2026-12-31', progress: 45, milestones: [{ text: 'Save $2k/month', done: true }, { text: 'Reach $5k', done: false }, { text: 'Reach $10k', done: false }] },
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Career',
    description: '',
    targetDate: '',
    progress: 0,
    milestones: []
  })
  const [newMilestone, setNewMilestone] = useState('')

  const categories = ['Career', 'Health', 'Learning', 'Relationships', 'Finance', 'Travel', 'Other']

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { text: newMilestone, done: false }]
    })
    setNewMilestone('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setGoals(prev => prev.map(g => g.id === editingId ? { ...formData, id: editingId } : g))
      setEditingId(null)
    } else {
      setGoals(prev => [{ ...formData, id: Date.now() }, ...prev])
    }
    setFormData({ title: '', category: 'Career', description: '', targetDate: '', progress: 0, milestones: [] })
    setIsCreating(false)
  }

  const handleEdit = (goal) => {
    setFormData(goal)
    setEditingId(goal.id)
    setIsCreating(true)
  }

  const handleDelete = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const toggleMilestone = (goalId, milestoneIndex) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      const newMilestones = g.milestones.map((m, i) => i === milestoneIndex ? { ...m, done: !m.done } : m)
      // Auto-calculate progress based on completed milestones
      const completed = newMilestones.filter(m => m.done).length
      const progress = newMilestones.length > 0 ? Math.round((completed / newMilestones.length) * 100) : g.progress
      return { ...g, milestones: newMilestones, progress }
    }))
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fade-rise">
          <div>
            <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Future <em className="not-italic text-white/40">Goals</em>
            </h1>
            <p className="text-white/50 text-base mt-4">
              Set milestones, track progress, achieve what matters.
            </p>
          </div>
          
          <button 
            onClick={() => { setIsCreating(true); setEditingId(null); setFormData({ title: '', category: 'Career', description: '', targetDate: '', progress: 0, milestones: [] }) }}
            className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Goal
          </button>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="animate-fade-rise mb-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {editingId ? 'Edit Goal' : 'Create New Goal'}
                  </h2>
                  <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="Goal title..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300"
                      >
                        {categories.map(cat => <option key={cat} value={cat} className="bg-[hsl(201,100%,13%)]">{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                      placeholder="Describe your goal..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Target Date</label>
                      <input
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Initial Progress: {formData.progress}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Milestones</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="Add a milestone..."
                      />
                      <button
                        type="button"
                        onClick={handleAddMilestone}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center">
                            {m.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M20 6 9 17l-5-5"/></svg>}
                          </div>
                          <span className="text-white/60 text-sm flex-1">{m.text}</span>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, milestones: formData.milestones.filter((_, idx) => idx !== i)})}
                            className="text-white/20 hover:text-red-400 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300">
                      Cancel
                    </button>
                    <button type="submit" className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                      {editingId ? 'Update Goal' : 'Create Goal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, index) => (
            <div key={goal.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 animate-fade-rise" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-700" />
              
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs border mb-3 ${
                      goal.category === 'Career' ? 'text-blue-400 border-blue-500/30' :
                      goal.category === 'Health' ? 'text-emerald-400 border-emerald-500/30' :
                      goal.category === 'Learning' ? 'text-purple-400 border-purple-500/30' :
                      goal.category === 'Finance' ? 'text-yellow-400 border-yellow-500/30' :
                      'text-white/40 border-white/10'
                    }`}>
                      {goal.category}
                    </span>
                    <h3 className="text-2xl text-white group-hover:text-teal-200 transition-colors" style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {goal.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(goal)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300"
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-white/40 text-sm mb-6">{goal.description}</p>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/40 text-sm">Progress</span>
                    <span className="text-white font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${goal.progress}%` }} 
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex items-center gap-2 text-white/30 text-sm mb-6">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  Target: {goal.targetDate}
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                  <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Milestones</h4>
                  {goal.milestones.map((milestone, i) => (
                    <button
                      key={i}
                      onClick={() => toggleMilestone(goal.id, i)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${
                        milestone.done 
                          ? 'bg-teal-500/20 border-teal-500/50' 
                          : 'border-white/20 hover:border-teal-500/30'
                      }`}>
                        {milestone.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="M20 6 9 17l-5-5"/></svg>}
                      </div>
                      <span className={`text-sm transition-all duration-300 ${milestone.done ? 'text-white/40 line-through' : 'text-white/70'}`}>
                        {milestone.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <svg className="text-white/30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10M18 20V4M6 20v-6"/>
              </svg>
            </div>
            <h3 className="text-2xl text-white/60 mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>
              No goals yet
            </h3>
            <p className="text-white/40 mb-8">
              Set your first goal and start tracking your progress.
            </p>
            <button 
              onClick={() => setIsCreating(true)}
              className="liquid-glass rounded-full px-8 py-3 text-white hover:scale-105 transition-transform"
            >
              Create First Goal
            </button>
          </div>
        )}
      </main>
    </div>
  )
}