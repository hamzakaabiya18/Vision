import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
function token() { return localStorage.getItem('vision_token') }

function StatCard({ label, value }) {
  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'18px 16px', border:'1px solid #e8f4f4' }}>
      <p style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', margin:0 }}>{value}</p>
      <p style={{ fontSize:12, color:'#9aaab8', marginTop:4 }}>{label}</p>
    </div>
  )
}

/* This view is only ever reachable when AppLayout has already verified
   currentUser.role === 'admin' from the real DB-backed user object — but
   every fetch here still goes through admin-only backend middleware too,
   so a forged client state still can't read this data. */
export default function AdminDashboard({ showToast }) {
  const [stats,   setStats]   = useState(null)
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [q,       setQ]       = useState('')

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/admin/stats`, { headers:{ Authorization:`Bearer ${token()}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/admin/users?q=${encodeURIComponent(q)}`, { headers:{ Authorization:`Bearer ${token()}` } }).then(r => r.ok ? r.json() : null),
    ]).then(([s, u]) => {
      setStats(s)
      setUsers(u?.users || [])
    }).catch(() => showToast?.('Could not load admin data', 'error'))
      .finally(() => setLoading(false))
  }, [q, showToast])

  useEffect(() => { load() }, [load])

  async function changeRole(userId, role) {
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error()
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
      showToast?.('Role updated', 'success')
    } catch { showToast?.('Could not update role', 'error') }
  }

  const byDay = {}
  ;(stats?.recentActivities || []).forEach(a => {
    const d = new Date(a.createdAt).toLocaleDateString([], { month:'short', day:'numeric' })
    byDay[d] = (byDay[d] || 0) + 1
  })
  const dayEntries = Object.entries(byDay)
  const maxCount = Math.max(1, ...dayEntries.map(([,c]) => c))

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', padding:'52px 16px 60px' }}>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', marginBottom:4 }}>Admin Dashboard</h1>
      <p style={{ fontSize:13, color:'#5a6a7a', marginBottom:20 }}>Platform-wide overview — visible to admins only.</p>

      {loading ? (
        <p style={{ fontSize:13, color:'#9aaab8' }}>Loading…</p>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12, marginBottom:24 }}>
            <StatCard label="Users"      value={stats?.userCount ?? '—'} />
            <StatCard label="Activities" value={stats?.activityCount ?? '—'} />
            <StatCard label="Groups"     value={stats?.groupCount ?? '—'} />
          </div>

          {dayEntries.length > 0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8f4f4', padding:16, marginBottom:24 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Recent activity volume</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:80 }}>
                {dayEntries.map(([day, count]) => (
                  <div key={day} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:1 }}>
                    <div style={{ width:'100%', maxWidth:28, height: Math.max(6, (count / maxCount) * 60), background:'linear-gradient(135deg,#008080,#00E676)', borderRadius:6 }} />
                    <span style={{ fontSize:9, color:'#9aaab8' }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8f4f4', padding:16, marginBottom:24 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:10 }}>Recent activities</p>
            {(stats?.recentActivities || []).length === 0 ? (
              <p style={{ fontSize:12, color:'#9aaab8' }}>No activities yet.</p>
            ) : stats.recentActivities.map(a => (
              <div key={a._id} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f0f4f4', fontSize:12.5 }}>
                <span style={{ color:'#1a1a2e' }}>{a.user?.fullName || 'Athlete'} — {a.title}</span>
                <span style={{ color:'#9aaab8' }}>{a.sportType} · {a.distanceKm}km</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8f4f4', padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, gap:10 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>Users ({users.length})</p>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…" style={{ flex:1, maxWidth:220, background:'#f7fbfb', border:'1.5px solid #e0eeee', borderRadius:10, padding:'7px 12px', fontSize:12.5, outline:'none', fontFamily:'inherit' }} />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', fontSize:12.5, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ textAlign:'left', color:'#9aaab8' }}>
                    <th style={{ padding:'6px 8px' }}>Name</th>
                    <th style={{ padding:'6px 8px' }}>Username</th>
                    <th style={{ padding:'6px 8px' }}>Email</th>
                    <th style={{ padding:'6px 8px' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderTop:'1px solid #f0f4f4' }}>
                      <td style={{ padding:'7px 8px', color:'#1a1a2e', fontWeight:600 }}>{u.fullName}</td>
                      <td style={{ padding:'7px 8px', color:'#5a6a7a' }}>@{u.username}</td>
                      <td style={{ padding:'7px 8px', color:'#5a6a7a' }}>{u.email}</td>
                      <td style={{ padding:'7px 8px' }}>
                        <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} style={{ fontSize:12, padding:'4px 8px', borderRadius:8, border:'1.5px solid #e0eeee', fontFamily:'inherit', color:'#1a1a2e' }}>
                          <option value="user">Athlete</option>
                          <option value="groupOwner">Group Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
