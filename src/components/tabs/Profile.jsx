import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ACTIVITIES = [
  { id:1, type:'Run',  title:'Trail Sunrise Run',  date:'Yesterday · 06:30 AM', dist:'12.4', time:'48:12', pace:'3:53/km', img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' },
  { id:2, type:'Gym',  title:'Upper Body Power',   date:'2 days ago · 05:45 AM', calories:'740 kcal', time:'1:15:00', img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80' },
  { id:3, type:'Ride', title:'Sunset Road Ride',   date:'3 days ago · 07:12 PM', dist:'32.1', speed:'28.4 km/h', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
]

const BADGES = [
  { label:'100 km Club',   color:'#fff7e6', accent:'#f59e0b' },
  { label:'30-Day Streak', color:'#fff0f0', accent:'#ef4444' },
  { label:'Early Riser',   color:'#f0f9ff', accent:'#0ea5e9' },
  { label:'Summit Seeker', color:'#f0fdf4', accent:'#22c55e' },
]

function TypeBadge({ type }) {
  const map = { Run:{ bg:'rgba(0,128,128,.1)', color:'#008080', label:'Running' }, Ride:{ bg:'rgba(0,168,122,.1)', color:'#00a87a', label:'Cycling' }, Gym:{ bg:'rgba(212,86,10,.1)', color:'#d4560a', label:'Gym' } }
  const { bg, color, label } = map[type] || map.Run
  return <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, letterSpacing:.3 }}>{label}</span>
}

export default function Profile({ user: propUser, onLogout, onStats, showToast }) {
  const { currentUser, updateUser } = useAuth()
  const user = currentUser || propUser

  const [tab,           setTab]          = useState('activities')
  const [editing,       setEditing]      = useState(false)
  const [logoutConfirm, setLogoutConfirm]= useState(false)
  const [editForm,      setEditForm]     = useState(null)

  function openEdit() {
    setEditForm({ fullName: user?.fullName || '', username: user?.username || '', bio: user?.bio || '' })
    setEditing(true)
  }

  async function handleSaveProfile() {
    if (!editForm) return
    try {
      const token = localStorage.getItem('vision_token')
      const res = await fetch(`${API}/users/me`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(editForm) })
      if (res.ok) { const { user: updated } = await res.json(); updateUser(updated) }
      else updateUser(editForm)
    } catch { updateUser(editForm) }
    setEditing(false)
    showToast?.('Profile updated', 'success')
  }

  function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); setTimeout(()=>setLogoutConfirm(false),3000); return }
    onLogout?.()
  }

  const displayName = user?.fullName || user?.name || 'Athlete'
  const displayUser = user?.username || 'athlete'
  const displayBio  = user?.bio || 'Endurance athlete. Pushing the limits, one step at a time.'
  const avatarSrc   = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=008080&color=fff&size=160`
  const followers   = user?.followersCount ?? 0
  const following   = user?.followingCount ?? 0
  const activities  = user?.activitiesCount ?? 0

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:24 }}>
      <div style={{ background:'linear-gradient(175deg,#004444 0%,#008080 100%)', padding:'52px 0 0', position:'relative', overflow:'hidden' }}>
        <svg style={{ position:'absolute', top:-40, right:-40, opacity:.08 }} width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="110" fill="#00E676"/></svg>
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'0 16px 10px' }}>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:28 }}>
          <img src={avatarSrc} alt={displayName} style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,.35)', marginBottom:14 }} onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=008080&color=fff&size=160` }} />
          <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>{displayName}</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:8 }}>@{displayUser}</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', marginBottom:20, textAlign:'center', padding:'0 32px', lineHeight:1.6 }}>{displayBio}</p>
          <div style={{ display:'flex', gap:36, marginBottom:20 }}>
            {[{ label:'FOLLOWERS', val:followers },{ label:'FOLLOWING', val:following },{ label:'ACTIVITIES', val:activities }].map(({ label, val }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <p style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{val > 999 ? `${(val/1000).toFixed(1)}k` : val}</p>
                <p style={{ fontSize:9, color:'rgba(255,255,255,.55)', fontWeight:600, letterSpacing:.5, marginTop:2 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={openEdit} style={{ display:'flex', alignItems:'center', gap:7, padding:'0 18px', height:38, borderRadius:12, background:'rgba(255,255,255,.12)', border:'1.5px solid rgba(255,255,255,.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
            <button onClick={() => showToast?.('Settings coming soon')} style={{ display:'flex', alignItems:'center', gap:7, padding:'0 18px', height:38, borderRadius:12, background:'rgba(255,255,255,.12)', border:'1.5px solid rgba(255,255,255,.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
          </div>
        </div>
      </div>

      <div style={{ margin:'0 16px', marginTop:-18, background:'#fff', borderRadius:20, padding:'18px 20px', boxShadow:'0 4px 20px rgba(0,128,128,.12)', border:'1px solid #e8f4f4', position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>Weekly Metrics</p>
          <span style={{ fontSize:12, color:'#00c853', fontWeight:700 }}>+12% from last week</span>
        </div>
        <div style={{ display:'flex' }}>
          {[{ label:'Active Time',val:'18h 42m' },{ label:'Distance',val:'87.3 km' },{ label:'Calories',val:'6,240' },{ label:'Workouts',val:'9' }].map((m,i)=>(
            <div key={m.label} style={{ flex:1, textAlign:'center', borderRight: i<3 ? '1px solid #e8f4f4' : 'none' }}>
              <p style={{ fontSize:14, fontWeight:800, color:'#1a1a2e' }}>{m.val}</p>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:2, fontWeight:500 }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:0, margin:'20px 16px 16px', background:'#fff', borderRadius:14, padding:4, boxShadow:'0 2px 8px rgba(0,128,128,.06)' }}>
        {['activities','stats','badges'].map(t => (
          <button key={t} onClick={() => { if (t==='stats' && onStats) { onStats(); return } setTab(t) }} style={{ flex:1, height:38, borderRadius:10, background: tab===t ? 'linear-gradient(135deg,#008080,#00c853)' : 'transparent', color: tab===t ? '#fff' : '#9aaab8', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize', transition:'all .2s' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>
        {tab === 'activities' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Past Activities</span>
              <button style={{ fontSize:12, color:'#008080', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View All</button>
            </div>
            {ACTIVITIES.map(a => (
              <div key={a.id} style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
                <div style={{ position:'relative', height:150 }}>
                  <img src={a.img} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 55%)' }} />
                  <div style={{ position:'absolute', top:12, left:14 }}><TypeBadge type={a.type} /></div>
                  <div style={{ position:'absolute', bottom:12, left:14 }}>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,.65)', marginBottom:2 }}>{a.date}</p>
                    <p style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{a.title}</p>
                  </div>
                </div>
                <div style={{ display:'flex', padding:'12px 0' }}>
                  {[a.dist?{label:'Distance',val:`${a.dist} km`}:null, a.calories?{label:'Burned',val:a.calories}:null, a.speed?{label:'Avg Speed',val:a.speed}:null, a.pace?{label:'Avg Pace',val:a.pace}:null, {label:'Duration',val:a.time}].filter(Boolean).map((st,i,arr)=>(
                    <div key={i} style={{ flex:1, textAlign:'center', borderRight: i<arr.length-1 ? '1px solid #e8f4f4' : 'none' }}>
                      <p style={{ fontSize:13, fontWeight:800, color:'#1a1a2e' }}>{st.val}</p>
                      <p style={{ fontSize:10, color:'#9aaab8' }}>{st.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'badges' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Earned Badges</span>
              <span style={{ fontSize:12, color:'#9aaab8' }}>{BADGES.length} / 12</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {BADGES.map(b => (
                <div key={b.label} style={{ background:'#fff', borderRadius:18, padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
                  <div style={{ width:56, height:56, borderRadius:18, background:b.color, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={b.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#1a1a2e' }}>{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && editForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:200, display:'flex', alignItems:'flex-end' }} onClick={() => setEditing(false)}>
          <div style={{ background:'#fff', width:'100%', maxWidth:480, margin:'0 auto', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', animation:'slideUp .3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:'#e0eeee', margin:'0 auto 20px' }} />
            <h3 style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:20 }}>Edit Profile</h3>
            {[{ key:'fullName', label:'Full Name', ph:'Your full name' },{ key:'username', label:'Username', ph:'@username' },{ key:'bio', label:'Bio', ph:'Tell your story…' }].map(({ key, label, ph }) => (
              <div key={key} style={{ marginBottom:14 }}>
                <p style={{ fontSize:12, color:'#9aaab8', fontWeight:600, marginBottom:6 }}>{label}</p>
                <input value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width:'100%', background:'#f7fbfb', border:'1.5px solid #e0eeee', borderRadius:12, padding:'11px 14px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button onClick={() => setEditing(false)} style={{ flex:1, height:50, borderRadius:14, background:'#f7fbfb', border:'1.5px solid #e0eeee', color:'#5a6a7a', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={handleSaveProfile} style={{ flex:2, height:50, borderRadius:14, background:'linear-gradient(135deg,#008080,#00c853)', color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,128,128,.3)', fontFamily:'inherit' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
