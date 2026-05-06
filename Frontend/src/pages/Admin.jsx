import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [journals, setJournals] = useState([])
  const [platformStats, setPlatformStats] = useState({ totalUsers: 0, activeUsers: 0, suspendedUsers: 0, totalEvents: 0, totalGoals: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('users')
  const [suspendModal, setSuspendModal] = useState({ isOpen: false, userId: null, reason: '', submitting: false })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, submitting: false })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, feedbackRes, journalsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats'),
        API.get('/admin/feedback'),
        API.get('/admin/journals')
      ])
      setUsers(usersRes.data)
      setPlatformStats(statsRes.data)
      setFeedbacks(feedbackRes.data)
      setJournals(journalsRes.data)
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  const handleSuspend = async (id, currentStatus) => {
    if (currentStatus === 'Active') {
      setSuspendModal({ isOpen: true, userId: id, reason: '', submitting: false })
      return
    }
    
    try {
      const { data } = await API.patch(`/admin/users/${id}/suspend`, { reason: '' })
      
      const user = users.find(u => u._id === id);
      const appeal = feedbacks.find(fb => fb.email === user.email && fb.type === 'Appeal');
      
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: data.status, suspensionCount: data.suspensionCount } : u))
      setPlatformStats(prev => ({ 
        ...prev, 
        activeUsers: prev.activeUsers + 1, 
        suspendedUsers: Math.max(0, prev.suspendedUsers - 1) 
      }))
      
      if (appeal) {
        await API.delete(`/admin/feedback/${appeal._id}`);
        setFeedbacks(prev => prev.filter(fb => fb._id !== appeal._id));
      }
      
      toast.success('User activated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user')
    }
  }

  const confirmSuspend = async (e) => {
    e.preventDefault()
    setSuspendModal(prev => ({ ...prev, submitting: true }))
    try {
      const { data } = await API.patch(`/admin/users/${suspendModal.userId}/suspend`, { reason: suspendModal.reason })
      setUsers(prev => prev.map(u => u._id === suspendModal.userId ? { ...u, status: data.status, suspensionCount: data.suspensionCount } : u))
      setPlatformStats(prev => ({ 
        ...prev, 
        activeUsers: Math.max(0, prev.activeUsers - 1), 
        suspendedUsers: prev.suspendedUsers + 1 
      }))
      toast.success('User suspended')
      setSuspendModal({ isOpen: false, userId: null, reason: '', submitting: false })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend user')
      setSuspendModal(prev => ({ ...prev, submitting: false }))
    }
  }

  const confirmDelete = async (e) => {
    e.preventDefault()
    setDeleteModal(prev => ({ ...prev, submitting: true }))
    try {
      if (deleteModal.type === 'user') {
        await API.delete(`/admin/users/${deleteModal.id}`)
        setUsers(prev => prev.filter(u => u._id !== deleteModal.id))
        setPlatformStats(prev => ({ ...prev, activeUsers: Math.max(0, prev.activeUsers - 1), totalUsers: Math.max(0, prev.totalUsers - 1) }))
        toast.success('User deleted')
      } else if (deleteModal.type === 'journal') {
        await API.delete(`/admin/journals/${deleteModal.id}`)
        setJournals(prev => prev.filter(j => j._id !== deleteModal.id))
        toast.success('Post deleted')
      } else if (deleteModal.type === 'feedback') {
        await API.delete(`/admin/feedback/${deleteModal.id}`)
        setFeedbacks(prev => prev.filter(fb => fb._id !== deleteModal.id))
        toast.success('Feedback deleted')
      }
      setDeleteModal({ isOpen: false, type: null, id: null, submitting: false })
    } catch {
      toast.error(`Failed to delete ${deleteModal.type}`)
      setDeleteModal(prev => ({ ...prev, submitting: false }))
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUnsuspendFromAppeal = async (appealId, email) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // If the user doesn't exist in the system (or was a test dummy), just delete the ghost appeal.
    if (!user) {
      try {
        await API.delete(`/admin/feedback/${appealId}`);
        setFeedbacks(prev => prev.filter(fb => fb._id !== appealId));
        toast.success('Ghost appeal deleted');
      } catch {
        toast.error('Failed to delete ghost appeal');
      }
      return;
    }
    
    if (user.status !== 'Suspended') return toast.error('User is already active');
    
    try {
      // Unsuspend user
      const { data } = await API.patch(`/admin/users/${user._id}/suspend`, { reason: '' });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: data.status, suspensionCount: data.suspensionCount } : u));
      
      setPlatformStats(prev => ({ 
        ...prev, 
        activeUsers: prev.activeUsers + 1, 
        suspendedUsers: Math.max(0, prev.suspendedUsers - 1) 
      }))

      // Delete appeal
      await API.delete(`/admin/feedback/${appealId}`);
      setFeedbacks(prev => prev.filter(fb => fb._id !== appealId));
      
      toast.success(`User ${email} has been activated and appeal resolved`);
    } catch (err) {
      toast.error('Failed to resolve appeal');
    }
  }

  const regularFeedback = feedbacks.filter(fb => fb.type !== 'Appeal');
  const appealsList = feedbacks.filter(fb => fb.type === 'Appeal');

  const stats = [
    { label: 'Total Users', value: platformStats.totalUsers, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
    { label: 'Active', value: platformStats.activeUsers, icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
    { label: 'Suspended', value: platformStats.suspendedUsers, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }
  ]

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'hsl(201, 100%, 13%)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(201,100%,10%)] to-[hsl(201,100%,16%)] opacity-80" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-teal-900/30 blur-[120px] animate-drift-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px] animate-drift-2" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-12">
        <div className="mb-12 animate-fade-rise">
          <h1 className="text-5xl md:text-6xl text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Admin <em className="not-italic text-white/40">Dashboard</em></h1>
          <p className="text-white/50 text-base mt-4">Monitor users, track platform usage, and manage the system.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <svg className="text-teal-400 mb-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={stat.icon} /></svg>
              <div className="text-3xl text-white font-semibold mb-1">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['users', 'appeals', 'feedback', 'community'].map(tab => (
            <button key={tab} onClick={() => setSelectedTab(tab)} className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 capitalize ${selectedTab === tab ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/60 border border-transparent'}`}>{tab}</button>
          ))}
        </div>

        {selectedTab === 'users' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50">
            <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>User Management</h2>
                <div className="relative">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-64 bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300" />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-12 text-white/40">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['User', 'Role', 'Status', 'Suspensions', 'Joined', 'Actions'].map(h => (
                          <th key={h} className={`${h === 'Actions' ? 'text-right' : 'text-left'} text-white/40 text-sm font-medium py-4 px-4`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <div>
                                <div className="text-white text-sm">{user.name}</div>
                                <div className="text-white/40 text-xs">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs border ${user.role === 'admin' ? 'text-purple-400 border-purple-500/30' : 'text-white/40 border-white/10'}`}>{user.role}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs border ${user.status === 'Active' ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>{user.status}</span>
                          </td>
                          <td className="py-4 px-4 text-white/40 text-sm font-medium">{user.suspensionCount || 0}</td>
                          <td className="py-4 px-4 text-white/40 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            {user.role !== 'admin' && (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleSuspend(user._id, user.status)} className={`p-2 rounded-lg border transition-all duration-300 ${user.status === 'Active' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`} title={user.status === 'Active' ? 'Suspend' : 'Activate'}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {user.status === 'Active' ? <><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-.43 2.8a2 2 0 0 0 2 2.3H10z"/><path d="M17 12v4a3 3 0 0 1-3 3l-4-9V2h10.28a2 2 0 0 1 2 1.7l.43 2.8a2 2 0 0 1-2 2.3H17z"/></> : <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></>}
                                  </svg>
                                </button>
                                <button onClick={() => setDeleteModal({ isOpen: true, type: 'user', id: user._id, submitting: false })} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300" title="Delete">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-12 text-white/40">No users found.</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'appeals' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <h2 className="text-2xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Suspension Appeals</h2>
            <div className="space-y-4">
              {appealsList.length === 0 ? (
                <div className="text-center py-12 text-white/40">No pending appeals.</div>
              ) : appealsList.map(fb => (
                <div key={fb._id} className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {fb.name} 
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/30">Appeal</span>
                      </div>
                      <div className="text-white/40 text-sm">{fb.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/30 text-xs mb-2">{new Date(fb.createdAt).toLocaleDateString()}</div>
                      <button onClick={() => handleUnsuspendFromAppeal(fb._id, fb.email)} className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 text-xs font-medium">
                        Unsuspend User
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-white/70 text-sm">
                    {fb.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'feedback' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <h2 className="text-2xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>User Feedback</h2>
            <div className="space-y-4">
              {regularFeedback.length === 0 ? (
                <div className="text-center py-12 text-white/40">No feedback submitted yet.</div>
              ) : regularFeedback.map(fb => (
                <div key={fb._id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-medium">{fb.name}</div>
                      <div className="text-white/40 text-sm">{fb.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/30 text-xs mb-2">{new Date(fb.createdAt).toLocaleDateString()}</div>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: 'feedback', id: fb._id, submitting: false })} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300 text-xs font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'community' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <h2 className="text-2xl text-white mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>Community Moderation</h2>
            <div className="space-y-4">
              {journals.length === 0 ? (
                <div className="text-center py-12 text-white/40">No community posts yet.</div>
              ) : journals.map(journal => (
                <div key={journal._id} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-white font-medium text-lg">{journal.title}</div>
                      <div className="text-white/40 text-sm">By {journal.userId?.name || 'Unknown User'} ({journal.userId?.email || 'N/A'})</div>
                    </div>
                    <button onClick={() => setDeleteModal({ isOpen: true, type: 'journal', id: journal._id, submitting: false })} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors text-xs font-medium">Delete Post</button>
                  </div>
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">{journal.content}</p>
                  <div className="flex gap-4 text-xs text-white/30">
                    <span>{journal.likes?.length || 0} Likes</span>
                    <span>{journal.comments?.length || 0} Comments</span>
                    <span>{new Date(journal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Suspension Modal */}
      {suspendModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSuspendModal({ isOpen: false, userId: null, reason: '', submitting: false })} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-[#0a151c] shadow-2xl shadow-black p-8 animate-fade-rise">
            <div className="absolute -top-[100px] -left-[100px] w-[200px] h-[200px] bg-red-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative">
              <h3 className="text-2xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Suspend User</h3>
              <p className="text-white/50 text-sm mb-6">This will immediately revoke their access to the platform.</p>
              
              <form onSubmit={confirmSuspend} className="flex flex-col gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Reason (Optional)</label>
                  <input 
                    type="text"
                    value={suspendModal.reason}
                    onChange={(e) => setSuspendModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Violation of community guidelines"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setSuspendModal({ isOpen: false, userId: null, reason: '', submitting: false })}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={suspendModal.submitting}
                    className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    {suspendModal.submitting ? 'Suspending...' : 'Suspend'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, submitting: false })} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-[#0a151c] shadow-2xl shadow-black p-8 animate-fade-rise text-center">
            <div className="absolute -top-[100px] -left-[100px] w-[200px] h-[200px] bg-red-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <svg className="text-red-400" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-2xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Delete {deleteModal.type === 'user' ? 'User' : deleteModal.type === 'journal' ? 'Post' : 'Feedback'}?
              </h3>
              <p className="text-white/50 text-sm mb-8">
                {deleteModal.type === 'user' 
                  ? "Are you sure you want to delete this user and all their data? This action cannot be undone."
                  : "Are you sure you want to permanently delete this? This action cannot be undone."}
              </p>
              
              <form onSubmit={confirmDelete} className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, submitting: false })}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={deleteModal.submitting}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {deleteModal.submitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}