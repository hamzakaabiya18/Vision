import { useState, useEffect, useCallback, useMemo } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SPORT_FILTERS      = ['All','Run','Ride','Hike','Walk']
const SPORT_LABEL        = { Run:'Running', Ride:'Cycling', Hike:'Hiking', Walk:'Walking' }
const DIFFICULTY_FILTERS = ['All','easy','moderate','hard']
const DIFFICULTY_COLOR   = { easy:'#00a050', moderate:'#d4880a', hard:'#e53935' }

const DEFAULT_LOCATION = { city:'Haifa', lat:32.7940, lng:34.9896 }

function isRealId(id) { return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id) }

function ExploreMap({ routes, userLoc, cityLabel, onSelectRoute, selectedId }) {
  const W = 600, H = 340, pad = 30

  const points = useMemo(() => {
    const pts = routes
      .map(r => r.routePoints?.[0])
      .filter(Boolean)
    if (userLoc) pts.push({ lat:userLoc.lat, lng:userLoc.lng, isUser:true })
    return pts
  }, [routes, userLoc])

  const bounds = useMemo(() => {
    if (points.length === 0) return { minLat:0, maxLat:1, minLng:0, maxLng:1 }
    const lats = points.map(p=>p.lat), lngs = points.map(p=>p.lng)
    return { minLat:Math.min(...lats), maxLat:Math.max(...lats), minLng:Math.min(...lngs), maxLng:Math.max(...lngs) }
  }, [points])

  const span = Math.max(bounds.maxLat-bounds.minLat, bounds.maxLng-bounds.minLng, 1e-3)
  const toX = lng => pad + ((lng-bounds.minLng)/span) * (W-pad*2)
  const toY = lat => H - pad - ((lat-bounds.minLat)/span) * (H-pad*2)

  return (
    <div style={{ position:'relative', height:H, borderRadius:20, overflow:'hidden', background:'linear-gradient(160deg,#eaf7f4 0%,#d9efe9 60%,#cfe9e1 100%)', border:'1px solid #d4ece8' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="gridLines" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0H40M0 0V40" stroke="#bfe0d8" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#gridLines)" opacity="0.5" />

        {routes.map(r => {
          const pt = r.routePoints?.[0]
          if (!pt) return null
          const x = toX(pt.lng), y = toY(pt.lat)
          const active = r._id === selectedId
          return (
            <g key={r._id} onClick={() => onSelectRoute(r)} style={{ cursor:'pointer' }}>
              <circle cx={x} cy={y} r={active ? 12 : 9} fill={active ? '#008080' : '#00a87a'} opacity={active ? 1 : 0.85} stroke="#fff" strokeWidth="2" />
              {active && <text x={x} y={y-16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0a2a2a">{r.title}</text>}
            </g>
          )
        })}

        {userLoc && (
          <g>
            <circle cx={toX(userLoc.lng)} cy={toY(userLoc.lat)} r="14" fill="rgba(0,128,128,.15)" />
            <circle cx={toX(userLoc.lng)} cy={toY(userLoc.lat)} r="6" fill="#008080" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      <div style={{ position:'absolute', top:14, left:14, background:'rgba(0,61,61,.85)', color:'#fff', fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20 }}>{cityLabel}</div>
      <div style={{ position:'absolute', bottom:14, right:14, background:'rgba(255,255,255,.9)', color:'#5a6a7a', fontSize:10, fontWeight:600, padding:'4px 10px', borderRadius:8 }}>{routes.length} routes nearby</div>
    </div>
  )
}

function RouteCard({ route, onOpen, onToggleSave, saving }) {
  const diffColor = DIFFICULTY_COLOR[route.difficulty] || '#9aaab8'
  return (
    <div style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
      <button onClick={() => onOpen(route)} style={{ display:'block', width:'100%', background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left' }}>
        <div style={{ position:'relative', height:130 }}>
          <img src={route.imageUrl} alt={route.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 55%)' }} />
          <div style={{ position:'absolute', top:10, left:10, background:'#008080', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>{SPORT_LABEL[route.sportType] || route.sportType}</div>
          <div style={{ position:'absolute', bottom:10, left:12, right:12 }}>
            <p style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{route.title}</p>
            <p style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{route.city}</p>
          </div>
        </div>
      </button>
      <div style={{ display:'flex', alignItems:'center', padding:'10px 14px' }}>
        <div style={{ flex:1, display:'flex', gap:14 }}>
          <span style={{ fontSize:12, color:'#5a6a7a', fontWeight:600 }}>{route.distanceKm} km</span>
          <span style={{ fontSize:12, color:'#5a6a7a', fontWeight:600 }}>{route.elevationGainM} m</span>
          <span style={{ fontSize:11, fontWeight:700, color:diffColor, textTransform:'capitalize' }}>{route.difficulty}</span>
        </div>
        <button onClick={() => onToggleSave(route)} disabled={saving} style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill={route.savedByMe ? '#008080' : 'none'} stroke="#008080" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function Explore({ user, showToast, isMobile = true, onOpenActivity, onOpenRoute }) {
  const [routes,    setRoutes]    = useState([])
  const [activities,setActivities]= useState([])
  const [loading,    setLoading]  = useState(true)
  const [sport,      setSport]    = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [cityQuery,  setCityQuery] = useState('')
  const [activeCity, setActiveCity]= useState(DEFAULT_LOCATION.city)
  const [userLoc,    setUserLoc]  = useState(null)
  const [selected,   setSelected] = useState(null)
  const [savingId,   setSavingId] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) { setUserLoc({ lat:DEFAULT_LOCATION.lat, lng:DEFAULT_LOCATION.lng }); return }
    navigator.geolocation.getCurrentPosition(
      pos => setUserLoc({ lat:pos.coords.latitude, lng:pos.coords.longitude }),
      () => setUserLoc({ lat:DEFAULT_LOCATION.lat, lng:DEFAULT_LOCATION.lng }),
      { timeout: 4000 }
    )
  }, [])

  const loadRoutes = useCallback(() => {
    const token = localStorage.getItem('vision_token')
    setLoading(true)
    const qs = new URLSearchParams()
    if (activeCity)              qs.set('city', activeCity)
    if (sport !== 'All')         qs.set('sport', sport)
    if (difficulty !== 'All')    qs.set('difficulty', difficulty)
    fetch(`${API}/routes?${qs}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => setRoutes(d?.routes || []))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false))
  }, [activeCity, sport, difficulty])

  useEffect(() => { loadRoutes() }, [loadRoutes])

  useEffect(() => {
    const token = localStorage.getItem('vision_token')
    fetch(`${API}/activities/search?limit=6`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.activities) setActivities(d.activities.sort((a,b)=>(b.likes?.length||0)-(a.likes?.length||0)).slice(0,4)) })
      .catch(() => {})
  }, [])

  function handleSearchCity(e) {
    e.preventDefault()
    setActiveCity(cityQuery.trim() || DEFAULT_LOCATION.city)
  }

  async function handleToggleSave(route) {
    setSavingId(route._id)
    setRoutes(rs => rs.map(r => r._id===route._id ? { ...r, savedByMe: !r.savedByMe, savesCount:(r.savesCount||0)+(r.savedByMe?-1:1) } : r))
    try {
      const token = localStorage.getItem('vision_token')
      const res = await fetch(`${API}/routes/${route._id}/save`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      showToast?.(data.saved ? 'Route saved' : 'Route removed from saved', 'success')
    } catch {
      showToast?.('Could not update saved route', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const filtersRow = (
    <>
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
        {SPORT_FILTERS.map(s => (
          <button key={s} onClick={() => setSport(s)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:`1.5px solid ${sport===s ? '#008080' : '#e0eeee'}`, background: sport===s ? '#e6f7f7' : '#fff', color: sport===s ? '#008080' : '#9aaab8', fontSize:12, fontWeight:600, cursor:'pointer' }}>{s === 'All' ? 'All' : SPORT_LABEL[s]}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        {DIFFICULTY_FILTERS.map(d => (
          <button key={d} onClick={() => setDifficulty(d)} style={{ flexShrink:0, padding:'5px 13px', borderRadius:20, border:`1.5px solid ${difficulty===d ? '#008080' : '#e0eeee'}`, background: difficulty===d ? '#e6f7f7' : '#fff', color: difficulty===d ? '#008080' : '#9aaab8', fontSize:11, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }}>{d}</button>
        ))}
      </div>
    </>
  )

  const searchBar = (
    <form onSubmit={handleSearchCity} style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:16, border:'1.5px solid #e0eeee', padding:'0 14px', height:48, gap:10, boxShadow:'0 2px 8px rgba(0,128,128,.06)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={cityQuery} onChange={e => setCityQuery(e.target.value)} placeholder="Search city or town…" style={{ flex:1, background:'none', fontSize:14, color:'#1a1a2e', border:'none', outline:'none', fontFamily:'inherit' }} />
      <button type="submit" style={{ background:'#008080', color:'#fff', border:'none', borderRadius:10, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Search</button>
    </form>
  )

  const routeList = (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
        <span style={{ fontSize:16, fontWeight:700, color:'#1a1a2e' }}>Recommended near {activeCity}</span>
        <span style={{ fontSize:12, color:'#9aaab8' }}>{routes.length} routes</span>
      </div>
      {loading && <div style={{ textAlign:'center', padding:'24px 0' }}><div style={{ width:30, height:30, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite', margin:'0 auto' }} /></div>}
      {!loading && routes.length === 0 && (
        <div style={{ textAlign:'center', padding:'36px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>No routes found for this city yet</p>
          <p style={{ fontSize:12, color:'#9aaab8' }}>Try Haifa, Carmel, Yokneam, Tel Aviv or Jerusalem.</p>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {routes.map(r => (
          <RouteCard key={r._id} route={r} onOpen={onOpenRoute} onToggleSave={handleToggleSave} saving={savingId===r._id} />
        ))}
      </div>
    </div>
  )

  const activitiesSection = activities.length > 0 && (
    <div style={{ marginTop:28 }}>
      <span style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', display:'block', marginBottom:14 }}>Popular Activities</span>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {activities.map(a => (
          <button key={a._id} onClick={() => isRealId(a._id) && onOpenActivity?.(a)} style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', borderRadius:14, padding:'10px 14px', border:'1px solid #e8f4f4', cursor:'pointer', textAlign:'left' }}>
            <img src={a.user?.avatarUrl} alt="" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'}} />
            <div style={{ flex:1, overflow:'hidden' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title}</p>
              <p style={{ fontSize:11, color:'#9aaab8' }}>{a.user?.fullName} · {a.sportType}</p>
            </div>
            <span style={{ fontSize:12, color:'#008080', fontWeight:700, flexShrink:0 }}>{a.likes?.length || 0} ♥</span>
          </button>
        ))}
      </div>
    </div>
  )

  const headerCopy = (
    <p style={{ fontSize:13, color:'#5a6a7a', lineHeight:1.5, margin:'4px 0 0' }}>
      Discover routes near you, save your favorites, and explore the athletic world around your city.
    </p>
  )

  if (!isMobile) {
    return (
      <div style={{ padding:'40px 24px 60px' }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e' }}>Explore</h1>
        {headerCopy}
        <div style={{ marginTop:20, marginBottom:18 }}>{searchBar}</div>
        <div style={{ marginBottom:20 }}>{filtersRow}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>
          <div>
            <ExploreMap routes={routes} userLoc={userLoc} cityLabel={activeCity} onSelectRoute={r=>{ setSelected(r._id); onOpenRoute(r) }} selectedId={selected} />
            {activitiesSection}
          </div>
          <div>{routeList}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:24 }}>
      <div style={{ padding:'52px 16px 0' }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e' }}>Explore</h1>
        {headerCopy}
      </div>
      <div style={{ padding:'16px 16px 0' }}>
        <ExploreMap routes={routes} userLoc={userLoc} cityLabel={activeCity} onSelectRoute={r=>{ setSelected(r._id); onOpenRoute(r) }} selectedId={selected} />
      </div>
      <div style={{ padding:'16px 16px 0' }}>{searchBar}</div>
      <div style={{ padding:'14px 16px 0' }}>{filtersRow}</div>
      <div style={{ padding:'18px 16px 0' }}>{routeList}</div>
      <div style={{ padding:'0 16px' }}>{activitiesSection}</div>
    </div>
  )
}
