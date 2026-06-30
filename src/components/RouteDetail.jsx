import { useState, useEffect } from 'react'
import { getSportImage } from '../lib/sportImages'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DIFFICULTY_COLOR = { easy:'#00a050', moderate:'#d4880a', hard:'#e53935' }

function fmtDuration(mins) {
  const h = Math.floor(mins/60), m = mins%60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function RouteMap({ route, large = false }) {
  const pts = route.routePoints
  const h = large ? 320 : 160
  if (!Array.isArray(pts) || pts.length < 2) {
    return (
      <div style={{ position:'relative', height:h, overflow:'hidden', background:'linear-gradient(150deg,#005f5f,#0a2a2a)' }}>
        <img
          src={route.imageUrl || getSportImage(route.sportType, route._id)}
          alt={route.title}
          loading="lazy"
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => {
            if (e.target.dataset.fallbackApplied) { e.target.style.display = 'none'; return }
            e.target.dataset.fallbackApplied = 'true'
            e.target.src = getSportImage(route.sportType, route._id)
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,30,30,.1) 0%,rgba(0,20,20,.55) 100%)' }} />
      </div>
    )
  }
  const lats = pts.map(p=>p.lat), lngs = pts.map(p=>p.lng)
  const minLat=Math.min(...lats), maxLat=Math.max(...lats), minLng=Math.min(...lngs), maxLng=Math.max(...lngs)
  const span = Math.max(maxLat-minLat, maxLng-minLng, 1e-4)
  const W = 600, pad = 36
  const toX = lng => pad + ((lng-minLng)/span) * (W-pad*2)
  const toY = lat => h - pad - ((lat-minLat)/span) * (h-pad*2)
  const d = pts.map((p,i) => `${i===0?'M':'L'}${toX(p.lng).toFixed(1)} ${toY(p.lat).toFixed(1)}`).join(' ')
  return (
    <div style={{ position:'relative', height:h, background:'linear-gradient(160deg,#e8f6f3,#d4ece8)', overflow:'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="xMidYMid meet">
        <path d={d} fill="none" stroke="url(#rdGrad)" strokeWidth={large?5:3.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={toX(pts[0].lng)} cy={toY(pts[0].lat)} r={large?8:6} fill="#00E676" />
        <circle cx={toX(pts[pts.length-1].lng)} cy={toY(pts[pts.length-1].lat)} r={large?8:6} fill="#008080" />
        <defs><linearGradient id="rdGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#008080"/><stop offset="100%" stopColor="#00E676"/></linearGradient></defs>
      </svg>
      <div style={{ position:'absolute', top:14, left:14, background:'rgba(0,61,61,.85)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{route.city}</div>
    </div>
  )
}

export default function RouteDetail({ route: routeProp, currentUserId, onClose, onSaveToggle, onStartRoute, showToast }) {
  const [route, setRoute] = useState(routeProp)

  useEffect(() => {
    const token = sessionStorage.getItem('vision_token')
    fetch(`${API}/routes/${routeProp._id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRoute(d) })
      .catch(() => {})
  }, [routeProp._id])

  const saved = route.savedByMe ?? route.saves?.some(s => s===currentUserId || s?._id===currentUserId)
  const diffColor = DIFFICULTY_COLOR[route.difficulty] || '#9aaab8'

  async function handleSave() {
    setRoute(r => ({ ...r, savedByMe: !saved, savesCount: saved ? (r.savesCount||1)-1 : (r.savesCount||0)+1 }))
    await onSaveToggle(route)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#F0FAFA', zIndex:1000, overflowY:'auto' }}>
      <button onClick={onClose} style={{ position:'fixed', top:16, left:16, zIndex:10, width:38, height:38, borderRadius:'50%', background:'rgba(0,0,0,.35)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <RouteMap route={route} large />

      <div style={{ maxWidth:640, margin:'0 auto', padding:'20px 18px 60px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e' }}>{route.title}</h1>
          <span style={{ background:`${diffColor}18`, color:diffColor, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:8, textTransform:'capitalize', flexShrink:0 }}>{route.difficulty}</span>
        </div>
        <p style={{ fontSize:13, color:'#9aaab8', marginBottom:18 }}>{route.city}{route.country ? `, ${route.country}` : ''} · {route.sportType}</p>

        {route.description && <p style={{ fontSize:14, color:'#5a6a7a', lineHeight:1.6, marginBottom:20 }}>{route.description}</p>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
          {[
            { label:'Distance',  val:`${route.distanceKm} km` },
            { label:'Est. Time', val: fmtDuration(route.estimatedDurationMinutes) },
            { label:'Elevation', val:`${route.elevationGainM} m` },
          ].map((st,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:14, padding:'14px 8px', textAlign:'center', border:'1px solid #e8f4f4' }}>
              <p style={{ fontSize:16, fontWeight:800, color:'#1a1a2e' }}>{st.val}</p>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:2 }}>{st.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleSave} style={{ flex:1, height:50, borderRadius:14, background: saved ? '#fff' : 'rgba(0,128,128,.08)', border: saved ? '1.5px solid #008080' : '1.5px solid transparent', color:'#008080', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? '#008080' : 'none'} stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            {saved ? 'Saved' : 'Save Route'}
          </button>
          <button onClick={() => onStartRoute?.(route)} style={{ flex:2, height:50, borderRadius:14, background:'linear-gradient(135deg,#008080,#00E676)', color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,128,128,.3)' }}>
            Start This Route
          </button>
        </div>
      </div>
    </div>
  )
}
