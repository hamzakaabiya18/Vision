import { useState, useEffect, useRef, useCallback } from 'react'

const ALL_USERS = [
  { id:'u1',  name:'Marcus Chen',      username:'marcus_runs',    avatar:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80',  online:true  },
  { id:'u2',  name:'Sara Valeri',      username:'sara_cycles',    avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',  online:true  },
  { id:'u3',  name:'Leo Brooks',       username:'leo_trails',     avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80',  online:true  },
  { id:'u4',  name:'Daniel Park',      username:'daniel_runs',    avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',  online:false },
  { id:'u5',  name:'Maya Johnson',     username:'maya_fit',       avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',  online:false },
  { id:'u6',  name:'Elena Rossi',      username:'elena_swims',    avatar:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',  online:true  },
  { id:'u7',  name:'James Okafor',     username:'james_lifts',    avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80', online:false },
  { id:'u8',  name:'Sophie Laurent',   username:'sophie_yoga',    avatar:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80', online:true  },
  { id:'u9',  name:'Nadia Kowalski',   username:'nadia_tri',      avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', online:true  },
  { id:'u10', name:'Tariq Hassan',     username:'tariq_desert',   avatar:'https://images.unsplash.com/photo-1474176857210-7287d38d27c6?w=80&q=80', online:false },
  { id:'u11', name:'Amara Diallo',     username:'amara_sprints',  avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80', online:true  },
  { id:'u12', name:'Kezia Mwangi',     username:'kezia_trails',   avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80', online:true  },
]

const SEED_CONVOS = [
  { id:'c1', userId:'u1', name:'Marcus Chen',    avatar:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80', last:"Smashed the morning run today!", time:'14:32', unread:2, online:true  },
  { id:'c2', userId:'u2', name:'Sara Valeri',    avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', last:"Your pace improved by 12%",      time:'Yesterday', unread:0, online:true  },
  { id:'c3', userId:'u3', name:'Leo Brooks',     avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80', last:"Thanks for the trail tips!",     time:'Sat', unread:0, online:true  },
  { id:'c4', userId:'u4', name:'Daniel Park',    avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80', last:"Sunday run still on?",           time:'Wed', unread:0, online:false },
  { id:'c5', userId:'u9', name:'Nadia Kowalski', avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', last:"See you at the tri race!",        time:'Tue', unread:1, online:true  },
]

const SEED_MSGS = {
  c1: [
    { id:'m1', from:'them', text:'Hey! How was the morning run?',       time:'14:20' },
    { id:'m2', from:'me',   text:'Absolutely smashed it. New 5K PR!',   time:'14:22' },
    { id:'m3', from:'them', text:'No way! What time?',                  time:'14:24' },
    { id:'m4', from:'me',   text:'19:42. Been training hard for this.', time:'14:25' },
    { id:'m5', from:'them', text:'Smashed the morning run today!',      time:'14:32' },
  ],
}

function NewChatModal({ onClose, onStart, existingIds = [] }) {
  const [q, setQ] = useState('')
  const filtered = ALL_USERS.filter(u =>
    !existingIds.includes(u.id) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
  )
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:500, display:'flex', alignItems:'flex-end' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:430, margin:'0 auto', background:'#fff', borderRadius:'20px 20px 0 0', padding:'20px 16px', maxHeight:'80vh', display:'flex', flexDirection:'column' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'#ddd', margin:'0 auto 16px' }} />
        <p style={{ fontSize:17, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>New Message</p>
        <div style={{ display:'flex', alignItems:'center', background:'#f7fbfb', borderRadius:12, border:'1.5px solid #e8f4f4', padding:'0 12px', height:42, gap:8, marginBottom:12 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} autoFocus placeholder="Search athletes…" style={{ flex:1, background:'none', fontSize:14, color:'#1a1a2e', border:'none', outline:'none', fontFamily:'inherit' }} />
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length === 0 && <p style={{ fontSize:14, color:'#9aaab8', textAlign:'center', padding:'24px 0' }}>No athletes found</p>}
          {filtered.map(u => (
            <button key={u.id} onClick={() => onStart(u)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 0', background:'none', border:'none', borderBottom:'1px solid #e8f4f4', cursor:'pointer', textAlign:'left' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <img src={u.avatar} alt={u.name} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover' }} />
                {u.online && <span style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#00c853', border:'2px solid #fff' }} />}
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'#1a1a2e' }}>{u.name}</p>
                <p style={{ fontSize:12, color:'#9aaab8' }}>@{u.username}</p>
              </div>
              {u.online && <span style={{ marginLeft:'auto', fontSize:11, color:'#00c853', fontWeight:600 }}>Online</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatThread({ convo, messages, onBack, onSend, showToast }) {
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  function handleSend() {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
    setTyping(true)
    setTimeout(() => { setTyping(false); onSend(null, 'Thanks for your message! Keep pushing! 💪', 'them') }, 1600)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#F0FAFA' }}>
      <div style={{ background:'#fff', padding:'50px 16px 12px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(0,128,128,.06)', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ position:'relative' }}>
          <img src={convo.avatar} alt={convo.name} style={{ width:40, height:40, borderRadius:'50%', objectFit:'cover' }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'}} />
          {convo.online && <span style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#00c853', border:'2px solid #fff' }} />}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>{convo.name}</p>
          <p style={{ fontSize:12, color: convo.online ? '#00c853' : '#9aaab8', fontWeight:500 }}>{typing ? 'typing…' : convo.online ? 'Active now' : 'Offline'}</p>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 12px', display:'flex', flexDirection:'column', gap:8 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display:'flex', justifyContent: m.from==='me' ? 'flex-end' : 'flex-start', gap:8, alignItems:'flex-end' }}>
            {m.from==='them' && <img src={convo.avatar} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />}
            <div>
              <div style={{ background: m.from==='me' ? 'linear-gradient(135deg,#007a7a,#00c853)' : '#fff', color: m.from==='me' ? '#fff' : '#1a1a2e', borderRadius: m.from==='me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding:'10px 14px', maxWidth:240, fontSize:14, lineHeight:1.5, boxShadow:'0 1px 6px rgba(0,0,0,0.07)' }}>
                {m.text}
              </div>
              <p style={{ fontSize:10, color:'#9aaab8', marginTop:3, textAlign: m.from==='me' ? 'right' : 'left' }}>{m.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            <img src={convo.avatar} alt="" style={{ width:26, height:26, borderRadius:'50%', objectFit:'cover' }} />
            <div style={{ background:'#fff', borderRadius:'18px 18px 18px 4px', padding:'10px 16px', boxShadow:'0 1px 6px rgba(0,0,0,0.07)' }}>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#9aaab8', animation:`blinkDot .9s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ background:'#fff', padding:'10px 12px 28px', display:'flex', alignItems:'center', gap:8, borderTop:'1px solid #e8f4f4', flexShrink:0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} placeholder="Message…" style={{ flex:1, height:42, background:'#f7fbfb', border:'1.5px solid #e8f4f4', borderRadius:21, padding:'0 16px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
        <button onClick={handleSend} disabled={!input.trim()} style={{ width:42, height:42, borderRadius:'50%', background: input.trim() ? 'linear-gradient(135deg,#007a7a,#00c853)' : '#e8f4f4', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor: input.trim() ? 'pointer' : 'not-allowed', transition:'background .2s', flexShrink:0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}

export default function Messages({ user, showToast }) {
  const [convos,  setConvos]  = useState(SEED_CONVOS)
  const [msgs,    setMsgs]    = useState(SEED_MSGS)
  const [active,  setActive]  = useState(null)
  const [query,   setQuery]   = useState('')
  const [newChat, setNewChat] = useState(false)

  const openConvo = useCallback((c) => {
    setActive(c)
    setConvos(prev => prev.map(x => x.id===c.id ? {...x, unread:0} : x))
    if (!msgs[c.id]) setMsgs(m => ({ ...m, [c.id]: [{ id:Date.now(), from:'them', text:"Hey! What's up?", time:'Now' }] }))
  }, [msgs])

  const handleSend = useCallback((text, autoText = null, fromOverride = null) => {
    if (!active) return
    if (autoText) {
      setMsgs(m => ({ ...m, [active.id]: [...(m[active.id]||[]), { id:Date.now(), from: fromOverride||'me', text: autoText, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }] }))
      return
    }
    setMsgs(m => ({ ...m, [active.id]: [...(m[active.id]||[]), { id:Date.now(), from:'me', text, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }] }))
    setConvos(c => c.map(x => x.id===active.id ? {...x, last:text, time:'Now'} : x))
  }, [active])

  const startNewChat = useCallback((u) => {
    const exists = convos.find(c => c.userId === u.id)
    if (exists) { openConvo(exists); setNewChat(false); return }
    const newC = { id:`c_${u.id}`, userId:u.id, name:u.name, avatar:u.avatar, last:'Start a conversation', time:'', unread:0, online:u.online }
    setConvos(prev => [newC, ...prev])
    openConvo(newC)
    setNewChat(false)
  }, [convos, openConvo])

  const filtered = convos.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
  const totalUnread = convos.reduce((s, c) => s + (c.unread || 0), 0)

  if (active) return <ChatThread convo={active} messages={msgs[active.id]||[]} onBack={() => setActive(null)} onSend={handleSend} showToast={showToast} />

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%' }}>
      <div style={{ padding:'52px 16px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e', lineHeight:1 }}>Messages</h1>
            {totalUnread > 0 && <p style={{ fontSize:12, color:'#008080', fontWeight:600, marginTop:3 }}>{totalUnread} unread</p>}
          </div>
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

      <div style={{ padding:'0 16px 14px' }}>
        <p style={{ fontSize:11, fontWeight:600, color:'#9aaab8', letterSpacing:'.06em', marginBottom:10 }}>ONLINE NOW</p>
        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
          {ALL_USERS.filter(u=>u.online).slice(0,8).map(u => (
            <button key={u.id} onClick={() => startNewChat(u)} style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer' }}>
              <div style={{ position:'relative' }}>
                <img src={u.avatar} alt={u.name} style={{ width:48, height:48, borderRadius:'50%', objectFit:'cover', border:'2px solid #008080' }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'}} />
                <span style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#00c853', border:'2px solid #fff' }} />
              </div>
              <span style={{ fontSize:10, color:'#5a6a7a', fontWeight:500, maxWidth:48, textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap' }}>{u.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', minHeight:'50%' }}>
        <div style={{ padding:'14px 16px 6px', borderBottom:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'#9aaab8', letterSpacing:'.06em' }}>CONVERSATIONS</p>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 24px' }}>
            <p style={{ fontSize:15, color:'#9aaab8', fontWeight:600 }}>No conversations yet</p>
            <button onClick={()=>setNewChat(true)} style={{ marginTop:16, padding:'10px 24px', borderRadius:22, background:'#008080', color:'#fff', fontSize:14, fontWeight:600, border:'none', cursor:'pointer' }}>New Message</button>
          </div>
        )}
        {filtered.map((c, i) => (
          <button key={c.id} onClick={() => openConvo(c)} style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 16px', background:'none', border:'none', borderBottom: i<filtered.length-1 ? '1px solid #e8f4f4' : 'none', cursor:'pointer', textAlign:'left' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <img src={c.avatar} alt={c.name} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover' }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'}} />
              {c.online && <span style={{ position:'absolute', bottom:2, right:2, width:12, height:12, borderRadius:'50%', background:'#00c853', border:'2.5px solid #fff' }} />}
            </div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:15, fontWeight: c.unread ? 700 : 600, color:'#1a1a2e' }}>{c.name}</span>
                <span style={{ fontSize:11, color: c.unread ? '#008080' : '#9aaab8', fontWeight: c.unread ? 600 : 400, flexShrink:0 }}>{c.time}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, color:'#9aaab8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight: c.unread ? 500 : 400 }}>{c.last}</span>
                {c.unread > 0 && <span style={{ minWidth:20, height:20, borderRadius:10, background:'#008080', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', flexShrink:0 }}>{c.unread}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {newChat && <NewChatModal onClose={() => setNewChat(false)} onStart={startNewChat} existingIds={convos.map(c=>c.userId)} />}
    </div>
  )
}
