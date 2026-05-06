import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ events: 0, goals: 0, habits: 0, journalEntries: 0, streak: 0 })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/profile')
      setUser(data)
      setStats(data.stats)
      setFormData({ name: data.name, email: data.email, bio: data.bio, location: data.location, website: data.website })
    } catch { toast.error('Failed to load profile') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    try {
      const { data } = await API.put('/profile', { name: formData.name, bio: formData.bio, location: formData.location, website: formData.website })
      setUser(prev => ({ ...prev, ...data }))
      setIsEditing(false)
      toast.success('Profile updated')
    } catch { toast.error('Failed to update profile') }
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  if (loading) return (
    <div className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <div className="text-white/40">Loading profile...</div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-8 pt-24 pb-12">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 mb-8 animate-fade-rise">
          <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl text-white font-semibold">{getInitials(user?.name)}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{user?.name}</h1>
                <p className="text-white/50 text-sm mb-4">{user?.email}</p>
                <p className="text-white/40 text-sm max-w-lg leading-relaxed">{user?.bio || 'No bio yet.'}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  {user?.location && (
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {user.location}
                    </div>
                  )}
                  {user?.website && (
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <a href={user.website} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">{user.website.replace('https://', '')}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/30 text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    Joined {joinedDate}
                  </div>
                </div>
              </div>
              <button onClick={() => { setIsEditing(true); setFormData({ name: user.name, email: user.email, bio: user.bio, location: user.location, website: user.website }) }} className="liquid-glass rounded-full px-6 py-3 text-sm text-white cursor-pointer hover:scale-105 transition-transform flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ label: 'Events', value: stats.events }, { label: 'Goals', value: stats.goals }, { label: 'Journal', value: stats.journalEntries }, { label: 'Streak', value: `${stats.streak}d` }].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-500 text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-2xl text-white font-semibold mb-1">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['overview', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${activeTab === tab ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/60 border border-transparent'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ label: 'My Events', path: '/events', count: stats.events, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' }, { label: 'My Goals', path: '/goals', count: stats.goals, icon: 'M12 20V10M18 20V4M6 20v-6' }, { label: 'My Journal', path: '/journal', count: stats.journalEntries, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }].map((item, i) => (
              <Link key={i} to={item.path} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <svg className="text-teal-400 mb-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                <div className="text-2xl text-white font-semibold mb-1">{item.count}</div>
                <div className="text-white/40 text-sm">{item.label}</div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Account Settings</h3>
              <div className="space-y-6">
                {[{ label: 'Email Notifications', desc: 'Receive updates about your goals and events', on: true }, { label: 'Public Profile', desc: 'Allow others to view your timeline', on: false }, { label: 'Dark Mode', desc: 'Always use dark theme', on: true }].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-white text-sm font-medium">{setting.label}</div>
                      <div className="text-white/40 text-xs mt-1">{setting.desc}</div>
                    </div>
                    <button className={`w-12 h-6 rounded-full relative ${setting.on ? 'bg-teal-500/30' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${setting.on ? 'left-7 bg-teal-400' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[hsl(201,100%,13%)] shadow-2xl animate-fade-rise">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>Edit Profile</h2>
                  <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                  </div>
                  <div>
                    <label className="text-white/40 text-sm mb-2 block">Bio</label>
                    <textarea value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Location</label>
                      <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                    </div>
                    <div>
                      <label className="text-white/40 text-sm mb-2 block">Website</label>
                      <input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all duration-300">Cancel</button>
                  <button onClick={handleSave} className="liquid-glass px-8 py-3 rounded-xl text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}