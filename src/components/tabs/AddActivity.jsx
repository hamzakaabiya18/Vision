import { useState, useEffect, useRef, useCallback } from 'react'
import { VisionLockup } from '../Brand'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SPORTS = [
  { key:'Running',   icon:'running',   color:'#008080' },
  { key:'Cycling',   icon:'cycling',   color:'#00a87a' },
  { key:'Hiking',    icon:'hiking',    color:'#5a7a3a' },
  { key:'Swimming',  icon:'swimming',  color:'#0077b6' },
  { key:'Gym',       icon:'gym',       color:'#d4560a' },
  { key:'Yoga',      icon:'yoga',      color:'#9c6fd6' },
  { key:'Skiing',    icon:'skiing',    color:'#1a6bb5' },
  { key:'Triathlon', icon:'triathlon', color:'#7b2cbf' },
]

function SportIcon({ type, size = 28, color = '#fff' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:2.2, strokeLinecap:'round', strokeLinejoin:'round' }
  switch (type) {
    case 'running':
      // Sprinting figure, clearly distinct silhouette
      return (
        <svg {...common}>
          <circle cx="14.5" cy="3.8" r="1.9" fill={color} stroke="none"/>
          <path d="M10 21l1.8-5.5-2.3-2.3 1.3-4.7 2.6 2 3.4-1.3M13.4 10.8l2.4 1.6 3.2-1M9.5 13.3l-4 1.4"/>
        </svg>
      )
    case 'cycling':
      // Two wheels + frame, instantly recognizable bike shape
      return (
        <svg {...common}>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <path d="M5.5 17.5L10 9h4l4.5 8.5M10 9l2.5 4.5h5.5M10 9L8 6h-2"/>
        </svg>
      )
    case 'hiking':
      // Mountain peak with a flag/path marker
      return (
        <svg {...common}>
          <path d="M3 19h18"/>
          <path d="M5 19l5-11 3 5 2-3 4 9z"/>
          <circle cx="13" cy="6.5" r="1.6" fill={color} stroke="none"/>
        </svg>
      )
    case 'swimming':
      // Wave lines + diver figure
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="1.8" fill={color} stroke="none"/>
          <path d="M6 8l3 3-1 4 4 1"/>
          <path d="M2 18c1.6 1.3 3.2 1.3 4.8 0 1.6 1.3 3.2 1.3 4.8 0 1.6 1.3 3.2 1.3 4.8 0 1.6 1.3 3.2 1.3 4.8 0" strokeWidth="2"/>
        </svg>
      )
    case 'gym':
      // Barbell — unmistakably gym
      return (
        <svg {...common}>
          <path d="M2 12h20" strokeWidth="2.4"/>
          <rect x="1" y="9" width="3" height="6" rx="1" fill={color} stroke="none"/>
          <rect x="20" y="9" width="3" height="6" rx="1" fill={color} stroke="none"/>
          <rect x="5" y="7" width="2.4" height="10" rx="1" fill={color} stroke="none"/>
          <rect x="16.6" y="7" width="2.4" height="10" rx="1" fill={color} stroke="none"/>
        </svg>
      )
    case 'yoga':
      // Seated lotus pose silhouette
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="1.9" fill={color} stroke="none"/>
          <path d="M12 7.5v4.5"/>
          <path d="M12 12l-6 3M12 12l6 3M6 15l2.5-1.5M18 15l-2.5-1.5"/>
          <path d="M5.5 19h13"/>
        </svg>
      )
    case 'skiing':
      // Skis + poles, slanted descent
      return (
        <svg {...common}>
          <circle cx="13" cy="4" r="1.8" fill={color} stroke="none"/>
          <path d="M13 6.5v5l-3 4M13 11.5l3 2.5"/>
          <path d="M5 19l6-2M13 17l6-2"/>
          <path d="M9 9l-2.5 2M16 9l2.5 3"/>
        </svg>
      )
    case 'triathlon':
      // Medal ribbon, distinct from generic running glyph
      return (
        <svg {...common}>
          <circle cx="12" cy="15" r="5"/>
          <path d="M9 10.5L7 3M15 10.5l2-7.5"/>
          <path d="M10 15l1.3 1.3L14.5 13"/>
        </svg>
      )
    default:
      return null
  }
}

