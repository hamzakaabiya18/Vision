import { useState, useEffect, useCallback } from 'react'
import { ajax } from '../../lib/ajaxClient'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SPORT_FILTERS = ['All','Running','Cycling','Hiking','Swimming','Triathlon','Climbing','Skiing','Yoga','Gym']
const SPORT_COLORS  = { Running:'#008080', Cycling:'#00a87a', Hiking:'#5a7a3a', Swimming:'#0077b6', Triathlon:'#7b2cbf', Climbing:'#b5541a', Skiing:'#1a6bb5', Yoga:'#9c6fd6', Gym:'#d4560a' }

function GroupCard({ group, currentUserId, onJoin }) {
  const isMember = group.members?.some(m => (m._id || m) === currentUserId)
  const color = SPORT_COLORS[group.sportType] || '#008080'
  return (
    <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,128,128,.08)', border:'1px solid #e8f4f4' }}>
      <div style={{ position:'relative', height:130, background:`url(${group.coverImage}) center/cover`, backgroundColor:'#0a2a2a' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 55%)' }} />
        <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
          <span style={{ display:'inline-block', background:color, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, letterSpacing:.5, marginBottom:4 }}>{group.sportType?.toUpperCase()}</span>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#fff', margin:0 }}>{group.name}</h3>
        </div>
        {group.privacy === 'invite' && (
          <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,.5)', borderRadius:8, padding:'3px 8px', fontSize:10, color:'#fff', fontWeight:600 }}>PRIVATE</div>
        )}
      </div>
      <div style={{ padding:'12px 14px 14px' }}>
        <p style={{ fontSize:12, color:'#5a6a7a', margin:'0 0 10px', lineHeight:1.5 }}>{group.description}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'#9aaab8', fontWeight:600 }}>{group.members?.length || 0} members</span>
          <button onClick={() => onJoin(group._id, isMember)} style={{ padding:'7px 16px', borderRadius:10, border: isMember ? '1.5px solid #008080' : 'none', background: isMember ? '#fff' : 'linear-gradient(135deg,#008080,#00E676)', color: isMember ? '#008080' : '#fff', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
            {isMember ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateGroupModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name:'', description:'', sportType:'Running', location:'', privacy:'open', coverImage:'' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.name) { setErr('Group name is required'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/groups`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('vision_token')}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      onCreate(data)
      onClose()
    } catch (e) { setErr(e.message) }
    setSaving(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:999, display:'flex', alignItems:'flex-end' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', maxWidth:600, margin:'0 auto', background:'#fff', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ width:40, height:4, borderRadius:2, background:'#ddd', margin:'0 auto 20px' }} />
        <h2 style={{ fontSize:20, fontWeight:800, color:'#1a1a2e', marginBottom:20 }}>Create Group</h2>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[{ label:'Group Name', key:'name', placeholder:'Alpha Stride Club' },{ label:'Description', key:'description', placeholder:'What is this group about?' },{ label:'Location', key:'location', placeholder:'City, Country' },{ label:'Cover Image URL', key:'coverImage', placeholder:'https://...' }].map(({ label, key, placeholder }) => (
            <div key={key}>
              <p style={{ fontSize:12, fontWeight:700, color:'#1a1a2e', marginBottom:6 }}>{label}</p>
              <input value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} placeholder={placeholder} style={{ width:'100%', background:'#f7fbfb', border:'1.5px solid #e0eeee', borderRadius:12, padding:'11px 14px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
            </div>
          ))}
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#1a1a2e', marginBottom:6 }}>Sport</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Running','Cycling','Hiking','Swimming','Triathlon','Climbing','Skiing','Yoga','Gym'].map(s => (
                <button key={s} type="button" onClick={() => setForm(p=>({...p, sportType:s}))} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${form.sportType===s ? SPORT_COLORS[s]||'#008080' : '#e0eeee'}`, background: form.sportType===s ? `${SPORT_COLORS[s]||'#008080'}15` : '#f7fbfb', color: form.sportType===s ? SPORT_COLORS[s]||'#008080' : '#9aaab8', fontSize:12, fontWeight:600, cursor:'pointer' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:'#1a1a2e', marginBottom:6 }}>Privacy</p>
            <div style={{ display:'flex', gap:10 }}>
              {['open','invite'].map(v => (
                <button key={v} type="button" onClick={() => setForm(p=>({...p, privacy:v}))} style={{ flex:1, padding:'10px', borderRadius:12, border:`1.5px solid ${form.privacy===v ? '#008080' : '#e0eeee'}`, background: form.privacy===v ? '#e6f7f7' : '#f7fbfb', color: form.privacy===v ? '#008080' : '#9aaab8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {v === 'open' ? 'Open' : 'Invite Only'}
                </button>
              ))}
            </div>
          </div>
          {err && <p style={{ fontSize:13, color:'#c00' }}>{err}</p>}
          <button type="submit" disabled={saving} style={{ height:52, borderRadius:14, background:'linear-gradient(135deg,#008080,#00E676)', color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', marginTop:4 }}>
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Groups({ user }) {
  const [groups,     setGroups]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [sport,      setSport]      = useState('All')
  const [q,          setQ]          = useState('')
  const [privacy,    setPrivacy]    = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ajax.searchGroups({ q, sport: sport !== 'All' ? sport : undefined, privacy: privacy || undefined })
      setGroups(data.groups || [])
    } catch {
      try {
        const qs = new URLSearchParams()
        if (q)               qs.set('q', q)
        if (sport !== 'All') qs.set('sport', sport)
        if (privacy)         qs.set('privacy', privacy)
        const res = await fetch(`${API}/groups?${qs}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('vision_token')}` } })
        const data = await res.json()
        setGroups(data.groups || [])
      } catch { setGroups([]) }
    }
    setLoading(false)
  }, [q, sport, privacy])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  async function handleJoin(groupId, isMember) {
    try {
      const res = await fetch(`${API}/groups/${groupId}/join`, { method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('vision_token')}` } })
      const data = await res.json()
      setGroups(prev => prev.map(g => {
        if (g._id !== groupId) return g
        const members = data.joined
          ? [...(g.members||[]), { _id: user?._id, avatarUrl: user?.avatarUrl }]
          : (g.members||[]).filter(m => (m._id||m) !== user?._id)
        return { ...g, members }
      }))
    } catch {}
  }

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%' }}>
      <div style={{ padding:'52px 16px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e' }}>Groups</h1>
            <p style={{ fontSize:13, color:'#5a6a7a' }}>{groups.length} active communities</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:14, background:'linear-gradient(135deg,#008080,#00E676)', color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(0,128,128,.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Group
          </button>
        </div>
        <div style={{ position:'relative', marginBottom:12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search groups..." style={{ width:'100%', background:'#fff', border:'1.5px solid #e0eeee', borderRadius:14, padding:'12px 14px 12px 40px', fontSize:14, color:'#1a1a2e', outline:'none', fontFamily:'inherit' }} />
        </div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {SPORT_FILTERS.map(s => <button key={s} onClick={() => setSport(s)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:20, border:`1.5px solid ${sport===s ? '#008080' : '#e0eeee'}`, background: sport===s ? '#e6f7f7' : '#fff', color: sport===s ? '#008080' : '#9aaab8', fontSize:12, fontWeight:600, cursor:'pointer' }}>{s}</button>)}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          {[['','All Groups'],['open','Open'],['invite','Invite Only']].map(([val, label]) => <button key={val} onClick={() => setPrivacy(val)} style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${privacy===val ? '#008080' : '#e0eeee'}`, background: privacy===val ? '#e6f7f7' : '#fff', color: privacy===val ? '#008080' : '#9aaab8', fontSize:11, fontWeight:600, cursor:'pointer' }}>{label}</button>)}
        </div>
      </div>

      <div style={{ padding:'0 16px 100px', display:'flex', flexDirection:'column', gap:14 }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} style={{ background:'#fff', borderRadius:20, height:200 }} />)
        ) : groups.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0d0d0" strokeWidth="1.5" style={{ marginBottom:12 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p style={{ fontSize:15, color:'#9aaab8', fontWeight:600 }}>No groups found</p>
            <p style={{ fontSize:13, color:'#b0c0c0' }}>Connect the backend or create a new group</p>
          </div>
        ) : groups.map(g => <GroupCard key={g._id} group={g} currentUserId={user?._id} onJoin={handleJoin} />)}
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={g => setGroups(prev => [g, ...prev])} />}
    </div>
  )
}
