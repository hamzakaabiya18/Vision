import { useState, useEffect, useRef, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const DEMO_PEOPLE = [
  { _id:'demo1', fullName:'Running Mentor',   username:'running_mentor',   avatarUrl:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80', isDemo:true, last:'Ask me anything about pacing and training plans.' },
  { _id:'demo2', fullName:'Cycling Partner',  username:'cycling_partner',  avatarUrl:'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=80&q=80', isDemo:true, last:'Looking for a ride buddy this weekend?' },
  { _id:'demo3', fullName:'Recovery Advisor', username:'recovery_advisor', avatarUrl:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', isDemo:true, last:'Remember — rest days build fitness too.' },
]

function timeFmt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay ? d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : d.toLocaleDateString([], { month:'short', day:'numeric' })
}

function token() { return localStorage.getItem('vision_token') }

function UserSearchModal({ onClose, onStart }) {
  const [q,        setQ]        = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`${API}/users/search?q=${encodeURIComponent(q)}`, { headers:{ Authorization:`Bearer ${token()}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => setResults(d?.users || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:430, background:'#fff', borderRadius:'20px 20px 0 0', padding:'20px 16px', maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'#ddd', margin:'0 auto 16px' }} />
        <p style={{ fontSize:17, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>New Message</p>
        <div style={{ display:'flex', alignItems:'center', background:'#f7fbfb', borderRadius:12, border:'1.5px solid #e8f4f4', padding:'0 12px', height:42, gap:8, marginBottom:12 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} autoFocus placeholder="Search by name or username…" style={{ flex:1, background:'none', fontSize:14, color:'#1a1a2e', border:'none', outline:'none', fontFamily:'inherit' }} />
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {loading && <p style={{ fontSize:13, color:'#9aaab8', textAlign:'center', padding:'20px 0' }}>Searching…</p>}
          {!loading && results.length === 0 && <p style={{ fontSize:14, color:'#9aaab8', textAlign:'center', padding:'24px 0' }}>No athletes found</p>}
          {results.map(u => (
            <button key={u._id} onClick={() => onStart(u)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 0', background:'none', border:'none', borderBottom:'1px solid #e8f4f4', cursor:'pointer', textAlign:'left' }}>
              <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=008080&color=fff`} alt={u.fullName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover' }} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#1a1a2e' }}>{u.fullName}</p>
                <p style={{ fontSize:12, color:'#9aaab8' }}>@{u.username}</p>
              </div>
              {u.isFollowedByMe && <span style={{ fontSize:11, color:'#008080', fontWeight:600 }}>Following</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfilePreview({ user, onFollowToggle, onViewProfile }) {
  return (
    <div style={{ width:260, flexShrink:0, borderLeft:'1px solid #e8f4f4', padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center', height:'100%', overflowY:'auto' }}>
      <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=008080&color=fff&size=120`} alt={user.fullName} style={{ width:84, height:84, borderRadius:'50%', objectFit:'cover', marginBottom:12 }} />
      <p style={{ fontSize:16, fontWeight:800, color:'#1a1a2e' }}>{user.fullName}</p>
      <p style={{ fontSize:12, color:'#9aaab8', marginBottom:10 }}>@{user.username}</p>
      {user.isBot && <span style={{ fontSize:10, fontWeight:700, color:'#008080', background:'rgba(0,128,128,.1)', padding:'3px 10px', borderRadius:20, marginBottom:10 }}>VISION COACH BOT</span>}
      {!user.isBot && !user.isDemo && (
        <>
          <div style={{ display:'flex', gap:20, marginBottom:14 }}>
            <div style={{ textAlign:'center' }}><p style={{ fontSize:15, fontWeight:800, color:'#1a1a2e' }}>{user.followersCount ?? user.followers?.length ?? 0}</p><p style={{ fontSize:10, color:'#9aaab8' }}>Followers</p></div>
            <div style={{ textAlign:'center' }}><p style={{ fontSize:15, fontWeight:800, color:'#1a1a2e' }}>{user.followingCount ?? user.following?.length ?? 0}</p><p style={{ fontSize:10, color:'#9aaab8' }}>Following</p></div>
          </div>
          {user.sportTags?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:14 }}>
              {user.sportTags.map(s => <span key={s} style={{ fontSize:10, background:'rgba(0,128,128,.08)', color:'#008080', padding:'3px 8px', borderRadius:10 }}>{s}</span>)}
            </div>
          )}
          <button onClick={onFollowToggle} style={{ width:'100%', height:38, borderRadius:10, background: user.isFollowedByMe ? '#fff' : 'linear-gradient(135deg,#008080,#00E676)', border: user.isFollowedByMe ? '1.5px solid #008080' : 'none', color: user.isFollowedByMe ? '#008080' : '#fff', fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
            {user.isFollowedByMe ? 'Following' : 'Follow'}
          </button>
          <button onClick={onViewProfile} style={{ width:'100%', height:36, borderRadius:10, background:'none', border:'1.5px solid #e8f4f4', color:'#5a6a7a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            View Profile
          </button>
        </>
      )}
    </div>
  )
}

function ChatThread({ otherUser, messages, onBack, onSend, isMobile, loading }) {
  const [input,   setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    await onSend(text)
    setSending(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F0FAFA' }}>
      <div style={{ background:'#fff', padding: isMobile ? '50px 16px 12px' : '20px 20px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(0,128,128,.06)', flexShrink:0 }}>
        {isMobile && (
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <img src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=008080&color=fff`} alt={otherUser.fullName} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} />
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>{otherUser.fullName}{otherUser.isBot ? ' 🤖' : ''}</p>
          <p style={{ fontSize:12, color:'#9aaab8', fontWeight:500 }}>
            {otherUser.isBot ? 'VISION Coach Bot' : otherUser.isDemo ? 'Demo conversation' : `@${otherUser.username}`}
          </p>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:8 }}>
        {loading && <p style={{ textAlign:'center', fontSize:12, color:'#9aaab8' }}>Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p style={{ textAlign:'center', fontSize:13, color:'#9aaab8', marginTop:20 }}>
            {otherUser.isBot ? 'Ask VISION Coach about running, cycling, recovery, routes, or stats.' : 'Say hello and start the conversation.'}
          </p>
        )}
        {messages.map(m => {
          const fromMe = m.fromMe
          return (
            <div key={m._id} style={{ display:'flex', justifyContent: fromMe ? 'flex-end' : 'flex-start', gap:8, alignItems:'flex-end' }}>
              {!fromMe && <img src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=008080&color=fff`} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />}
              <div>
                <div style={{ background: fromMe ? 'linear-gradient(135deg,#007a7a,#00c853)' : '#fff', color: fromMe ? '#fff' : '#1a1a2e', borderRadius: fromMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding:'10px 14px', maxWidth:280, fontSize:14, lineHeight:1.5, boxShadow:'0 1px 6px rgba(0,0,0,0.07)' }}>
                  {m.body}
                </div>
                <p style={{ fontSize:10, color:'#9aaab8', marginTop:3, textAlign: fromMe ? 'right' : 'left' }}>{timeFmt(m.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ background:'#fff', padding:'10px 12px 28px', display:'flex', alignItems:'center', gap:8, borderTop:'1px solid #e8f4f4', flexShrink:0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} placeholder="Message…" maxLength={1000} style={{ flex:1, height:42, background:'#f7fbfb', border:'1.5px solid #e8f4f4', borderRadius:21, padding:'0 16px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
        <button onClick={handleSend} disabled={!input.trim() || sending} style={{ width:42, height:42, borderRadius:'50%', background: input.trim() ? 'linear-gradient(135deg,#007a7a,#00c853)' : '#e8f4f4', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor: input.trim() ? 'pointer' : 'not-allowed', transition:'background .2s', flexShrink:0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function Messages({ user, showToast, isMobile = true, onOpenProfile }) {
  const [conversations, setConversations] = useState([])
  const [convosLoading,  setConvosLoading] = useState(true)
  const [botId,          setBotId]         = useState(null)
  const [active,         setActive]        = useState(null)
  const [messages,       setMessages]      = useState([])
  const [msgsLoading,    setMsgsLoading]   = useState(false)
  const [query,          setQuery]         = useState('')
  const [newChat,        setNewChat]       = useState(false)
  const [demoMsgs,       setDemoMsgs]      = useState({})
  const myId = user?._id || user?.id

  const loadConversations = useCallback(() => {
    fetch(`${API}/messages/conversations`, { headers:{ Authorization:`Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setConversations(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setConvosLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API}/messages/bot/id`, { headers:{ Authorization:`Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.botId) setBotId(d) })
      .catch(() => {})
    loadConversations()
    const iv = setInterval(loadConversations, 8000)
    return () => clearInterval(iv)
  }, [loadConversations])

  const loadMessages = useCallback((userId) => {
    fetch(`${API}/messages/${userId}`, { headers:{ Authorization:`Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setMessages(Array.isArray(d) ? d.map(m => ({ ...m, fromMe: (m.sender?._id || m.sender) === myId })) : []))
      .catch(() => {})
      .finally(() => setMsgsLoading(false))
  }, [myId])

  useEffect(() => {
    if (!active || active.isDemo) return
    setMsgsLoading(true)
    loadMessages(active._id)
    const iv = setInterval(() => loadMessages(active._id), 4000)
    return () => clearInterval(iv)
  }, [active, loadMessages])

  async function openUser(u) {
    setNewChat(false)
    if (u.isDemo) { setActive(u); return }
    try {
      const res = await fetch(`${API}/users/${u._id}`, { headers:{ Authorization:`Bearer ${token()}` } })
      const full = res.ok ? await res.json() : u
      setActive({
        ...u, ...full,
        isFollowedByMe: (full.followers || []).some(f => (f._id || f) === myId),
        followersCount: full.followers?.length, followingCount: full.following?.length,
      })
    } catch { setActive(u) }
  }

  async function handleSend(text) {
    if (active.isDemo) {
      const reply = { _id:`d${Date.now()}`, body:text, fromMe:true, createdAt:new Date().toISOString() }
      const auto  = { _id:`d${Date.now()+1}`, body:"Thanks for reaching out! This is a demo conversation.", fromMe:false, createdAt:new Date().toISOString() }
      setDemoMsgs(prev => ({ ...prev, [active._id]: [...(prev[active._id]||[]), reply, auto] }))
      setMessages(prev => [...prev, reply, auto])
      return
    }
    try {
      const res = await fetch(`${API}/messages/${active._id}`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify({ body: text }) })
      const data = await res.json()
      if (!res.ok) { showToast?.(data.message || 'Could not send message', 'error'); return }
      const mine = { ...data.message, fromMe: true }
      const newOnes = data.reply ? [mine, { ...data.reply, fromMe: false }] : [mine]
      setMessages(prev => [...prev, ...newOnes])
      loadConversations()
    } catch { showToast?.('Could not send message', 'error') }
  }

  async function handleFollowToggle() {
    if (!active || active.isBot || active.isDemo) return
    const was = active.isFollowedByMe
    setActive(prev => ({ ...prev, isFollowedByMe: !was, followersCount: (prev.followersCount||0) + (was?-1:1) }))
    try {
      await fetch(`${API}/users/${active._id}/follow`, { method: was ? 'DELETE' : 'POST', headers:{ Authorization:`Bearer ${token()}` } })
      showToast?.(was ? 'Unfollowed' : 'Now following', 'success')
    } catch { showToast?.('Could not update follow', 'error') }
  }

  const realList = conversations.map(c => ({ ...c.otherUser, lastBody: c.body, lastAt: c.createdAt, unread: c.unreadCount || 0 }))
  const hasBotConvo = realList.some(c => c._id === botId?.botId)
  const pinnedBot = botId && !hasBotConvo ? [{ _id: botId.botId, fullName: 'VISION Coach', username:'vision_coach', isBot:true, lastBody:'Tap to ask for athletic guidance', lastAt:null, unread:0 }] : []
  const fullList = [...pinnedBot, ...realList]
  const filtered = query ? fullList.filter(c => c.fullName?.toLowerCase().includes(query.toLowerCase())) : fullList
  const showDemo = !convosLoading && realList.length === 0 && !query

  if (isMobile && active) {
    return <ChatThread otherUser={active} messages={active.isDemo ? (demoMsgs[active._id]||[]) : messages} onBack={() => setActive(null)} onSend={handleSend} isMobile loading={msgsLoading} />
  }

  const listPanel = (
    <div style={{ background:'#F0FAFA', minHeight:'100%', height: isMobile ? 'auto' : '100%', overflowY: isMobile ? 'visible' : 'auto' }}>
      <div style={{ padding: isMobile ? '52px 16px 14px' : '24px 16px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', lineHeight:1 }}>Messages</h1>
          <button onClick={() => setNewChat(true)} style={{ display:'flex', alignItems:'center', gap:6, height:38, padding:'0 14px', borderRadius:20, background:'#008080', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer', boxShadow:'0 3px 12px rgba(0,128,128,.28)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New
          </button>
        </div>
        <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:14, border:'1.5px solid #e8f4f4', padding:'0 14px', height:44, gap:10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations…" style={{ flex:1, background:'none', fontSize:14, color:'#1a1a2e', border:'none', outline:'none', fontFamily:'inherit' }} />
          {query && <button onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#9aaab8', fontSize:18, lineHeight:1 }}>×</button>}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', minHeight:'50%' }}>
        {convosLoading && <p style={{ textAlign:'center', fontSize:13, color:'#9aaab8', padding:'30px 0' }}>Loading conversations…</p>}

        {!convosLoading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 24px' }}>
            <p style={{ fontSize:15, color:'#9aaab8', fontWeight:600, lineHeight:1.5 }}>Search athletes and start your first VISION conversation.</p>
            <button onClick={()=>setNewChat(true)} style={{ marginTop:16, padding:'10px 24px', borderRadius:22, background:'#008080', color:'#fff', fontSize:14, fontWeight:600, border:'none', cursor:'pointer' }}>New Message</button>
          </div>
        )}

        {filtered.map((c, i) => (
          <button key={c._id} onClick={() => openUser(c)} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background: !isMobile && active?._id===c._id ? '#f0fafa' : 'none', border:'none', borderBottom: i<filtered.length-1 ? '1px solid #e8f4f4' : 'none', cursor:'pointer', textAlign:'left' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <img src={c.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=008080&color=fff`} alt={c.fullName} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover' }} />
              {c.isBot && <span style={{ position:'absolute', bottom:1, right:1, width:16, height:16, borderRadius:'50%', background:'#00E676', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>★</span>}
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:15, fontWeight: c.unread ? 700 : 600, color:'#1a1a2e' }}>{c.fullName}{c.isBot ? ' (Bot)' : ''}</span>
                <span style={{ fontSize:11, color: c.unread ? '#008080' : '#9aaab8', fontWeight: c.unread ? 600 : 400, flexShrink:0 }}>{timeFmt(c.lastAt)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, color:'#9aaab8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight: c.unread ? 500 : 400 }}>{c.lastBody}</span>
                {c.unread > 0 && <span style={{ minWidth:20, height:20, borderRadius:10, background:'#008080', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', flexShrink:0 }}>{c.unread}</span>}
              </div>
            </div>
          </button>
        ))}

        {showDemo && (
          <>
            <div style={{ padding:'16px 16px 6px', borderTop:'1px solid #e8f4f4' }}>
              <p style={{ fontSize:11, fontWeight:600, color:'#9aaab8', letterSpacing:'.06em' }}>DEMO — START YOUR OWN ABOVE</p>
            </div>
            {DEMO_PEOPLE.map((c, i) => (
              <button key={c._id} onClick={() => openUser(c)} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background:'none', border:'none', borderBottom: i<DEMO_PEOPLE.length-1 ? '1px solid #e8f4f4' : 'none', cursor:'pointer', textAlign:'left', opacity:.75 }}>
                <img src={c.avatarUrl} alt={c.fullName} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover' }} />
                <div style={{ flex:1, overflow:'hidden' }}>
                  <span style={{ fontSize:15, fontWeight:600, color:'#1a1a2e' }}>{c.fullName}</span>
                  <p style={{ fontSize:13, color:'#9aaab8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{c.last}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:'#9aaab8', background:'#f0f4f4', padding:'3px 8px', borderRadius:8 }}>DEMO</span>
              </button>
            ))}
          </>
        )}
      </div>

      {newChat && <UserSearchModal onClose={() => setNewChat(false)} onStart={openUser} />}
    </div>
  )

  if (isMobile) return listPanel

  return (
    <div style={{ display:'flex', height:'100%', background:'#F0FAFA' }}>
      <div style={{ width:380, flexShrink:0, height:'100%', overflowY:'auto', borderRight:'1px solid #e8f4f4' }}>
        {listPanel}
      </div>
      <div style={{ flex:1, height:'100%', overflow:'hidden' }}>
        {active ? (
          <ChatThread otherUser={active} messages={active.isDemo ? (demoMsgs[active._id]||[]) : messages} onBack={() => setActive(null)} onSend={handleSend} isMobile={false} loading={msgsLoading} />
        ) : (
          <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0d8d8" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p style={{ fontSize:14, color:'#9aaab8', fontWeight:600 }}>Search athletes and start your first VISION conversation.</p>
          </div>
        )}
      </div>
      {active && !active.isDemo && (
        <ProfilePreview user={active} onFollowToggle={handleFollowToggle} onViewProfile={() => onOpenProfile?.(active._id)} />
      )}
    </div>
  )
}
