import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import API from '../api'
import '../index.css'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [platformStats, setPlatformStats] = useState({ totalUsers: 0, activeUsers: 0, suspendedUsers: 0, totalEvents: 0, totalGoals: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('users')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats'),
      ])
      setUsers(usersRes.data)
      setPlatformStats(statsRes.data)
    } catch { toast.error('Failed to load admin data') }
    finally { setLoading(false) }
  }

  const handleSuspend = async (id) => {
    try {
      const { data } = await API.patch(`/admin/users/${id}/suspend`)
      setUsers(prev => prev.map(u => u._id === id ? { ...u, status: data.status } : u))
      toast.success(`User ${data.status === 'Active' ? 'activated' : 'suspended'}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and all their data? This cannot be undone.')) return
    try {
      await API.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Users', value: platformStats.totalUsers, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
    { label: 'Active', value: platformStats.activeUsers, icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' },
    { label: 'Suspended', value: platformStats.suspendedUsers, icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
    { label: 'Total Events', value: platformStats.totalEvents, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { label: 'Total Goals', value: platformStats.totalGoals, icon: 'M12 20V10M18 20V4M6 20v-6' },
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
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
          {['users', 'settings'].map(tab => (
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
                        {['User', 'Role', 'Status', 'Joined', 'Events', 'Goals', 'Actions'].map(h => (
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
                          <td className="py-4 px-4 text-white/40 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-white/60 text-sm">{user.events}</td>
                          <td className="py-4 px-4 text-white/60 text-sm">{user.goals}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleSuspend(user._id)} className={`p-2 rounded-lg border transition-all duration-300 ${user.status === 'Active' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`} title={user.status === 'Active' ? 'Suspend' : 'Activate'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  {user.status === 'Active' ? <><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-.43 2.8a2 2 0 0 0 2 2.3H10z"/><path d="M17 12v4a3 3 0 0 1-3 3l-4-9V2h10.28a2 2 0 0 1 2 1.7l.43 2.8a2 2 0 0 1-2 2.3H17z"/></> : <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></>}
                                </svg>
                              </button>
                              <button onClick={() => handleDelete(user._id)} className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-300" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
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

        {selectedTab === 'settings' && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8">
            <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative max-w-2xl">
              <h3 className="text-2xl text-white mb-8" style={{ fontFamily: "'Instrument Serif', serif" }}>System Settings</h3>
              <div className="space-y-6">
                {[{ label: 'User Registration', description: 'Allow new user signups', enabled: true }, { label: 'Email Notifications', description: 'Send email alerts to users', enabled: true }, { label: 'Maintenance Mode', description: 'Put site in maintenance mode', enabled: false }].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <div className="text-white text-sm font-medium">{setting.label}</div>
                      <div className="text-white/40 text-xs mt-1">{setting.description}</div>
                    </div>
                    <button className={`w-12 h-6 rounded-full transition-all duration-300 relative ${setting.enabled ? 'bg-teal-500/30' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${setting.enabled ? 'left-7 bg-teal-400' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}