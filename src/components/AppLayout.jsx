import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { VisionLockup } from './Brand'
import ActivityDetail from './ActivityDetail'
import RouteDetail    from './RouteDetail'
import Home        from './tabs/Home'
import Explore     from './tabs/Explore'
import AddActivity from './tabs/AddActivity'
import Messages    from './tabs/Messages'
import Profile     from './tabs/Profile'
import Stats       from './tabs/Stats'
import Groups, { GroupDetail } from './tabs/Groups'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
function isRealId(id) { return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id) }

function NavIcon({ name, active }) {
  const c = active ? '#008080' : '#9aaab8'
  const w = active ? 2.2 : 1.8
  const icons = {
    home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill={active ? 'rgba(0,128,128,0.12)' : 'none'}/><path d="M9 21V12h6v9"/></svg>,
    explore: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    messages: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={active ? 'rgba(0,128,128,0.10)' : 'none'}/></svg>,
    profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    stats: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    groups: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  }
  return icons[name] || null
}

const MOBILE_NAV = [
  { id:'home',     label:'Home'    },
  { id:'explore',  label:'Explore' },
  { id:'add',      label:''        },
  { id:'messages', label:'Chat'    },
  { id:'profile',  label:'Profile' },
]

const DESKTOP_NAV = [
  { id:'home',     label:'Home'     },
  { id:'explore',  label:'Explore'  },
  { id:'groups',   label:'Groups'   },
  { id:'messages', label:'Messages' },
  { id:'stats',    label:'Stats'    },
  { id:'profile',  label:'Profile'  },
]

function DesktopSidebar({ tab, onNav, unread, user, onLogout }) {
  const [logoutConfirm, setLogoutConfirm] = useState(false)

  function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); setTimeout(() => setLogoutConfirm(false), 3000); return }
    onLogout()
  }

  const avatar = user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'A')}&background=008080&color=fff&size=80`

  return (
    <aside style={{ width:240, flexShrink:0, height:'100vh', position:'sticky', top:0, background:'#fff', borderRight:'1px solid #e8f4f4', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'28px 20px 20px' }}>
        <VisionLockup size={32} dark />
      </div>

      <nav style={{ flex:1, padding:'0 10px', display:'flex', flexDirection:'column', gap:2 }}>
        {DESKTOP_NAV.map(({ id, label }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => onNav(id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:12, background: active ? 'rgba(0,128,128,0.1)' : 'transparent', border:'none', cursor:'pointer', width:'100%', textAlign:'left', transition:'background .15s' }}>
              <NavIcon name={id} active={active} />
              <span style={{ fontSize:14, fontWeight: active ? 700 : 500, color: active ? '#008080' : '#4a5e6a', fontFamily:'inherit' }}>{label}</span>
              {id === 'messages' && unread > 0 && (
                <span style={{ marginLeft:'auto', minWidth:18, height:18, borderRadius:9, background:'#e53935', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>{unread}</span>
              )}
            </button>
          )
        })}

        <button onClick={() => onNav('add')} style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:46, borderRadius:14, background:'linear-gradient(135deg,#007a7a,#00c864)', color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,128,128,.28)', fontFamily:'inherit' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Activity
        </button>
      </nav>

      <div style={{ padding:'14px 14px 20px', borderTop:'1px solid #e8f4f4' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <img src={avatar} alt={user?.fullName} style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName||'A')}&background=008080&color=fff` }} />
          <div style={{ flex:1, overflow:'hidden' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#0d1f1f', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.fullName || 'Athlete'}</p>
            <p style={{ fontSize:11, color:'#8a9baa' }}>@{user?.username || 'user'}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width:'100%', height:36, borderRadius:10, background: logoutConfirm ? 'rgba(229,57,53,.08)' : 'transparent', border:`1.5px solid ${logoutConfirm ? '#e53935' : '#e8f4f4'}`, color: logoutConfirm ? '#e53935' : '#8a9baa', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'inherit' }}>
          {logoutConfirm ? 'Tap again to confirm' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}

function Toast({ toast, mobile }) {
  const bg = toast.type === 'success' ? 'rgba(0,100,60,0.92)' : toast.type === 'error' ? 'rgba(180,30,30,0.92)' : 'rgba(10,40,40,0.9)'
  return (
    <div style={{ position:'fixed', bottom: mobile ? 96 : 24, left:'50%', transform:'translateX(-50%)', background:bg, color:'#fff', borderRadius:24, padding:'11px 22px', fontSize:13, fontWeight:500, whiteSpace:'nowrap', zIndex:9999, boxShadow:'0 4px 24px rgba(0,0,0,.22)', animation:'fadeIn .25s ease', pointerEvents:'none', fontFamily:'inherit' }}>
      {toast.msg}
    </div>
  )
}

