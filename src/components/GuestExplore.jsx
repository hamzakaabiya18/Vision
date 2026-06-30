import { useState, useEffect, useCallback } from 'react'
import { VisionLockup } from './Brand'
import { getSportImage } from '../lib/sportImages'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SPORTS = ['Run', 'Ride', 'Hike', 'Walk', 'Swim', 'Gym', 'Yoga', 'Ski', 'Climb']

/* Guest mode never touches AuthContext or localStorage tokens — it only
   calls the unauthenticated /api/public/preview endpoint, so a guest can
   never reach private data, post, comment, join groups, or message. */
export default function GuestExplore({ onExit }) {
  const [sport,      setSport]      = useState(null)
  const [activities, setActivities] = useState([])
  const [routes,      setRoutes]    = useState([])
  const [loading,     setLoading]   = useState(false)
  const [started,     setStarted]   = useState(false)

  const load = useCallback((s) => {
    setLoading(true)
    const qs = s ? `?sport=${encodeURIComponent(s)}` : ''
    fetch(`${API}/public/preview${qs}`)
      .then(r => r.ok ? r.json() : { activities: [], routes: [] })
      .then(d => { setActivities(d.activities || []); setRoutes(d.routes || []) })
      .catch(() => { setActivities([]); setRoutes([]) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (started) load(sport) }, [started, sport, load])

  if (!started) {
    return (
      <div style={{ minHeight:'100vh', background:'#F0FAFA', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:520, width:'100%', background:'#fff', borderRadius:24, padding:'36px 32px', boxShadow:'0 8px 40px rgba(0,128,128,.12)' }}>
          <VisionLockup size={34} dark />
          <h1 style={{ fontSize:22, fontWeight:800, color:'#0a2a2a', marginTop:20 }}>What do you want to see?</h1>
          <p style={{ fontSize:13, color:'#5a6a7a', marginTop:4, marginBottom:20 }}>Pick a sport to browse public activities and routes — no account needed.</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
            {SPORTS.map(s => (
              <button key={s} onClick={() => setSport(s)} style={{ padding:'8px 16px', borderRadius:20, border:`1.5px solid ${sport===s ? '#008080' : '#e0eeee'}`, background: sport===s ? '#e6f7f7' : '#f7fbfb', color: sport===s ? '#008080' : '#5a6a7a', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{s}</button>
            ))}
          </div>
          <button onClick={() => setStarted(true)} style={{ width:'100%', height:50, borderRadius:14, background:'linear-gradient(135deg,#008080,#00c853)', color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit' }}>
            {sport ? `Explore ${sport}` : 'Explore All Sports'}
          </button>
          <button onClick={onExit} style={{ width:'100%', marginTop:10, background:'none', border:'none', color:'#9aaab8', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F0FAFA' }}>
      <div style={{ background:'#0a2a2a', color:'#fff', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <span style={{ fontSize:13, fontWeight:600 }}>Browsing as Guest — sign up to post, comment, and join groups.</span>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setStarted(false)} style={{ padding:'6px 14px', borderRadius:10, background:'rgba(255,255,255,.12)', border:'none', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Change Sport</button>
          <button onClick={onExit} style={{ padding:'6px 14px', borderRadius:10, background:'#00E676', border:'none', color:'#0a2a2a', fontSize:12, fontWeight:700, cursor:'pointer' }}>Sign Up / Login</button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 16px 60px' }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:14 }}>Public Activities{sport ? ` · ${sport}` : ''}</h2>
        {loading ? (
          <p style={{ fontSize:13, color:'#9aaab8' }}>Loading…</p>
        ) : activities.length === 0 ? (
          <p style={{ fontSize:13, color:'#9aaab8', marginBottom:30 }}>No public activities yet for this sport.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:14, marginBottom:30 }}>
            {activities.map(a => (
              <div key={a._id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #e8f4f4' }}>
                <div style={{ height:110, background:`url(${a.imageUrl || getSportImage(a.sportType, a._id)}) center/cover` }} />
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', margin:0 }}>{a.title}</p>
                  <p style={{ fontSize:11, color:'#9aaab8', margin:'2px 0 0' }}>{a.user?.fullName || 'VISION Athlete'} · {a.distanceKm} km</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:14 }}>Popular Routes{sport ? ` · ${sport}` : ''}</h2>
        {loading ? (
          <p style={{ fontSize:13, color:'#9aaab8' }}>Loading…</p>
        ) : routes.length === 0 ? (
          <p style={{ fontSize:13, color:'#9aaab8' }}>No routes found for this sport.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:14 }}>
            {routes.map(r => (
              <div key={r._id} style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #e8f4f4' }}>
                <div style={{ height:110, background:`url(${r.imageUrl || getSportImage(r.sportType, r._id)}) center/cover` }} />
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', margin:0 }}>{r.title}</p>
                  <p style={{ fontSize:11, color:'#9aaab8', margin:'2px 0 0' }}>{r.city} · {r.distanceKm} km · {r.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
