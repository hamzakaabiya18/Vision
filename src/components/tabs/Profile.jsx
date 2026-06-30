import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Settings from '../Settings'
import { compressImageFile } from '../../lib/imageUtils'
import { ajax } from '../../lib/ajaxClient'
import Avatar from '../Avatar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function buildBadges({ activitiesCount, totalDistanceKm, followingCount, savedRoutesCount, groupsCount }) {
  return [
    { label:'First Activity',      desc:'Log your first activity',           unlocked: activitiesCount >= 1 },
    { label:'10 KM Club',          desc:'Reach 10 km total distance',        unlocked: totalDistanceKm >= 10 },
    { label:'Consistency Starter', desc:'Log 3 or more activities',          unlocked: activitiesCount >= 3 },
    { label:'Route Explorer',      desc:'Save a route from Explore',         unlocked: savedRoutesCount >= 1 },
    { label:'Social Athlete',      desc:'Follow another athlete',            unlocked: followingCount >= 1 },
    { label:'Group Member',        desc:'Join or create a VISION group',     unlocked: groupsCount >= 1 },
    { label:'VISION Pioneer',      desc:'Welcome to VISION Athletic Intelligence', unlocked: true },
  ]
}

function TypeBadge({ type }) {
  const map = {
    Run:{ bg:'rgba(0,128,128,.1)', color:'#008080', label:'Running' },
    Ride:{ bg:'rgba(0,168,122,.1)', color:'#00a87a', label:'Cycling' },
    Gym:{ bg:'rgba(212,86,10,.1)', color:'#d4560a', label:'Gym' },
    Hike:{ bg:'rgba(90,122,58,.1)', color:'#5a7a3a', label:'Hiking' },
    Swim:{ bg:'rgba(0,85,170,.1)', color:'#0055aa', label:'Swimming' },
    Yoga:{ bg:'rgba(123,78,160,.1)', color:'#7b4ea0', label:'Yoga' },
  }
  const { bg, color, label } = map[type] || map.Run
  return <span style={{ background:bg, color, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, letterSpacing:.3 }}>{label}</span>
}

