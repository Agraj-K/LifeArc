import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [aiEnabled, setAiEnabled] = useState(localStorage.getItem('aiEnabled') !== 'false')
  const { logout } = useAuth()

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

  const toggleAi = () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    localStorage.setItem('aiEnabled', newState.toString());
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm.');
      return;
    }
    try {
      await API.delete('/profile');
      toast.success('Account deleted successfully. Goodbye!');
      logout();
    } catch {
      toast.error('Failed to delete account');
    }
  }

  const handleExportData = async () => {
    try {
      toast.success('Gathering your archive...');
      const [eventsRes, journalRes] = await Promise.all([
        API.get('/events'),
        API.get('/journal')
      ]);
      const exportData = {
        profile: user,
        memories: eventsRes.data,
        journal: journalRes.data
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifearc_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (err) {
      toast.error('Failed to export data');
    }
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
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {[{ label: 'Memories', value: stats.events }, { label: 'Goals', value: stats.goals }, { label: 'Habits', value: stats.habits }, { label: 'Journal', value: stats.journalEntries }, { label: 'Streak', value: `${stats.streak}d` }].map((stat, i) => (
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

        {activeTab === 'overview' && (() => {
          const badges = [
            { id: 'starter', name: 'The Journey Begins', desc: 'Created an account', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: 'emerald', unlocked: true },
            { id: 'memory', name: 'Memory Maker', desc: 'Logged 3+ life events', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', color: 'blue', unlocked: stats.events >= 3 },
            { id: 'goal', name: 'Goal Crusher', desc: 'Created 3+ goals', icon: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z', color: 'purple', unlocked: stats.goals >= 3 },
            { id: 'streak', name: 'Consistency King', desc: '7+ day habit streak', icon: 'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z', color: 'amber', unlocked: stats.streak >= 7 },
            { id: 'journal', name: 'Avid Journaler', desc: 'Written 5+ entries', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z', color: 'teal', unlocked: stats.journalEntries >= 5 },
            { id: 'master', name: 'Life Hacker', desc: 'All above achieved', icon: 'M6 2L2 8l10 14L22 8l-4-6H6z', color: 'rose', unlocked: (stats.events >= 3 && stats.goals >= 3 && stats.streak >= 7 && stats.journalEntries >= 5) }
          ];

          return (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl p-8 animate-fade-rise">
              <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl text-white mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Achievements</h3>
                    <p className="text-white/40 text-sm">Unlock badges as you progress in your journey.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-3xl font-semibold mb-1">
                      {badges.filter(b => b.unlocked).length}<span className="text-white/30 text-lg">/{badges.length}</span>
                    </div>
                    <div className="text-white/40 text-xs uppercase tracking-wider">Unlocked</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-500 ${
                        badge.unlocked 
                          ? `bg-white/10 border-${badge.color}-500/30 hover:bg-white/15 hover:border-${badge.color}-500/50 hover:-translate-y-1` 
                          : 'bg-black/40 border-white/5 opacity-60 grayscale'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        badge.unlocked 
                          ? `bg-${badge.color}-500/20 text-${badge.color}-400 border border-${badge.color}-500/30` 
                          : 'bg-white/5 text-white/20 border border-white/10'
                      }`}>
                        {badge.unlocked && (
                          <div className={`absolute w-12 h-12 bg-${badge.color}-400/20 rounded-full blur-md pointer-events-none`} />
                        )}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                          <path d={badge.icon} />
                        </svg>
                      </div>
                      <div className={`font-medium mb-1 ${badge.unlocked ? 'text-white' : 'text-white/50'} text-xs`}>
                        {badge.name}
                      </div>
                      <div className="text-white/40 text-[10px] leading-tight">
                        {badge.desc}
                      </div>
                      
                      {!badge.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-black/80 px-2.5 py-1 rounded-lg text-white/80 text-[10px] border border-white/10 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Locked
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'settings' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Account Settings</h3>
              <div className="space-y-4">
                
                {/* Export Data */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="text-white text-sm font-medium">Export Archive Data</div>
                    <div className="text-white/40 text-xs mt-1">Download a JSON backup of all your memories, goals, and journals.</div>
                  </div>
                  <button onClick={handleExportData} className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 hover:scale-105 transition-all text-xs font-medium">
                    Download Backup
                  </button>
                </div>

                {/* AI Settings */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="text-white text-sm font-medium">Enable AI Features</div>
                    <div className="text-white/40 text-xs mt-1">Allow AI to analyze entries for insights, mood tracking, and auto-categorization.</div>
                  </div>
                  <button onClick={toggleAi} className={`w-12 h-6 rounded-full relative ${aiEnabled ? 'bg-teal-500/30' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${aiEnabled ? 'left-7 bg-teal-400' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors mt-8">
                  <div>
                    <div className="text-red-400 text-sm font-medium">Delete Account</div>
                    <div className="text-red-400/60 text-xs mt-1">Permanently delete your account and all associated data.</div>
                  </div>
                  <button onClick={() => setIsDeletingAccount(true)} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:scale-105 transition-all text-xs font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {isDeletingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/30 bg-[hsl(201,100%,10%)] shadow-2xl animate-fade-rise">
              <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-red-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative p-8">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                  <svg className="text-red-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </div>
                <h2 className="text-2xl text-white font-serif mb-2">Delete Account?</h2>
                <p className="text-white/60 text-sm mb-6">
                  This action is permanent and cannot be undone. All your memories, goals, habits, and journals will be permanently erased.
                </p>
                <div className="mb-6">
                  <label className="text-white/40 text-sm mb-2 block">Type <span className="text-white font-bold">DELETE</span> to confirm</label>
                  <input type="text" value={deleteConfirmationText} onChange={e => setDeleteConfirmationText(e.target.value)} className="w-full bg-black/50 border border-red-500/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500 transition-all" placeholder="DELETE" />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setIsDeletingAccount(false); setDeleteConfirmationText(''); }} className="px-6 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">Cancel</button>
                  <button onClick={handleDeleteAccount} disabled={deleteConfirmationText !== 'DELETE'} className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all ${deleteConfirmationText === 'DELETE' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' : 'bg-red-500/30 cursor-not-allowed opacity-50'}`}>Delete Forever</button>
                </div>
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