function haversine(a, b) {
  const R = 6371e3, toRad = d => d * Math.PI / 180
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat)
  const Δφ = toRad(b.lat - a.lat), Δλ = toRad(b.lng - a.lng)
  const h = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h))
}

function fmtTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function fmtPace(distM, secs) {
  if (distM < 10) return '--:--'
  const minPerKm = secs / 60 / (distM / 1000)
  const m = Math.floor(minPerKm), s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2,'0')}/km`
}

function SummaryCard({ label, val }) {
  return (
    <div style={{ flex:1, textAlign:'center', background:'#f7fbfb', borderRadius:16, padding:'16px 8px' }}>
      <p style={{ fontSize:18, fontWeight:800, color:'#1a1a2e' }}>{val}</p>
      <p style={{ fontSize:11, color:'#9aaab8', marginTop:4, fontWeight:500 }}>{label}</p>
    </div>
  )
}

export default function AddActivity({ user, showToast, onDone }) {
  const [phase,     setPhase]     = useState('select')   // select | countdown | tracking | summary
  const [sport,     setSport]     = useState(null)
  const [count,     setCount]     = useState(3)
  const [elapsed,   setElapsed]   = useState(0)
  const [paused,    setPaused]    = useState(false)
  const [distM,     setDistM]     = useState(0)
  const [coords,    setCoords]    = useState([])
  const [saving,    setSaving]    = useState(false)
  const [note,      setNote]      = useState('')
  const [imageUrl,  setImageUrl]  = useState('')

  const timerRef   = useRef(null)
  const watchRef   = useRef(null)
  const lastPosRef = useRef(null)
  const pausedRef  = useRef(false)

  const stopTimer = useCallback(() => {
    if (timerRef.current)  { clearInterval(timerRef.current);  timerRef.current = null }
    if (watchRef.current != null) { navigator.geolocation?.clearWatch(watchRef.current); watchRef.current = null }
  }, [])

  useEffect(() => {
    if (phase !== 'countdown') return
    setCount(3)
    const iv = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(iv); startTracking(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [phase])

  function startTracking() {
    setPhase('tracking')
    setElapsed(0); setDistM(0); setCoords([]); lastPosRef.current = null; pausedRef.current = false
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) setElapsed(e => e + 1)
    }, 1000)
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(pos => {
        if (pausedRef.current) return
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (lastPosRef.current) {
          const d = haversine(lastPosRef.current, pt)
          if (d > 2 && d < 200) setDistM(prev => prev + d)
        }
        lastPosRef.current = pt
        setCoords(prev => [...prev.slice(-199), pt])
      }, () => {}, { enableHighAccuracy:true, maximumAge:0 })
    }
  }

  function togglePause() {
    pausedRef.current = !pausedRef.current
    setPaused(p => !p)
  }

  function handleStop() {
    stopTimer()
    setPhase('summary')
  }

  useEffect(() => () => stopTimer(), [stopTimer])

  const SPORT_TYPE_MAP = { Running:'Run', Cycling:'Ride', Hiking:'Hike', Swimming:'Swim', Gym:'Gym', Yoga:'Yoga', Skiing:'Ski', Triathlon:'Run' }

  async function handleSave() {
    setSaving(true)
    const body = {
      sportType: SPORT_TYPE_MAP[sport?.key] || 'Run',
      title: `${sport?.key} ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}`,
      distanceKm: parseFloat((distM/1000).toFixed(2)),
      durationMinutes: Math.round(elapsed/60),
      routePoints: coords.length >= 2 ? coords.map(c=>({ lat:c.lat, lng:c.lng })) : undefined,
      notes: note,
      imageUrl: imageUrl.trim() || undefined,
    }
    try {
      const token = localStorage.getItem('vision_token')
      const res = await fetch(`${API}/activities`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Save failed')
      showToast?.('Activity saved!', 'success')
    } catch {
      showToast?.('Could not save — check your connection', 'error')
    }
    setSaving(false)
    onDone?.()
  }

  function reset() { stopTimer(); setPhase('select'); setSport(null); setElapsed(0); setDistM(0); setCoords([]); setImageUrl(''); setNote('') }

  // ─── Route SVG ───────────────────────────────────────────────────────────────
  function RouteSVG({ pts, w=260, h=120 }) {
    if (pts.length < 2) return (
      <div style={{ width:w, height:h, borderRadius:14, background:'#f7fbfb', border:'1.5px dashed #c0d8d8', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontSize:12, color:'#b0c0c0' }}>Waiting for GPS…</p>
      </div>
    )
    const lats = pts.map(p=>p.lat), lngs = pts.map(p=>p.lng)
    const minLat=Math.min(...lats), maxLat=Math.max(...lats), minLng=Math.min(...lngs), maxLng=Math.max(...lngs)
    const span = Math.max(maxLat-minLat, maxLng-minLng, 1e-4)
    const pad = 10
    const toX = lng => pad + ((lng-minLng)/span) * (w-pad*2)
    const toY = lat => h - pad - ((lat-minLat)/span) * (h-pad*2)
    const d = pts.map((p,i) => `${i===0?'M':'L'}${toX(p.lng).toFixed(1)} ${toY(p.lat).toFixed(1)}`).join(' ')
    return (
      <svg width={w} height={h} style={{ borderRadius:14, overflow:'hidden', background:'#f0fafa' }}>
        <path d={d} fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={toX(pts[0].lng)} cy={toY(pts[0].lat)} r="5" fill="#00E676"/>
        <circle cx={toX(pts[pts.length-1].lng)} cy={toY(pts[pts.length-1].lat)} r="5" fill="#008080"/>
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#008080"/><stop offset="100%" stopColor="#00E676"/></linearGradient></defs>
      </svg>
    )
  }

  // ─── PHASE: SELECT ───────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', padding:'24px 16px 32px' }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
        <VisionLockup size={30} dark />
      </div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', marginBottom:6 }}>Start Activity</h1>
      <p style={{ fontSize:14, color:'#5a6a7a', marginBottom:24 }}>Choose your sport to begin tracking</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {SPORTS.map(s => (
          <button key={s.key} onClick={() => { setSport(s); setPhase('countdown') }} style={{ background:'#fff', borderRadius:20, padding:'24px 16px', textAlign:'center', border:'1.5px solid #e8f4f4', boxShadow:'0 2px 12px rgba(0,128,128,.08)', cursor:'pointer', transition:'transform .15s', fontFamily:'inherit' }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(.97)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
            <div style={{ width:56, height:56, borderRadius:16, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
              <SportIcon type={s.icon} size={28} color={s.color} />
            </div>
            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{s.key}</p>
            <div style={{ width:40, height:3, borderRadius:4, background:s.color, margin:'10px auto 0' }} />
          </button>
        ))}
      </div>
    </div>
  )

  // ─── PHASE: COUNTDOWN ────────────────────────────────────────────────────────
  if (phase === 'countdown') return (
    <div style={{ background:'linear-gradient(175deg,#002222 0%,#008080 100%)', minHeight:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <p style={{ fontSize:18, color:'rgba(255,255,255,.7)', fontWeight:600, letterSpacing:2 }}>GET READY</p>
      <div style={{ fontSize:120, fontWeight:900, color:'#fff', lineHeight:1, animation:'countDown .9s ease-in-out infinite alternate' }}>
        {count}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <SportIcon type={sport?.icon} size={32} color="#fff" />
        <p style={{ fontSize:20, color:'rgba(255,255,255,.8)', fontWeight:700 }}>{sport?.key}</p>
      </div>
      <button onClick={reset} style={{ marginTop:20, padding:'10px 28px', borderRadius:12, background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.25)', color:'rgba(255,255,255,.7)', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
    </div>
  )

  // ─── PHASE: TRACKING ─────────────────────────────────────────────────────────
  if (phase === 'tracking') return (
    <div style={{ background:'linear-gradient(175deg,#001a1a 0%,#004444 100%)', minHeight:'100%', padding:'52px 20px 40px', display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
        <SportIcon type={sport?.icon} size={24} color="#fff" />
        <p style={{ fontSize:18, color:'rgba(255,255,255,.7)', fontWeight:700, letterSpacing:1 }}>{sport?.key?.toUpperCase()}</p>
        {paused && <span style={{ fontSize:11, background:'rgba(255,200,0,.2)', color:'#ffd700', padding:'2px 8px', borderRadius:6, fontWeight:700 }}>PAUSED</span>}
      </div>

      <div style={{ textAlign:'center', marginBottom:28 }}>
        <p style={{ fontSize:64, fontWeight:900, color:'#fff', fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{fmtTime(elapsed)}</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginTop:4 }}>Duration</p>
      </div>

      <div style={{ display:'flex', gap:16, marginBottom:32 }}>
        {[
          { label:'Distance', val:`${(distM/1000).toFixed(2)} km` },
          { label:'Pace',     val: fmtPace(distM, elapsed) },
        ].map(({ label, val }) => (
          <div key={label} style={{ textAlign:'center', background:'rgba(255,255,255,.08)', borderRadius:18, padding:'16px 24px' }}>
            <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{val}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:4 }}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:32 }}>
        <RouteSVG pts={coords} w={280} h={140} />
      </div>

      <div style={{ display:'flex', gap:14 }}>
        <button onClick={togglePause} style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'2px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          {paused
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          }
        </button>
        <button onClick={handleStop} style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#ff4444,#cc0000)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 6px 24px rgba(255,68,68,.4)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
        </button>
        <div style={{ width:64, height:64 }} />
      </div>
    </div>
  )

  // ─── PHASE: SUMMARY ──────────────────────────────────────────────────────────
  if (phase === 'summary') return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', padding:'52px 16px 40px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ width:48, height:48, borderRadius:16, background: sport?.color || '#008080', display:'flex', alignItems:'center', justifyContent:'center' }}><SportIcon type={sport?.icon} size={24} color="#fff" /></div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e' }}>{sport?.key} Complete</h1>
          <p style={{ fontSize:12, color:'#9aaab8' }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <SummaryCard label="Duration"    val={fmtTime(elapsed)} />
        <SummaryCard label="Distance"    val={`${(distM/1000).toFixed(2)} km`} />
        <SummaryCard label="Avg Pace"    val={fmtPace(distM, elapsed)} />
      </div>

      <div style={{ background:'#fff', borderRadius:20, padding:'16px 14px', marginBottom:16, boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Route</p>
        <RouteSVG pts={coords} w={Math.min(window.innerWidth - 60, 360)} h={160} />
      </div>

      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e0eeee', padding:'12px 14px', marginBottom:16 }}>
        <p style={{ fontSize:12, color:'#9aaab8', fontWeight:600, marginBottom:10 }}>PHOTO (optional)</p>
        {imageUrl ? (
          <div style={{ position:'relative', borderRadius:12, overflow:'hidden', marginBottom:8 }}>
            <img src={imageUrl} alt="Activity" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }} />
            <button onClick={() => setImageUrl('')} style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:'50%', background:'rgba(0,0,0,.55)', border:'none', color:'#fff', cursor:'pointer', fontSize:14 }}>✕</button>
          </div>
        ) : (
          <label style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'24px 0', border:'1.5px dashed #c9e6e0', borderRadius:12, cursor:'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span style={{ fontSize:12, color:'#008080', fontWeight:600 }}>Add a photo</span>
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = ev => setImageUrl(ev.target.result)
              reader.readAsDataURL(file)
            }} />
          </label>
        )}
      </div>

      <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e0eeee', padding:'12px 14px', marginBottom:20 }}>
        <p style={{ fontSize:12, color:'#9aaab8', fontWeight:600, marginBottom:6 }}>NOTES (optional)</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How did it feel? Any highlights?" rows={3} style={{ width:'100%', background:'none', border:'none', outline:'none', fontSize:14, color:'#1a1a2e', fontFamily:'inherit', resize:'none', lineHeight:1.5 }} />
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={reset} style={{ flex:1, height:52, borderRadius:14, background:'#f0fafa', border:'1.5px solid #e0eeee', color:'#5a6a7a', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Discard</button>
        <button onClick={handleSave} disabled={saving} style={{ flex:2, height:52, borderRadius:14, background:'linear-gradient(135deg,#008080,#00E676)', color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,128,128,.3)', fontFamily:'inherit', opacity: saving ? .7 : 1 }}>
          {saving ? 'Saving…' : 'Save Activity'}
        </button>
      </div>
    </div>
  )

  return null
}
