import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const FILTERS = ['All','Running','Cycling','Hiking','Swimming','Triathlon']

const ROUTES = [
  { id:1, tag:'Popular', name:'Peak Horizon Loop',  type:'Running', distance:'12.4 km', elevation:'480m', img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80', rating:4.9, reviews:1240, saved:false },
  { id:2, tag:'New',     name:'Coastal Sprint',      type:'Cycling', distance:'28.6 km', elevation:'120m', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80', rating:4.7, reviews:834,  saved:true  },
  { id:3, tag:'Expert',  name:'Timberline Ascent',   type:'Hiking',  distance:'8.7 km',  elevation:'890m', img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80', rating:4.8, reviews:621,  saved:false },
  { id:4, tag:'Popular', name:'Lake Shore Loop',     type:'Running', distance:'9.2 km',  elevation:'55m',  img:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80', rating:4.6, reviews:990,  saved:false },
]

const CLUBS = [
  { id:1, name:'Alpha Stride',  members:'12k', sport:'Endurance', desc:'Elite endurance training for competitive marathon runners and triathletes.', avatar:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80', joined:false },
  { id:2, name:'Trail Runners', members:'8.4k',sport:'Trail',     desc:'Weekend trail adventures and mountain exploration across all skill levels.', avatar:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=80&q=80', joined:true  },
  { id:3, name:'Velocity Velo', members:'5.1k',sport:'Cycling',   desc:'Road & gravel cycling club for serious riders. Weekly group rides every Sunday.', avatar:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80', joined:false },
]

const TAG_COLOR = { Popular:{ bg:'#00E676', text:'#003300' }, New:{ bg:'#2196f3', text:'#fff' }, Expert:{ bg:'#ff5722', text:'#fff' } }

export default function Explore() {
  const [filter,      setFilter]      = useState('All')
  const [query,       setQuery]       = useState('')
  const [routes,      setRoutes]      = useState(ROUTES)
  const [clubs,       setClubs]       = useState(CLUBS)
  const [users,       setUsers]       = useState([])
  const [loadingUsers,setLoadingUsers]= useState(true)
  const [followMap,   setFollowMap]   = useState({})

  useEffect(() => {
    fetch(`${API}/users?limit=22`)
      .then(r => r.json())
      .then(data => {
        const list = data.users || []
        setUsers(list)
        const init = {}
        list.forEach(u => { init[u.id] = (u.id === 2 || u.id === 3) })
        setFollowMap(init)
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [])

  const toggleSave   = id => setRoutes(r => r.map(x => x.id===id ? {...x, saved:!x.saved} : x))
  const toggleJoin   = id => setClubs(c => c.map(x => x.id===id ? {...x, joined:!x.joined} : x))
  const toggleFollow = id => setFollowMap(m => ({...m, [id]:!m[id]}))

  const shownRoutes = routes.filter(r => (filter==='All' || r.type===filter) && (!query || r.name.toLowerCase().includes(query.toLowerCase())))
  const shownUsers  = users.filter(u  => !query || u.name?.toLowerCase().includes(query.toLowerCase()) || u.username?.toLowerCase().includes(query.toLowerCase()))

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:24 }}>
      <div style={{ padding:'56px 16px 16px' }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', marginBottom:16 }}>Explore</h1>
        <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:16, border:'1.5px solid #e0eeee', padding:'0 14px', height:48, gap:10, boxShadow:'0 2px 8px rgba(0,128,128,.06)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Explore routes, clubs, or athletes" style={{ flex:1, background:'none', fontSize:14, color:'#1a1a2e', border:'none', outline:'none', fontFamily:'inherit' }} />
        </div>
      </div>

      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingLeft:16, paddingRight:16, paddingBottom:16, scrollbarWidth:'none' }}>
        {FILTERS.map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 16px', borderRadius:20, border:`1.5px solid ${filter===f ? '#008080' : '#e0eeee'}`, background: filter===f ? '#008080' : '#fff', color: filter===f ? '#fff' : '#5a6a7a', fontSize:13, fontWeight:600, flexShrink:0, transition:'all .2s', fontFamily:'inherit', cursor:'pointer' }}>{f}</button>)}
      </div>

      <div style={{ padding:'0 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'#1a1a2e' }}>Trending Routes</span>
          <button style={{ fontSize:12, color:'#008080', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {shownRoutes.map(route => {
            const tag = TAG_COLOR[route.tag] || TAG_COLOR.Popular
            return (
              <div key={route.id} style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 16px rgba(0,128,128,.1)', border:'1px solid #e8f4f4' }}>
                <div style={{ position:'relative', height:190 }}>
                  <img src={route.img} alt={route.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.6) 0%,transparent 55%)' }} />
                  <div style={{ position:'absolute', top:12, left:12 }}>
                    <span style={{ background:tag.bg, color:tag.text, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, letterSpacing:.3 }}>{route.tag}</span>
                  </div>
                  <button onClick={() => toggleSave(route.id)} style={{ position:'absolute', top:10, right:12, background:'rgba(255,255,255,.18)', backdropFilter:'blur(8px)', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={route.saved ? '#fff' : 'none'} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
                    <p style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:6 }}>{route.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,.9)', fontWeight:500 }}>{route.distance}</span>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>{route.elevation} gain</span>
                      <span style={{ fontSize:12, color:'#fff', fontWeight:700, marginLeft:'auto' }}>★ {route.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding:'24px 16px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontSize:17, fontWeight:700, color:'#1a1a2e' }}>Recommended Clubs</span>
          <button style={{ fontSize:12, color:'#008080', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>See all</button>
        </div>
        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {clubs.map(club => (
            <div key={club.id} style={{ background:'#fff', borderRadius:18, padding:16, minWidth:210, boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <img src={club.avatar} alt={club.name} style={{ width:44, height:44, borderRadius:14, objectFit:'cover' }} />
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{club.name}</p>
                  <p style={{ fontSize:11, color:'#9aaab8' }}>{club.members} Members</p>
                </div>
              </div>
              <p style={{ fontSize:12, color:'#5a6a7a', lineHeight:1.5, marginBottom:12 }}>{club.desc}</p>
              <button onClick={() => toggleJoin(club.id)} style={{ width:'100%', height:36, borderRadius:10, background: club.joined ? 'transparent' : 'linear-gradient(135deg,#008080,#00c853)', border: club.joined ? '1.5px solid #e0eeee' : 'none', color: club.joined ? '#9aaab8' : '#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {club.joined ? 'Joined' : 'Join Club'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {shownUsers.length > 0 && (
        <div style={{ padding:'24px 16px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontSize:17, fontWeight:700, color:'#1a1a2e' }}>Top Athletes</span>
            <span style={{ fontSize:12, color:'#9aaab8' }}>{shownUsers.length} athletes</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {shownUsers.map(u => (
              <div key={u.id || u._id} style={{ background:'#fff', borderRadius:16, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
                <img src={u.avatar || u.avatarUrl} alt={u.name || u.fullName} style={{ width:50, height:50, borderRadius:'50%', objectFit:'cover', border:'2px solid #e8f4f4' }} onError={e => { e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{u.name || u.fullName}</p>
                  <p style={{ fontSize:11, color:'#9aaab8' }}>@{u.username}</p>
                </div>
                <button onClick={() => toggleFollow(u.id || u._id)} style={{ height:30, padding:'0 14px', borderRadius:8, background: followMap[u.id||u._id] ? 'transparent' : 'linear-gradient(135deg,#008080,#00c853)', border: followMap[u.id||u._id] ? '1.5px solid #e0eeee' : 'none', color: followMap[u.id||u._id] ? '#9aaab8' : '#fff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  {followMap[u.id||u._id] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingUsers && shownUsers.length === 0 && (
        <div style={{ padding:'24px 16px' }}>
          <p style={{ fontSize:14, color:'#9aaab8', textAlign:'center' }}>Loading athletes...</p>
        </div>
      )}
    </div>
  )
}