export default function Profile({ user: propUser, onLogout, onStats, showToast, viewUserId, onBack, onOpenActivity, onOpenRoute, onOpenGroup, initialTab, openSettings: openSettingsOnMount }) {
  const { currentUser, updateUser } = useAuth()
  const isOtherUser = Boolean(viewUserId) && viewUserId !== (currentUser?._id || currentUser?.id)

  const [otherUser,     setOtherUser]    = useState(null)
  const [otherLoading,  setOtherLoading] = useState(isOtherUser)
  const [otherActs,     setOtherActs]    = useState([])
  const [isFollowingThem, setFollowing]  = useState(false)
  const [savedRoutes,   setSavedRoutes]  = useState([])
  const [savedLoading,  setSavedLoading] = useState(false)
  const [myGroups,      setMyGroups]     = useState([])
  const [groupsLoading, setGroupsLoading]= useState(false)
  const [myActs,        setMyActs]       = useState([])
  const [myActsLoading, setMyActsLoading]= useState(false)
  const [showSettings,  setShowSettings] = useState(false)

  useEffect(() => {
    if (openSettingsOnMount) setShowSettings(true)
  }, [openSettingsOnMount])

  useEffect(() => {
    if (isOtherUser) return
    const token = sessionStorage.getItem('vision_token')
    const myId  = currentUser?._id || currentUser?.id
    if (!myId) return
    setMyActsLoading(true)
    fetch(`${API}/users/${myId}/activities`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.activities) setMyActs(d.activities) })
      .catch(() => {})
      .finally(() => setMyActsLoading(false))
  }, [isOtherUser, currentUser])

  useEffect(() => {
    if (isOtherUser) return
    const token = sessionStorage.getItem('vision_token')
    setSavedLoading(true)
    fetch(`${API}/routes/saved`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.routes) setSavedRoutes(d.routes) })
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }, [isOtherUser])

  useEffect(() => {
    if (isOtherUser) return
    const token = sessionStorage.getItem('vision_token')
    const myId  = currentUser?._id || currentUser?.id
    setGroupsLoading(true)
    fetch(`${API}/groups`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const mine = (d?.groups || []).filter(g =>
          (g.admin?._id || g.admin) === myId || g.members?.some(m => (m._id || m) === myId)
        )
        setMyGroups(mine)
      })
      .catch(() => {})
      .finally(() => setGroupsLoading(false))
  }, [isOtherUser, currentUser])

  async function unsaveRoute(routeId) {
    setSavedRoutes(rs => rs.filter(r => r._id !== routeId))
    try {
      const token = sessionStorage.getItem('vision_token')
      await fetch(`${API}/routes/${routeId}/save`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      showToast?.('Route removed from saved', 'success')
    } catch { showToast?.('Could not remove route', 'error') }
  }

  useEffect(() => {
    if (!isOtherUser) return
    const token = sessionStorage.getItem('vision_token')
    setOtherLoading(true)
    Promise.all([
      fetch(`${API}/users/${viewUserId}`, { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/users/${viewUserId}/activities`, { headers:{ Authorization:`Bearer ${token}` } }).then(r => r.ok ? r.json() : null),
    ]).then(([u, a]) => {
      if (u) {
        setOtherUser(u)
        setFollowing((u.followers || []).some(f => (f._id || f) === (currentUser?._id || currentUser?.id)))
      }
      if (a?.activities) setOtherActs(a.activities)
    }).catch(() => {}).finally(() => setOtherLoading(false))
  }, [isOtherUser, viewUserId, currentUser])

  async function toggleFollow() {
    const token = sessionStorage.getItem('vision_token')
    const wasFollowing = isFollowingThem
    setFollowing(f => !f)
    try {
      const res = await fetch(`${API}/users/${viewUserId}/follow`, { method: wasFollowing ? 'DELETE' : 'POST', headers:{ Authorization:`Bearer ${token}` } })
      const data = await res.json()
      if (typeof data.following === 'boolean') setFollowing(data.following)
    } catch { setFollowing(f => !f) }
  }

  const user = isOtherUser ? otherUser : (currentUser || propUser)

  const [tab,           setTab]          = useState(initialTab || 'activities')
  const [editing,       setEditing]      = useState(false)
  const [logoutConfirm, setLogoutConfirm]= useState(false)
  const [editForm,      setEditForm]     = useState(null)
  const [deleteTarget,  setDeleteTarget] = useState(null)
  const [deleting,      setDeleting]     = useState(false)

  async function confirmDeleteActivity() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await ajax.deleteActivity(deleteTarget._id)
      setMyActs(prev => prev.filter(a => a._id !== deleteTarget._id))
      showToast?.('Activity deleted', 'success')
    } catch {
      showToast?.('Could not delete — please try again', 'error')
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (isOtherUser && otherLoading) {
    return (
      <div style={{ background:'#F0FAFA', minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite' }} />
      </div>
    )
  }

  if (isOtherUser && !otherLoading && !otherUser) {
    return (
      <div style={{ background:'#F0FAFA', minHeight:'100%', padding:'60px 24px', textAlign:'center' }}>
        <p style={{ fontSize:15, color:'#9aaab8', marginBottom:16 }}>This athlete could not be found.</p>
        <button onClick={onBack} style={{ padding:'10px 22px', borderRadius:14, background:'#008080', color:'#fff', border:'none', fontWeight:600, cursor:'pointer' }}>Go Back</button>
      </div>
    )
  }

  function openEdit() {
    setEditForm({ fullName: user?.fullName || '', username: user?.username || '', bio: user?.bio || '', avatarUrl: user?.avatarUrl || '' })
    setEditing(true)
  }

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast?.('Please choose an image file', 'error'); return }
    if (file.size > 15 * 1024 * 1024) { showToast?.('Image is too large (max 15MB)', 'error'); return }
    try {
      const compressed = await compressImageFile(file, 480, 0.8)
      setEditForm(f => ({ ...f, avatarUrl: compressed }))
    } catch {
      showToast?.('Could not process that image — try a different one', 'error')
    }
  }

  async function handleSaveProfile() {
    if (!editForm) return
    try {
      const token = sessionStorage.getItem('vision_token')
      const res = await fetch(`${API}/users/me`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(editForm) })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(res.status === 413 ? 'Photo is too large — try a different one' : (data?.message || 'Could not save profile'))
      }
      const { user: updated } = await res.json()
      updateUser(updated)
      setEditing(false)
      showToast?.('Profile updated', 'success')
    } catch (err) {
      showToast?.(err.message || 'Could not save — check your connection', 'error')
    }
  }

  function handleLogout() {
    if (!logoutConfirm) { setLogoutConfirm(true); setTimeout(()=>setLogoutConfirm(false),3000); return }
    onLogout?.()
  }

  const displayName = user?.fullName || user?.name || 'Athlete'
  const displayUser = user?.username || 'athlete'
  const displayBio  = user?.bio || 'Endurance athlete. Pushing the limits, one step at a time.'
  const followers   = user?.followersCount ?? 0
  const following   = user?.followingCount ?? 0
  const activities  = user?.activitiesCount ?? 0

  const myTotals = myActs.reduce((acc, a) => ({
    km: acc.km + (a.distanceKm || 0),
    min: acc.min + (a.durationMinutes || 0),
    cal: acc.cal + (a.calories || 0),
  }), { km:0, min:0, cal:0 })
  const fmtHM = mins => { const h = Math.floor(mins/60), m = Math.round(mins%60); return h > 0 ? `${h}h ${m}m` : `${m}m` }

  const badges = buildBadges({
    activitiesCount: activities,
    totalDistanceKm: myTotals.km,
    followingCount: following,
    savedRoutesCount: savedRoutes.length,
    groupsCount: myGroups.length,
  })

  const mediaItems = myActs.filter(a => a.imageUrl || a.videoUrl)

  const dark = !isOtherUser && user?.settings?.appearance === 'dark'
  const pageBg = dark ? '#0d1f1a' : '#F0FAFA'

  return (
    <div style={{ background:pageBg, minHeight:'100%', paddingBottom:24 }}>
      <div style={{ background:'linear-gradient(175deg,#004444 0%,#008080 100%)', padding:'52px 0 0', position:'relative', overflow:'hidden' }}>
        <svg style={{ position:'absolute', top:-40, right:-40, opacity:.08 }} width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="110" fill="#00E676"/></svg>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'0 16px 10px' }}>
          {isOtherUser ? (
            <button onClick={onBack} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          ) : <span />}
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:28 }}>
          <Avatar user={user} size={90} border="3px solid rgba(255,255,255,.35)" style={{ marginBottom:14 }} />
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
            {isOtherUser ? (
              <button onClick={toggleFollow} style={{ display:'flex', alignItems:'center', gap:7, padding:'0 24px', height:38, borderRadius:12, background: isFollowingThem ? 'rgba(255,255,255,.12)' : '#00E676', border: isFollowingThem ? '1.5px solid rgba(255,255,255,.3)' : 'none', color: isFollowingThem ? '#fff' : '#003d3d', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                {isFollowingThem ? 'Following' : 'Follow'}
              </button>
            ) : (
              <>
                <button onClick={openEdit} style={{ display:'flex', alignItems:'center', gap:7, padding:'0 18px', height:38, borderRadius:12, background:'rgba(255,255,255,.12)', border:'1.5px solid rgba(255,255,255,.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profile
                </button>
                <button onClick={() => setShowSettings(true)} style={{ display:'flex', alignItems:'center', gap:7, padding:'0 18px', height:38, borderRadius:12, background:'rgba(255,255,255,.12)', border:'1.5px solid rgba(255,255,255,.3)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!isOtherUser && (
      <div style={{ margin:'0 16px', marginTop:-18, background:'#fff', borderRadius:20, padding:'18px 20px', boxShadow:'0 4px 20px rgba(0,128,128,.12)', border:'1px solid #e8f4f4', position:'relative', zIndex:2 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:12 }}>Identity Summary</p>
        <div style={{ display:'flex' }}>
          {[
            { label:'Active Time', val: myActsLoading ? '…' : fmtHM(myTotals.min) },
            { label:'Distance',    val: myActsLoading ? '…' : `${myTotals.km.toFixed(1)} km` },
            { label:'Calories',    val: myActsLoading ? '…' : myTotals.cal.toLocaleString() },
            { label:'Workouts',    val: myActsLoading ? '…' : myActs.length },
          ].map((m,i)=>(
            <div key={m.label} style={{ flex:1, textAlign:'center', borderRight: i<3 ? '1px solid #e8f4f4' : 'none' }}>
              <p style={{ fontSize:14, fontWeight:800, color:'#1a1a2e' }}>{m.val}</p>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:2, fontWeight:500 }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      <div style={{ display:'flex', gap:0, margin:'20px 16px 16px', background:'#fff', borderRadius:14, padding:4, boxShadow:'0 2px 8px rgba(0,128,128,.06)' }}>
        {['activities','media','routes','groups','badges'].filter(t => !(isOtherUser && (t==='media' || t==='routes' || t==='groups'))).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, height:38, borderRadius:10, background: tab===t ? 'linear-gradient(135deg,#008080,#00c853)' : 'transparent', color: tab===t ? '#fff' : '#9aaab8', fontSize:12, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize', transition:'all .2s' }}>
            {t === 'routes' ? 'Saved Routes' : t === 'groups' ? 'My Groups' : t}
          </button>
        ))}
      </div>

      <div style={{ padding:'0 16px' }}>
        {tab === 'activities' && isOtherUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Activities</span>
            {otherActs.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:13, color:'#9aaab8' }}>No public activities yet.</p>
              </div>
            )}
            {otherActs.map(a => (
              <button key={a._id} onClick={() => onOpenActivity?.(a)} style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4', textAlign:'left', cursor:'pointer', padding:0 }}>
                {a.imageUrl && <div style={{ height:140 }}><img src={a.imageUrl} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>}
                <div style={{ padding:'12px 14px' }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{a.title}</p>
                  <p style={{ fontSize:11, color:'#9aaab8', marginTop:2 }}>{a.distanceKm ? `${a.distanceKm} km` : ''} {a.durationMinutes ? `· ${a.durationMinutes}m` : ''}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {tab === 'activities' && !isOtherUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>My Activities</span>
            {myActsLoading && (
              <div style={{ textAlign:'center', padding:'24px 0' }}><div style={{ width:30, height:30, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite', margin:'0 auto' }} /></div>
            )}
            {!myActsLoading && myActs.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:13, color:'#9aaab8' }}>No activities yet. Start your first VISION activity.</p>
              </div>
            )}
            {myActs.map(a => (
              <div key={a._id} style={{ position:'relative' }}>
                <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(a) }} style={{ position:'absolute', top:10, right:10, zIndex:2, width:30, height:30, borderRadius:'50%', background:'rgba(0,0,0,.45)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} aria-label="Delete activity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <button onClick={() => onOpenActivity?.(a)} style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4', textAlign:'left', cursor:'pointer', padding:0, display:'block', width:'100%' }}>
                {a.imageUrl && (
                  <div style={{ position:'relative', height:150 }}>
                    <img src={a.imageUrl} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 55%)' }} />
                    <div style={{ position:'absolute', top:12, left:14 }}><TypeBadge type={a.sportType} /></div>
                    <div style={{ position:'absolute', bottom:12, left:14 }}>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,.65)', marginBottom:2 }}>{new Date(a.createdAt).toLocaleDateString()}</p>
                      <p style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{a.title}</p>
                    </div>
                  </div>
                )}
                {!a.imageUrl && (
                  <div style={{ padding:'14px 16px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>{a.title}</p>
                    <TypeBadge type={a.sportType} />
                  </div>
                )}
                <div style={{ display:'flex', padding:'12px 0' }}>
                  {[a.distanceKm?{label:'Distance',val:`${a.distanceKm} km`}:null, a.calories?{label:'Burned',val:`${a.calories} kcal`}:null, { label:'Duration', val: `${a.durationMinutes||0}m` }, { label:'Likes', val: a.likes?.length || 0 }].filter(Boolean).map((st,i,arr)=>(
                    <div key={i} style={{ flex:1, textAlign:'center', borderRight: i<arr.length-1 ? '1px solid #e8f4f4' : 'none' }}>
                      <p style={{ fontSize:13, fontWeight:800, color:'#1a1a2e' }}>{st.val}</p>
                      <p style={{ fontSize:10, color:'#9aaab8' }}>{st.label}</p>
                    </div>
                  ))}
                </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'media' && !isOtherUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Media</span>
            {mediaItems.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:13, color:'#9aaab8' }}>No photos or videos yet. Add media to your next activity.</p>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {mediaItems.map(a => (
                <button key={a._id} onClick={() => onOpenActivity?.(a)} style={{ position:'relative', height:140, borderRadius:14, overflow:'hidden', border:'none', padding:0, cursor:'pointer' }}>
                  {a.imageUrl
                    ? <img src={a.imageUrl} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', background:'#0a2a2a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.45) 0%,transparent 50%)' }} />
                  <p style={{ position:'absolute', bottom:8, left:10, fontSize:12, fontWeight:700, color:'#fff', margin:0 }}>{a.title}</p>
                  {a.videoUrl && <span style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.5)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:6 }}>VIDEO</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'routes' && !isOtherUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Saved Routes</span>
            {savedLoading && (
              <div style={{ textAlign:'center', padding:'24px 0' }}><div style={{ width:30, height:30, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite', margin:'0 auto' }} /></div>
            )}
            {!savedLoading && savedRoutes.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:13, color:'#9aaab8' }}>No saved routes yet — explore the map to find some.</p>
              </div>
            )}
            {savedRoutes.map(r => (
              <div key={r._id} style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
                <button onClick={() => onOpenRoute?.(r)} style={{ display:'block', width:'100%', background:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left' }}>
                  <div style={{ position:'relative', height:120 }}>
                    <img src={r.imageUrl} alt={r.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 55%)' }} />
                    <div style={{ position:'absolute', bottom:10, left:12 }}>
                      <p style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{r.title}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{r.city} · {r.distanceKm} km</p>
                    </div>
                  </div>
                </button>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#9aaab8', textTransform:'capitalize' }}>{r.difficulty}</span>
                  <button onClick={() => unsaveRoute(r._id)} style={{ fontSize:12, color:'#e53935', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Unsave</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'groups' && !isOtherUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>My Groups</span>
            {groupsLoading && (
              <div style={{ textAlign:'center', padding:'24px 0' }}><div style={{ width:30, height:30, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite', margin:'0 auto' }} /></div>
            )}
            {!groupsLoading && myGroups.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 16px', background:'#fff', borderRadius:18, border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:13, color:'#9aaab8' }}>You haven't joined or created any groups yet.</p>
              </div>
            )}
            {myGroups.map(g => (
              <button key={g._id} onClick={() => onOpenGroup?.(g)} style={{ display:'block', width:'100%', background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4', textAlign:'left', cursor:'pointer', padding:0 }}>
                <div style={{ position:'relative', height:110, background:`url(${g.coverImage}) center/cover`, backgroundColor:'#0a2a2a' }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 55%)' }} />
                  <div style={{ position:'absolute', bottom:10, left:12 }}>
                    <p style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{g.name}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,.8)' }}>{g.sportType} · {g.members?.length || 0} members</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'badges' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>Badges</span>
              <span style={{ fontSize:12, color:'#9aaab8' }}>{badges.filter(b=>b.unlocked).length} / {badges.length}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {badges.map(b => (
                <div key={b.label} style={{ background:'#fff', borderRadius:18, padding:'20px 16px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4', opacity: b.unlocked ? 1 : .45 }}>
                  <div style={{ width:56, height:56, borderRadius:18, background: b.unlocked ? 'linear-gradient(135deg,#008080,#00E676)' : '#eef2f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={b.unlocked ? '#fff' : '#b0c0c0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <p style={{ fontSize:12, fontWeight:700, color:'#1a1a2e' }}>{b.label}</p>
                  <p style={{ fontSize:10, color:'#9aaab8', marginTop:3 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && editForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:200, display:'flex', alignItems:'flex-end' }} onClick={() => setEditing(false)}>
          <div style={{ background:'#fff', width:'100%', maxWidth:480, margin:'0 auto', borderRadius:'24px 24px 0 0', padding:'24px 20px calc(40px + env(safe-area-inset-bottom, 0px))', maxHeight:'calc(100dvh - 32px)', overflowY:'auto', animation:'slideUp .3s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:'#e0eeee', margin:'0 auto 20px' }} />
            <h3 style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:20 }}>Edit Profile</h3>

            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
              <div style={{ position:'relative', width:84, height:84, marginBottom:8 }}>
                {editForm.avatarUrl ? (
                  <img src={editForm.avatarUrl} alt="" style={{ width:84, height:84, borderRadius:'50%', objectFit:'cover' }} />
                ) : (
                  <div style={{ width:84, height:84, borderRadius:'50%', background:'#008080', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800 }}>
                    {(editForm.fullName || 'A').trim().slice(0,2).toUpperCase()}
                  </div>
                )}
                <label style={{ position:'absolute', bottom:-2, right:-2, width:28, height:28, borderRadius:'50%', background:'#00E676', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid #fff' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003d3d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} style={{ display:'none' }} />
                </label>
              </div>
              <p style={{ fontSize:11, color:'#9aaab8' }}>Tap the + to change your photo</p>
            </div>

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

      {showSettings && !isOtherUser && (
        <Settings user={user} onClose={() => setShowSettings(false)} onLogout={onLogout} showToast={showToast} />
      )}

      {deleteTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => e.target===e.currentTarget && setDeleteTarget(null)}>
          <div style={{ background:'#fff', borderRadius:20, padding:'24px 22px', maxWidth:340, width:'100%', textAlign:'center' }}>
            <p style={{ fontSize:16, fontWeight:800, color:'#1a1a2e', marginBottom:8 }}>Delete this activity?</p>
            <p style={{ fontSize:13, color:'#9aaab8', marginBottom:20, lineHeight:1.5 }}>This can't be undone. It will be removed from your feed and profile.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex:1, height:44, borderRadius:12, background:'#f7fbfb', border:'1.5px solid #e0eeee', color:'#5a6a7a', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={confirmDeleteActivity} disabled={deleting} style={{ flex:1, height:44, borderRadius:12, background:'#e53935', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: deleting ? .7 : 1 }}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
