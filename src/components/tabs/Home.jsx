import { useState, useEffect, useCallback } from 'react'
import { VisionMark } from '../Brand'
import { ajax } from '../../lib/ajaxClient'

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

const SEED_FEED = [
  { _id:'s1', isSeed:true, user:{ username:'marcus_runs', fullName:'Marcus Chen', avatarUrl:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80', verified:true }, sportType:'Run', title:'Morning Summit Chase', distanceKm:14.2, durationMinutes:68, avgPace:'4:50', elevationGainM:312, location:'Carmel Valley, CA', imageUrl:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', notes:'Felt strong on the final climb — legs are coming around nicely this block.', likes:['a','b','c','d'], comments:[], createdAt: new Date(Date.now()-7200000).toISOString() },
  { _id:'s2', isSeed:true, user:{ username:'sara_cycles', fullName:'Sara Valeri', avatarUrl:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', verified:true }, sportType:'Ride', title:'Pacific Coast Highway Blast', distanceKm:48.6, durationMinutes:112, avgSpeed:26.4, elevationGainM:180, location:'Malibu, CA', imageUrl:'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80', notes:'Tailwind the whole way back. Lungs are still recovering.', likes:['a','b','c','d','e','f'], comments:[], createdAt: new Date(Date.now()-18000000).toISOString() },
  { _id:'s3', isSeed:true, user:{ username:'leo_trails', fullName:'Leo Brooks', avatarUrl:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80', verified:false }, sportType:'Hike', title:'Timberline Ascent', distanceKm:8.7, durationMinutes:202, elevationGainM:890, location:'Mount Hood, OR', imageUrl:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80', notes:'Snow line was higher than expected — brought the wrong boots.', likes:['a','b','c','d','e','f','g','h'], comments:[], createdAt: new Date(Date.now()-86400000).toISOString() },
  { _id:'s4', isSeed:true, user:{ username:'nadia_tri', fullName:'Nadia Kowalski', avatarUrl:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', verified:true }, sportType:'Swim', title:'Open Water 3K — Lake Geneva', distanceKm:3, durationMinutes:54, avgPace:'18:00', elevationGainM:0, location:'Lake Geneva, CH', imageUrl:'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80', notes:'Water was choppy past the first buoy but sighting held up.', likes:['a','b','c'], comments:[], createdAt: new Date(Date.now()-172800000).toISOString() },
  { _id:'s5', isSeed:true, user:{ username:'james_lifts', fullName:'James Okafor', avatarUrl:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', verified:false }, sportType:'Gym', title:'Heavy Lower Body Day', distanceKm:0, durationMinutes:75, elevationGainM:0, location:'Iron Yard Gym', imageUrl:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80', notes:'New squat PR. Hips felt locked in all session.', likes:['a','b'], comments:[], createdAt: new Date(Date.now()-262800000).toISOString() },
]

function isRealId(id) {
  return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)
}

function getGreeting(date = new Date()) {
  const h = date.getHours()
  if (h >= 5  && h < 12) return 'Good morning'
  if (h >= 12 && h < 18) return 'Welcome back'
  if (h >= 18 && h < 24) return 'Good evening'
  return 'Welcome back'
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function fmtDuration(mins) {
  const h = Math.floor(mins/60), m = mins%60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function FeedCard({ item, currentUserId, onLike, onComment, onShare, onOpen, onOpenProfile }) {
  const cfg   = SPORT_CONFIG[item.sportType] || SPORT_CONFIG.Run
  const liked = item.likes?.includes(currentUserId)
  const userId = item.user?._id || item.user?.id
  return (
    <article style={{ background:'#fff', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,128,128,0.08)', border:'1px solid #e8f4f4' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 0' }}>
        <button onClick={() => onOpenProfile(item)} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0, textAlign:'left' }}>
          <img src={item.user.avatarUrl} alt={item.user.fullName} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover', border:'2px solid #e8f4f4' }} onError={e=>{ e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' }} />
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'#1a1a2e' }}>{item.user.fullName}</span>
              {item.user.verified && <svg width="13" height="13" viewBox="0 0 24 24" fill="#008080"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:1 }}>
              <span style={{ fontSize:11, color: cfg.color, fontWeight:600 }}>{cfg.label}</span>
              <span style={{ fontSize:11, color:'#9aaab8' }}>· {timeAgo(item.createdAt)}</span>
              {item.location && <span style={{ fontSize:11, color:'#9aaab8' }}>· {item.location}</span>}
            </div>
          </div>
        </button>
      </div>

      <button onClick={() => onOpen(item)} style={{ display:'block', width:'100%', background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left' }}>
        <div style={{ padding:'8px 16px 10px' }}>
          <p style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', lineHeight:1.3 }}>{item.title}</p>
        </div>

        {item.imageUrl && (
          <div style={{ position:'relative', height:200, background:'#e0eee8', overflow:'hidden' }}>
            <img src={item.imageUrl} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none' }} />
            <svg style={{ position:'absolute', bottom:10, right:10, filter:'drop-shadow(0 2px 6px rgba(0,0,0,.45))' }} width="72" height="52" viewBox="0 0 72 52">
              <path d="M8 44 Q18 18 32 28 Q46 38 60 8" stroke="#00E676" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="5 2.5"/>
              <circle cx="8" cy="44" r="4" fill="#00E676"/><circle cx="60" cy="8" r="4" fill="#008080"/>
            </svg>
            <div style={{ position:'absolute', top:10, left:10, background: cfg.color, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, letterSpacing:.4 }}>{cfg.label.toUpperCase()}</div>
          </div>
        )}

        <div style={{ display:'flex', padding:'12px 0', borderTop:'1px solid #e8f4f4', borderBottom:'1px solid #e8f4f4' }}>
          {[
            { label:'Distance', val: item.distanceKm ? `${item.distanceKm} km` : '--' },
            { label:'Duration', val: item.durationMinutes ? fmtDuration(item.durationMinutes) : '--' },
            { label: item.sportType==='Ride' ? 'Speed' : 'Pace', val: item.sportType==='Ride' ? (item.avgSpeed ? `${item.avgSpeed} km/h` : '--') : (item.avgPace ? `${item.avgPace}/km` : '--') },
            { label:'Elevation', val: item.elevationGainM ? `${item.elevationGainM} m` : '--' },
          ].map((st, i) => (
            <div key={i} style={{ flex:1, textAlign:'center', borderRight: i<3 ? '1px solid #e8f4f4' : 'none' }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{st.val}</p>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:2 }}>{st.label}</p>
            </div>
          ))}
        </div>
      </button>

      <div style={{ display:'flex', padding:'10px 16px 14px', gap:18, alignItems:'center' }}>
        <button onClick={() => onLike(item)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:'4px 0' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill={liked?'#e53935':'none'} stroke={liked?'#e53935':'#5a6a7a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span style={{ fontSize:13, color: liked?'#e53935':'#5a6a7a', fontWeight:500 }}>{item.likes?.length || 0}</span>
        </button>
        <button onClick={() => onComment(item)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:'4px 0' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span style={{ fontSize:13, color:'#5a6a7a', fontWeight:500 }}>{item.comments?.length || 0}</span>
        </button>
        <button onClick={() => onShare(item)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:'4px 0', marginLeft:'auto' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    </article>
  )
}

function CommentSheet({ item, onClose, onPost, showToast }) {
  const [text,  setText]  = useState('')
  const [posting, setPosting] = useState(false)
  const comments = item.comments || []

  async function submit() {
    const body = text.trim()
    if (!body) return
    setPosting(true)
    await onPost(item, body)
    setPosting(false)
    setText('')
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:430, background:'#fff', borderRadius:'20px 20px 0 0', padding:'20px 16px 36px', maxHeight:'70vh', display:'flex', flexDirection:'column' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'#ddd', margin:'0 auto 18px' }} />
        <p style={{ fontSize:16, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Comments ({comments.length})</p>
        <div style={{ flex:1, overflowY:'auto', marginBottom:14, display:'flex', flexDirection:'column', gap:12 }}>
          {comments.length === 0 && <p style={{ fontSize:14, color:'#9aaab8', textAlign:'center', padding:'24px 0' }}>No comments yet — be the first!</p>}
          {comments.map((c, i) => (
            <div key={c._id || i} style={{ display:'flex', gap:10 }}>
              <img src={c.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.fullName||'A')}&background=008080&color=fff`} alt="" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{c.user?.fullName || 'Athlete'}</p>
                <p style={{ fontSize:13, color:'#4a5e6a', lineHeight:1.4 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submit() }} placeholder="Add a comment…" style={{ flex:1, height:44, borderRadius:22, border:'1.5px solid #e8f4f4', padding:'0 16px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
          <button onClick={submit} disabled={!text.trim() || posting} style={{ height:44, paddingInline:18, borderRadius:22, background:'#008080', color:'#fff', border:'none', fontWeight:600, fontSize:14, cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: posting ? .7 : 1 }}>
            {posting ? '…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AboutVisionCard() {
  return (
    <div style={{ background:'linear-gradient(150deg,#003d3d,#007a7a)', borderRadius:20, padding:'20px 20px 18px', color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <VisionMark size={24} />
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:'.04em' }}>ABOUT VISION</span>
      </div>
      <p style={{ fontSize:13, color:'rgba(255,255,255,.82)', lineHeight:1.6, margin:0 }}>
        VISION is an athletic intelligence social platform that connects athletes, tracks performance, and turns every activity into visual insight.
      </p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,.15)' }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,.55)' }}>Founder &amp; Executive Director</span>
        <span style={{ fontSize:13, fontWeight:700, color:'#00E676' }}>Hamza</span>
      </div>
    </div>
  )
}

function PerformanceSummary({ user, weeklyFilter, setWeekFilter }) {
  const totalKm    = user?.totalKm ?? 0
  const activities = user?.activitiesCount ?? user?.activities ?? 0
  const hasData    = totalKm > 0 || activities > 0
  const weekBars = [{ day:'M',h:55 },{ day:'T',h:80 },{ day:'W',h:38 },{ day:'T',h:92 },{ day:'F',h:68 },{ day:'S',h:28 },{ day:'S',h:50 }]

  return (
    <div style={{ borderRadius:20, background:'linear-gradient(145deg,#005f5f 0%,#007a7a 55%,#009a6a 100%)', padding:'20px 20px 18px', boxShadow:'0 6px 28px rgba(0,128,128,0.28)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', marginBottom:4 }}>
        {[
          { val: totalKm ? totalKm.toFixed(1) : '0', label:'DISTANCE', unit:'km' },
          { val: activities, label:'ACTIVITIES', unit:'total' },
          { val: hasData ? `${Math.round(totalKm*70)}` : '0', label:'CALORIES', unit:'kcal' },
        ].map(({ val, label, unit }, i) => (
          <div key={i} style={{ flex:1, textAlign:'center' }}>
            <p style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{val}</p>
            <p style={{ fontSize:9, color:'rgba(255,255,255,.65)', fontWeight:600, letterSpacing:'.06em', margin:'3px 0 1px' }}>{label}</p>
            <p style={{ fontSize:10, color:'#00E676', fontWeight:600 }}>{unit}</p>
          </div>
        ))}
      </div>

      {hasData ? (
        <div style={{ display:'flex', alignItems:'center', gap:6, margin:'10px 0 12px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <span style={{ fontSize:12, color:'#00E676', fontWeight:600 }}>Keep the streak going</span>
        </div>
      ) : (
        <p style={{ fontSize:12, color:'rgba(255,255,255,.75)', margin:'10px 0 12px', lineHeight:1.5 }}>
          No activities logged yet — tap "Log Run" below to start your first one.
        </p>
      )}

      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:10, color:'rgba(255,255,255,.55)', fontWeight:600, letterSpacing:'.06em' }}>WEEKLY ACTIVITY</span>
          <div style={{ display:'flex', gap:4 }}>
            {['Daily','Weekly'].map(l => <button key={l} onClick={() => setWeekFilter(l)} style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:8, background: weeklyFilter===l ? 'rgba(255,255,255,.2)' : 'transparent', color:'rgba(255,255,255,.75)', border:'none', cursor:'pointer' }}>{l}</button>)}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:44 }}>
          {weekBars.map(({ day, h }, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:'100%', height:`${h}%`, borderRadius:3, background: i===3 ? 'linear-gradient(180deg,#00E676,rgba(0,230,118,.4))' : 'rgba(255,255,255,.2)', minHeight:3 }} />
              <span style={{ fontSize:9, color:'rgba(255,255,255,.6)', fontWeight:600 }}>{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home({ user, onNav, showToast, isMobile = true, onOpenActivity, onOpenProfile }) {
  const [feed,         setFeed]        = useState(SEED_FEED)
  const [commentItem,  setCommentItem] = useState(null)
  const [loadingFeed,  setLoadingFeed] = useState(true)
  const [weeklyFilter, setWeekFilter]  = useState('Weekly')
  const currentUserId = user?._id || user?.id || 'me'

  const loadFeed = useCallback(() => {
    const token = localStorage.getItem('vision_token')
    if (!token) { setLoadingFeed(false); return }
    setLoadingFeed(true)
    fetch(`${API}/activities/feed?limit=20`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.activities?.length) setFeed(d.activities) })
      .catch(() => {})
      .finally(() => setLoadingFeed(false))
  }, [])

  useEffect(() => { loadFeed() }, [loadFeed])

  const handleLike = useCallback(async (item) => {
    const liked = item.likes?.includes(currentUserId)
    setFeed(f => f.map(p => p._id===item._id
      ? { ...p, likes: liked ? (p.likes||[]).filter(x=>x!==currentUserId) : [...(p.likes||[]), currentUserId] }
      : p))
    if (!isRealId(item._id)) return
    try { await ajax.likeActivity(item._id) }
    catch {
      setFeed(f => f.map(p => p._id===item._id
        ? { ...p, likes: liked ? [...(p.likes||[]), currentUserId] : (p.likes||[]).filter(x=>x!==currentUserId) }
        : p))
    }
  }, [currentUserId])

  const handlePostComment = useCallback(async (item, body) => {
    if (!isRealId(item._id)) {
      const fake = { _id:`local_${Date.now()}`, body, user:{ fullName: user?.fullName, avatarUrl: user?.avatarUrl } }
      setFeed(f => f.map(p => p._id===item._id ? { ...p, comments:[...(p.comments||[]), fake] } : p))
      setCommentItem(prev => prev ? { ...prev, comments:[...(prev.comments||[]), fake] } : prev)
      showToast('Comment posted (demo activity)')
      return
    }
    try {
      const comment = await ajax.postComment(item._id, { body })
      setFeed(f => f.map(p => p._id===item._id ? { ...p, comments:[...(p.comments||[]), comment] } : p))
      setCommentItem(prev => prev ? { ...prev, comments:[...(prev.comments||[]), comment] } : prev)
      showToast('Comment posted', 'success')
    } catch {
      showToast('Could not post comment', 'error')
    }
  }, [user, showToast])

  const handleShare = useCallback((item) => { onOpenActivity ? onOpenActivity(item, true) : showToast('Share unavailable') }, [onOpenActivity, showToast])

  const handleOpenProfile = useCallback((item) => {
    const id = item.user?._id || item.user?.id
    if (id && isRealId(id)) onOpenProfile?.(id)
    else showToast('Demo athlete — profile not available')
  }, [onOpenProfile, showToast])

  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Athlete'
  const greeting = getGreeting()

  const Header = (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: isMobile ? '52px 16px 14px' : '0 0 18px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <VisionMark size={30} />
        <div>
          <p style={{ fontSize:11, color:'#9aaab8', fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase' }}>{greeting}</p>
          <p style={{ fontSize:17, fontWeight:700, color:'#1a1a2e', lineHeight:1.2 }}>{firstName}</p>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={() => showToast('No new notifications')} style={{ width:38, height:38, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,128,128,.08)', position:'relative', border:'none', cursor:'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a6a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position:'absolute', top:8, right:8, width:7, height:7, borderRadius:'50%', background:'#00E676', border:'1.5px solid #fff' }} />
        </button>
        {isMobile && (
          <button onClick={() => onNav?.('profile')} style={{ border:'none', background:'none', padding:0, cursor:'pointer' }}>
            <img src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=008080&color=fff&size=80`} alt="Profile" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'2px solid #008080' }} onError={e=>{ e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=008080&color=fff&size=80` }} />
          </button>
        )}
      </div>
    </div>
  )

  const QuickStart = (
    <div style={{ padding: isMobile ? '20px 16px 8px' : '18px 0 0', display:'flex', gap:10 }}>
      {[{ label:'Log Run', color:'#008080' },{ label:'Log Ride', color:'#0077aa' },{ label:'Log Hike', color:'#5a7a3a' }].map(({ label, color }) => (
        <button key={label} onClick={() => onNav?.('add')} style={{ flex:1, height:40, borderRadius:10, background:`${color}14`, border:`1px solid ${color}30`, color, fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {label}
        </button>
      ))}
    </div>
  )

  const FeedSection = (
    <div style={{ padding: isMobile ? '8px 16px 0' : '24px 0 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:16, fontWeight:700, color:'#1a1a2e' }}>Activity Feed</span>
        <button onClick={() => onNav?.('explore')} style={{ fontSize:12, color:'#008080', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Explore</button>
      </div>
      {loadingFeed && (
        <div style={{ textAlign:'center', padding:'24px 0' }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite', margin:'0 auto' }} /></div>
      )}
      {!loadingFeed && feed.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 16px', background:'#fff', borderRadius:20, border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:15, fontWeight:700, color:'#1a1a2e', marginBottom:6 }}>No activities yet</p>
          <p style={{ fontSize:13, color:'#9aaab8' }}>Be the first to log one and it'll show up here.</p>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {feed.map(post => (
          <FeedCard key={post._id} item={post} currentUserId={currentUserId} onLike={handleLike} onComment={setCommentItem} onShare={handleShare} onOpen={onOpenActivity} onOpenProfile={handleOpenProfile} />
        ))}
      </div>
      {isMobile && <div style={{ marginTop:20 }}><AboutVisionCard /></div>}
    </div>
  )

  if (!isMobile) {
    return (
      <div style={{ padding:'40px 24px 40px', display:'grid', gridTemplateColumns:'1fr 300px', gap:28, alignItems:'start' }}>
        <div>
          {Header}
          {QuickStart}
          {FeedSection}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:18, position:'sticky', top:24 }}>
          <PerformanceSummary user={user} weeklyFilter={weeklyFilter} setWeekFilter={setWeekFilter} />
          <AboutVisionCard />
        </div>
        {commentItem && <CommentSheet item={commentItem} onClose={() => setCommentItem(null)} onPost={handlePostComment} showToast={showToast} />}
      </div>
    )
  }

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:32 }}>
      {Header}
      <div style={{ margin:'0 16px' }}>
        <PerformanceSummary user={user} weeklyFilter={weeklyFilter} setWeekFilter={setWeekFilter} />
      </div>
      {QuickStart}
      {FeedSection}
      {commentItem && <CommentSheet item={commentItem} onClose={() => setCommentItem(null)} onPost={handlePostComment} showToast={showToast} />}
    </div>
  )
}
