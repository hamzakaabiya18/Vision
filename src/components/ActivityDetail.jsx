import { useState, useEffect, useCallback } from 'react'
import { getSportImage } from '../lib/sportImages'
import Avatar from './Avatar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SPORT_CONFIG = {
  Run:   { color:'#008080', label:'Run'  },
  Ride:  { color:'#0077aa', label:'Ride' },
  Hike:  { color:'#5a7a3a', label:'Hike' },
  Swim:  { color:'#0055aa', label:'Swim' },
  Yoga:  { color:'#7b4ea0', label:'Yoga' },
  Gym:   { color:'#b5541a', label:'Gym'  },
  Ski:   { color:'#1a6bb5', label:'Ski'  },
  Climb: { color:'#9c6010', label:'Climb'},
}

const SHARE_CONTACTS = [
  { id:'u1', name:'Marcus Chen', avatar:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80' },
  { id:'u2', name:'Sara Valeri', avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
  { id:'u3', name:'Leo Brooks',  avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80' },
]

function isRealId(id) {
  return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)
}

function fmtDuration(mins) {
  const h = Math.floor(mins/60), m = mins%60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function buildRecommendations(item) {
  const out = []
  if (item.distanceKm > 0) out.push(`Try increasing distance by ~5% next time — you're at ${item.distanceKm} km now.`)
  if (item.elevationGainM > 300) out.push('Good elevation effort. Prioritize recovery over the next 48 hours.')
  if (item.avgPace && item.avgPace !== '--:--') out.push('Your pace is stable — focus on consistency rather than chasing speed this week.')
  if (out.length === 0) out.push('Log a few more sessions this week to start unlocking personalized insights.')
  return out
}

function RouteHero({ item }) {
  const cfg = SPORT_CONFIG[item.sportType] || SPORT_CONFIG.Run
  const pts = item.routePoints

  if (Array.isArray(pts) && pts.length >= 2) {
    const lats = pts.map(p=>p.lat), lngs = pts.map(p=>p.lng)
    const minLat=Math.min(...lats), maxLat=Math.max(...lats), minLng=Math.min(...lngs), maxLng=Math.max(...lngs)
    const span = Math.max(maxLat-minLat, maxLng-minLng, 1e-4)
    const W = 600, H = 320, pad = 40
    const toX = lng => pad + ((lng-minLng)/span) * (W-pad*2)
    const toY = lat => H - pad - ((lat-minLat)/span) * (H-pad*2)
    const d = pts.map((p,i) => `${i===0?'M':'L'}${toX(p.lng).toFixed(1)} ${toY(p.lat).toFixed(1)}`).join(' ')
    return (
      <div style={{ position:'relative', height:320, background:'linear-gradient(160deg,#003d3d,#0a2a2a)', overflow:'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <path d={d} fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter:'drop-shadow(0 0 8px rgba(0,230,118,.5))' }} />
          <circle cx={toX(pts[0].lng)} cy={toY(pts[0].lat)} r="7" fill="#00E676" />
          <circle cx={toX(pts[pts.length-1].lng)} cy={toY(pts[pts.length-1].lat)} r="7" fill="#008080" />
          <defs><linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#008080"/><stop offset="100%" stopColor="#00E676"/></linearGradient></defs>
        </svg>
        <div style={{ position:'absolute', top:16, left:16, background:cfg.color, color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, letterSpacing:.4 }}>{cfg.label.toUpperCase()} ROUTE</div>
      </div>
    )
  }

  return (
    <div style={{ position:'relative', height:320, overflow:'hidden', background:`linear-gradient(150deg,${cfg.color},#0a2a2a)` }}>
      <img
        src={item.imageUrl || getSportImage(item.sportType, item._id)}
        alt={item.title}
        loading="lazy"
        style={{ width:'100%', height:'100%', objectFit:'cover' }}
        onError={e => {
          if (e.target.dataset.fallbackApplied) { e.target.style.display = 'none'; return }
          e.target.dataset.fallbackApplied = 'true'
          e.target.src = getSportImage(item.sportType, item._id)
        }}
      />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,30,30,.15) 0%,rgba(0,20,20,.65) 100%)' }} />
      <div style={{ position:'absolute', top:16, left:16, background:cfg.color, color:'#fff', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, letterSpacing:.4 }}>{cfg.label.toUpperCase()}</div>
    </div>
  )
}

export default function ActivityDetail({ activity, currentUserId, user, onClose, onLike, onPostComment, onOpenProfile, showToast }) {
  const [item,    setItem]    = useState(activity)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shared,  setShared]  = useState(null)

  useEffect(() => {
    if (!isRealId(activity._id)) return
    const token = sessionStorage.getItem('vision_token')
    fetch(`${API}/activities/${activity._id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setItem(d) })
      .catch(() => {})
  }, [activity._id])

  const cfg = SPORT_CONFIG[item.sportType] || SPORT_CONFIG.Run
  const liked = item.likes?.includes(currentUserId)

  const handleLike = useCallback(async () => {
    await onLike(item)
    setItem(prev => ({ ...prev, likes: liked ? (prev.likes||[]).filter(x=>x!==currentUserId) : [...(prev.likes||[]), currentUserId] }))
  }, [item, liked, currentUserId, onLike])

  async function submitComment() {
    const body = comment.trim()
    if (!body) return
    setPosting(true)
    await onPostComment(item, body)
    if (isRealId(item._id)) {
      setItem(prev => ({ ...prev, comments:[...(prev.comments||[]), { _id:`tmp_${Date.now()}`, body, user:{ fullName:user?.fullName, avatarUrl:user?.avatarUrl } }] }))
    } else {
      setItem(prev => ({ ...prev, comments:[...(prev.comments||[]), { _id:`tmp_${Date.now()}`, body, user:{ fullName:user?.fullName, avatarUrl:user?.avatarUrl } }] }))
    }
    setComment('')
    setPosting(false)
  }

  function handleShareTo(contact) {
    setShared(contact.name)
    showToast?.(`Shared with ${contact.name}`, 'success')
    setTimeout(() => { setSharing(false); setShared(null) }, 900)
  }

  const recommendations = buildRecommendations(item)

  return (
    <div style={{ position:'fixed', inset:0, background:'#F0FAFA', zIndex:1000, overflowY:'auto' }}>
      <button onClick={onClose} style={{ position:'fixed', top:16, left:16, zIndex:10, width:38, height:38, borderRadius:'50%', background:'rgba(0,0,0,.35)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <RouteHero item={item} />

      <div style={{ maxWidth:680, margin:'0 auto', padding:'20px 18px 60px' }}>
        <button onClick={() => onOpenProfile(item)} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0, marginBottom:16 }}>
          <Avatar user={item.user} size={42} border="2px solid #e8f4f4" />
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{item.user?.fullName}</p>
            <p style={{ fontSize:12, color:'#9aaab8' }}>@{item.user?.username} {item.location ? `· ${item.location}` : ''}</p>
          </div>
        </button>

        <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:6 }}>{item.title}</h1>
        {item.notes && <p style={{ fontSize:14, color:'#5a6a7a', lineHeight:1.6, marginBottom:18 }}>{item.notes}</p>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:24 }}>
          {[
            { label:'Distance', val: item.distanceKm ? `${item.distanceKm} km` : '--' },
            { label:'Duration', val: item.durationMinutes ? fmtDuration(item.durationMinutes) : '--' },
            { label: item.sportType==='Ride' ? 'Speed' : 'Pace', val: item.sportType==='Ride' ? (item.avgSpeed ? `${item.avgSpeed} km/h` : '--') : (item.avgPace ? `${item.avgPace}/km` : '--') },
            { label:'Elevation', val: item.elevationGainM ? `${item.elevationGainM} m` : '--' },
          ].map((st,i) => (
            <div key={i} style={{ background:'#fff', borderRadius:14, padding:'12px 8px', textAlign:'center', border:'1px solid #e8f4f4' }}>
              <p style={{ fontSize:15, fontWeight:800, color:'#1a1a2e' }}>{st.val}</p>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:2 }}>{st.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:18, alignItems:'center', padding:'10px 0', borderTop:'1px solid #e8f4f4', borderBottom:'1px solid #e8f4f4', marginBottom:20 }}>
          <button onClick={handleLike} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked?'#e53935':'none'} stroke={liked?'#e53935':'#5a6a7a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span style={{ fontSize:14, color: liked?'#e53935':'#5a6a7a', fontWeight:600 }}>{item.likes?.length || 0}</span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span style={{ fontSize:14, color:'#5a6a7a', fontWeight:600 }}>{item.comments?.length || 0}</span>
          </div>
          <button onClick={() => setSharing(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', marginLeft:'auto' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span style={{ fontSize:14, color:'#5a6a7a', fontWeight:600 }}>Share</span>
          </button>
        </div>

        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8f4f4', padding:'16px 18px', marginBottom:20 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#008080', marginBottom:10 }}>RECOMMENDATIONS</p>
          {recommendations.map((r,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom: i<recommendations.length-1 ? 8 : 0 }}>
              <span style={{ color:'#00E676', fontWeight:700 }}>•</span>
              <p style={{ fontSize:13, color:'#4a5e6a', lineHeight:1.5, margin:0 }}>{r}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Comments ({item.comments?.length || 0})</p>
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:16 }}>
          {(!item.comments || item.comments.length === 0) && <p style={{ fontSize:13, color:'#9aaab8' }}>No comments yet — be the first!</p>}
          {item.comments?.map((c, i) => (
            <div key={c._id || i} style={{ display:'flex', gap:10 }}>
              <Avatar user={c.user} size={32} />
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{c.user?.fullName || 'Athlete'}</p>
                <p style={{ fontSize:13, color:'#4a5e6a', lineHeight:1.4 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submitComment() }} placeholder="Add a comment…" style={{ flex:1, height:44, borderRadius:22, border:'1.5px solid #e8f4f4', padding:'0 16px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
          <button onClick={submitComment} disabled={!comment.trim() || posting} style={{ height:44, paddingInline:18, borderRadius:22, background:'#008080', color:'#fff', border:'none', fontWeight:600, fontSize:14, cursor: comment.trim() ? 'pointer' : 'not-allowed', opacity: posting ? .7 : 1 }}>
            {posting ? '…' : 'Post'}
          </button>
        </div>
      </div>

      {sharing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1100, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e => e.target===e.currentTarget && setSharing(false)}>
          <div style={{ width:'100%', maxWidth:430, background:'#fff', borderRadius:'20px 20px 0 0', padding:'20px 16px 36px' }}>
            <div style={{ width:36, height:4, borderRadius:2, background:'#ddd', margin:'0 auto 16px' }} />
            <p style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Share inside VISION</p>
            {shared ? (
              <p style={{ fontSize:14, color:'#00a050', fontWeight:600, textAlign:'center', padding:'20px 0' }}>Shared with {shared} ✓</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {SHARE_CONTACTS.map(c => (
                  <button key={c.id} onClick={() => handleShareTo(c)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 4px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <img src={c.avatar} alt={c.name} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} />
                    <span style={{ fontSize:14, fontWeight:600, color:'#1a1a2e' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