export default function AppLayout() {
  const { currentUser, logout } = useAuth()
  const user = currentUser

  const [tab,         setTab]         = useState('home')
  const [unread,      setUnread]      = useState(2)
  const [toast,       setToast]       = useState(null)
  const [isMobile,    setIsMobile]    = useState(false)
  const [activeActivity, setActiveActivity] = useState(null)
  const [activeRoute,    setActiveRoute]    = useState(null)
  const [activeGroup,    setActiveGroup]    = useState(null)
  const [viewProfileId,  setViewProfileId]  = useState(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    const mq = window.matchMedia('(max-width: 768px)')
    mq.addEventListener('change', check)
    window.addEventListener('resize', check)
    return () => {
      mq.removeEventListener('change', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    if (!window.$) {
      const s = document.createElement('script')
      s.src = 'https://code.jquery.com/jquery-3.7.1.min.js'
      s.integrity = 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo='
      s.crossOrigin = 'anonymous'
      document.head.appendChild(s)
    }
  }, [])

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const go = useCallback((id) => {
    setTab(id)
    if (id === 'messages') setUnread(0)
  }, [])

  const handleLogout = useCallback(() => {
    showToast('Signed out successfully', 'success')
    setTimeout(() => logout(), 700)
  }, [logout, showToast])

  const handleOpenActivity = useCallback((item) => setActiveActivity(item), [])
  const handleOpenRoute    = useCallback((item) => setActiveRoute(item), [])
  const handleOpenGroup    = useCallback((item) => setActiveGroup(item), [])

  const handleJoinGroup = useCallback(async (groupId, isMember) => {
    const token = sessionStorage.getItem('vision_token')
    try {
      const url = isMember ? `${API}/groups/${groupId}/leave` : `${API}/groups/${groupId}/join`
      const res = await fetch(url, { method: isMember ? 'DELETE' : 'POST', headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      setActiveGroup(prev => {
        if (!prev || prev._id !== groupId) return prev
        const members = data.joined
          ? [...(prev.members||[]), { _id: user?._id, avatarUrl: user?.avatarUrl, fullName: user?.fullName }]
          : (prev.members||[]).filter(m => (m._id||m) !== (user?._id || user?.id))
        return { ...prev, members }
      })
      showToast(data.joined ? 'Joined group' : 'Left group', 'success')
    } catch { showToast('Could not update group membership', 'error') }
  }, [user, showToast])
  const handleOpenProfile  = useCallback((userId) => setViewProfileId(userId), [])
  const closeProfileView   = useCallback(() => setViewProfileId(null), [])

  const handleSaveRoute = useCallback(async (route) => {
    const token = sessionStorage.getItem('vision_token')
    try {
      const res = await fetch(`${API}/routes/${route._id}/save`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      showToast(data.saved ? 'Route saved' : 'Route removed from saved', 'success')
    } catch { showToast('Could not update saved route', 'error') }
  }, [showToast])

  const handleStartRoute = useCallback((route) => {
    setActiveRoute(null)
    showToast(`Let's go! Track "${route.title}" from Add Activity`, 'success')
    setTab('add')
  }, [showToast])

  const handleLike = useCallback(async (item) => {
    if (!isRealId(item._id)) return
    const token = sessionStorage.getItem('vision_token')
    try { await fetch(`${API}/activities/${item._id}/like`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } }) }
    catch {}
  }, [])

  const handlePostComment = useCallback(async (item, body) => {
    if (!isRealId(item._id)) { showToast('Comment posted (demo activity)'); return }
    const token = sessionStorage.getItem('vision_token')
    try {
      await fetch(`${API}/activities/${item._id}/comment`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ body }) })
      showToast('Comment posted', 'success')
    } catch { showToast('Could not post comment', 'error') }
  }, [showToast])

  function renderContent() {
    if (viewProfileId) {
      return <Profile user={user} viewUserId={viewProfileId} onBack={closeProfileView} onOpenActivity={handleOpenActivity} showToast={showToast} />
    }
    switch (tab) {
      case 'home':     return <Home        user={user} onNav={go} showToast={showToast} isMobile={isMobile} onOpenActivity={handleOpenActivity} onOpenProfile={handleOpenProfile} />
      case 'explore':  return <Explore     user={user} showToast={showToast} isMobile={isMobile} onOpenActivity={handleOpenActivity} onOpenRoute={handleOpenRoute} />
      case 'groups':   return <Groups      user={user} showToast={showToast} />
      case 'add':      return <AddActivity onDone={()=>setTab('home')} user={user} showToast={showToast} />
      case 'messages': return <Messages    user={user} showToast={showToast} isMobile={isMobile} onOpenProfile={handleOpenProfile} />
      case 'stats':    return <Stats       user={user} onBack={()=>setTab('profile')} isMobile={isMobile} onOpenProfile={handleOpenProfile} />
      case 'profile':  return <Profile     user={user} onLogout={handleLogout} onStats={()=>setTab('stats')} showToast={showToast} onOpenActivity={handleOpenActivity} onOpenRoute={handleOpenRoute} onOpenGroup={handleOpenGroup} />
      default:         return <Home        user={user} onNav={go} showToast={showToast} isMobile={isMobile} onOpenActivity={handleOpenActivity} onOpenProfile={handleOpenProfile} />
    }
  }

  const wideTab = tab === 'home' || tab === 'messages' || tab === 'explore'

  if (!isMobile) {
    return (
      <div style={{ display:'flex', height:'100vh', background:'#F0FAFA', overflow:'hidden' }}>
        <DesktopSidebar tab={tab} onNav={go} unread={unread} user={user} onLogout={handleLogout} />
        <main style={{ flex:1, overflowY: tab === 'messages' ? 'hidden' : 'auto', overflowX:'hidden' }} key={tab}>
          <div style={{ maxWidth: wideTab ? 1180 : 740, margin:'0 auto', minHeight:'100%', height: tab === 'messages' ? '100%' : 'auto', padding: wideTab ? 0 : '0 0 40px' }}>
            {renderContent()}
          </div>
        </main>
        {toast && <Toast toast={toast} />}
        {activeActivity && (
          <ActivityDetail
            activity={activeActivity}
            currentUserId={user?._id || user?.id}
            user={user}
            onClose={() => setActiveActivity(null)}
            onLike={handleLike}
            onPostComment={handlePostComment}
            onOpenProfile={(item) => { setActiveActivity(null); handleOpenProfile(item.user?._id || item.user?.id) }}
            showToast={showToast}
          />
        )}
        {activeRoute && (
          <RouteDetail
            route={activeRoute}
            currentUserId={user?._id || user?.id}
            onClose={() => setActiveRoute(null)}
            onSaveToggle={handleSaveRoute}
            onStartRoute={handleStartRoute}
            showToast={showToast}
          />
        )}
        {activeGroup && (
          <GroupDetail
            group={activeGroup}
            currentUserId={user?._id || user?.id}
            onClose={() => setActiveGroup(null)}
            onJoin={handleJoinGroup}
            showToast={showToast}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', maxWidth:430, margin:'0 auto', background:'#F0FAFA', position:'relative', overflow:'hidden', boxShadow:'0 0 80px rgba(0,0,0,0.08)' }}>
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch', animation:'fadeIn 0.2s ease' }} key={tab}>
        {renderContent()}
      </div>
      {toast && <Toast toast={toast} mobile />}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-around', background:'#fff', borderTop:'1px solid #e8f4f4', padding:'8px 8px env(safe-area-inset-bottom, 12px)', flexShrink:0, boxShadow:'0 -2px 16px rgba(0,128,128,0.06)', position:'relative' }}>
        {MOBILE_NAV.map(({ id, label }) => {
          if (id === 'add') {
            return (
              <div key="add" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, marginTop:-24 }}>
                <button onClick={() => go('add')} style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(145deg,#009898,#00c864)', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,128,128,0.38)', animation:'pulseGlow 2.4s ease-in-out infinite', flexShrink:0 }} aria-label="Add Activity">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span style={{ fontSize:10, color:'#9aaab8', marginTop:4 }}>Log</span>
              </div>
            )
          }
          const active = tab === id || (id === 'profile' && tab === 'stats')
          return (
            <button key={id} onClick={() => go(id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', padding:'6px 10px', borderRadius:12, cursor:'pointer', position:'relative', minWidth:48 }} aria-label={label}>
              <div style={{ position:'relative' }}>
                <NavIcon name={id} active={active} />
                {id === 'messages' && unread > 0 && <span style={{ position:'absolute', top:-5, right:-6, minWidth:16, height:16, borderRadius:8, background:'#e53935', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', border:'1.5px solid #fff' }}>{unread}</span>}
              </div>
              <span style={{ fontSize:10, color: active ? '#008080' : '#9aaab8', fontWeight: active ? 700 : 400 }}>{label}</span>
              {active && <span style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'#008080' }} />}
            </button>
          )
        })}
      </nav>
      {activeActivity && (
        <ActivityDetail
          activity={activeActivity}
          currentUserId={user?._id || user?.id}
          user={user}
          onClose={() => setActiveActivity(null)}
          onLike={handleLike}
          onPostComment={handlePostComment}
          onOpenProfile={(item) => { setActiveActivity(null); handleOpenProfile(item.user?._id || item.user?.id) }}
          showToast={showToast}
        />
      )}
      {activeRoute && (
        <RouteDetail
          route={activeRoute}
          currentUserId={user?._id || user?.id}
          onClose={() => setActiveRoute(null)}
          onSaveToggle={handleSaveRoute}
          onStartRoute={handleStartRoute}
          showToast={showToast}
        />
      )}
      {activeGroup && (
        <GroupDetail
          group={activeGroup}
          currentUserId={user?._id || user?.id}
          onClose={() => setActiveGroup(null)}
          onJoin={handleJoinGroup}
          showToast={showToast}
        />
      )}
    </div>
  )
}
