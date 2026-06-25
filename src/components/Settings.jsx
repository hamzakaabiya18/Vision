import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SECTIONS = ['Account', 'Privacy', 'Appearance', 'Map', 'Subscription', 'Danger Zone']

function Row({ label, sub, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eef4f4', gap:12 }}>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#1a1a2e', margin:0 }}>{label}</p>
        {sub && <p style={{ fontSize:11, color:'#9aaab8', margin:'2px 0 0' }}>{sub}</p>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )
}

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} style={{ width:44, height:26, borderRadius:13, background: on ? 'linear-gradient(135deg,#008080,#00c853)' : '#e0eeee', border:'none', cursor:'pointer', position:'relative', transition:'background .2s' }}>
      <span style={{ position:'absolute', top:2, left: on ? 21 : 2, width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,.25)', transition:'left .2s' }} />
    </button>
  )
}

function SegButton({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', gap:6 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${value===o.value ? '#008080' : '#e0eeee'}`, background: value===o.value ? '#e6f7f7' : '#fff', color: value===o.value ? '#008080' : '#9aaab8', fontSize:11, fontWeight:700, cursor:'pointer' }}>{o.label}</button>
      ))}
    </div>
  )
}

export default function Settings({ user, onClose, onLogout, showToast }) {
  const { updateUser } = useAuth()
  const [section, setSection] = useState('Account')
  const [settings, setSettings] = useState(user?.settings || {
    appearance:'light', mapStyle:'standard', profileVisibility:'public',
    showActivityLocation:true, showSavedRoutesPublicly:true, messagePrivacy:'everyone',
  })
  const dark = settings.appearance === 'dark'

  const [emailForm,    setEmailForm]    = useState({ newEmail:'' })
  const [emailErr,     setEmailErr]     = useState('')
  const [pwForm,       setPwForm]       = useState({ current:'', next:'', confirm:'' })
  const [pwErr,        setPwErr]        = useState('')
  const [subModal,     setSubModal]     = useState(false)
  const [deleteModal,  setDeleteModal]  = useState(null) // 'data' | 'account'
  const [deleteConfirm,setDeleteConfirm]= useState('')
  const [saving,        setSaving]      = useState(false)

  function token() { return localStorage.getItem('vision_token') }

  async function patchSettings(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    localStorage.setItem('vision_map_style', next.mapStyle)
    try {
      const res = await fetch(`${API}/users/me/settings`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify(patch) })
      const data = await res.json()
      if (data.user) updateUser({ settings: data.user.settings })
    } catch { showToast?.('Could not save setting', 'error') }
  }

  async function submitEmail() {
    setEmailErr('')
    if (!emailForm.newEmail.trim()) { setEmailErr('Please enter a new email address'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/users/me/email`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify({ email: emailForm.newEmail.trim() }) })
      const data = await res.json()
      if (!res.ok) { setEmailErr(data.message); setSaving(false); return }
      updateUser({ email: data.user.email })
      setEmailForm({ newEmail:'' })
      showToast?.('Email updated', 'success')
    } catch { setEmailErr('Could not update email') }
    setSaving(false)
  }

  async function submitPassword() {
    setPwErr('')
    if (!pwForm.current || !pwForm.next) { setPwErr('Please fill in all fields'); return }
    if (pwForm.next.length < 6) { setPwErr('New password must be at least 6 characters'); return }
    if (pwForm.next !== pwForm.confirm) { setPwErr('Passwords do not match'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/users/me/password`, { method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` }, body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }) })
      const data = await res.json()
      if (!res.ok) { setPwErr(data.message); setSaving(false); return }
      setPwForm({ current:'', next:'', confirm:'' })
      showToast?.('Password updated', 'success')
    } catch { setPwErr('Could not update password') }
    setSaving(false)
  }

  async function confirmDelete() {
    if (deleteConfirm !== 'DELETE') return
    setSaving(true)
    try {
      if (deleteModal === 'data') {
        await fetch(`${API}/users/me/data`, { method:'DELETE', headers:{ Authorization:`Bearer ${token()}` } })
        showToast?.('Your activity data has been deleted', 'success')
        setDeleteModal(null); setDeleteConfirm(''); setSaving(false)
      } else {
        await fetch(`${API}/users/me`, { method:'DELETE', headers:{ Authorization:`Bearer ${token()}` } })
        onLogout?.()
      }
    } catch { showToast?.('Could not complete deletion', 'error'); setSaving(false) }
  }

  const bg     = dark ? '#10241f' : '#fff'
  const fg     = dark ? '#eef7f4' : '#1a1a2e'
  const subFg  = dark ? '#8fae9f' : '#9aaab8'
  const cardBg = dark ? '#16302a' : '#f7fbfb'
  const border = dark ? '#1f3f37' : '#e8f4f4'

  const inputStyle = { width:'100%', background:cardBg, border:`1.5px solid ${border}`, borderRadius:10, padding:'10px 12px', fontSize:13, color:fg, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const btnStyle = { height:42, borderRadius:10, background:'linear-gradient(135deg,#008080,#00c853)', color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', padding:'0 18px' }

  return (
    <div style={{ position:'fixed', inset:0, background:bg, zIndex:1200, overflowY:'auto', color:fg }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 18px', borderBottom:`1px solid ${border}`, position:'sticky', top:0, background:bg, zIndex:2 }}>
        <button onClick={onClose} style={{ width:36, height:36, borderRadius:'50%', background:cardBg, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontSize:18, fontWeight:800, margin:0 }}>Settings</h1>
      </div>

      <div style={{ display:'flex', gap:8, padding:'14px 18px', overflowX:'auto', scrollbarWidth:'none' }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:20, border:`1.5px solid ${section===s ? '#008080' : border}`, background: section===s ? (dark?'rgba(0,128,128,.25)':'#e6f7f7') : 'transparent', color: section===s ? '#00c853' : subFg, fontSize:12, fontWeight:700, cursor:'pointer' }}>{s}</button>
        ))}
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'0 18px 60px' }}>
        {section === 'Account' && (
          <div>
            <div style={{ background:cardBg, borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Change Email</p>
              <p style={{ fontSize:12, color:subFg, marginBottom:8 }}>Current: {user?.email}</p>
              <input value={emailForm.newEmail} onChange={e=>setEmailForm({newEmail:e.target.value})} placeholder="new@email.com" style={{ ...inputStyle, marginBottom:8 }} />
              {emailErr && <p style={{ fontSize:12, color:'#e53935', marginBottom:8 }}>{emailErr}</p>}
              <button onClick={submitEmail} disabled={saving} style={btnStyle}>Update Email</button>
            </div>

            <div style={{ background:cardBg, borderRadius:16, padding:'14px 16px', marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Change Password</p>
              <input type="password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} placeholder="Current password" style={{ ...inputStyle, marginBottom:8 }} />
              <input type="password" value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))} placeholder="New password (min 6 characters)" style={{ ...inputStyle, marginBottom:8 }} />
              <input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} placeholder="Confirm new password" style={{ ...inputStyle, marginBottom:8 }} />
              {pwErr && <p style={{ fontSize:12, color:'#e53935', marginBottom:8 }}>{pwErr}</p>}
              <button onClick={submitPassword} disabled={saving} style={btnStyle}>Update Password</button>
            </div>

            <button onClick={onLogout} style={{ width:'100%', height:46, borderRadius:12, background:'none', border:'1.5px solid #e53935', color:'#e53935', fontSize:14, fontWeight:700, cursor:'pointer' }}>Sign Out</button>
          </div>
        )}

        {section === 'Privacy' && (
          <div style={{ background:cardBg, borderRadius:16, padding:'4px 16px' }}>
            <Row label="Profile visibility" sub="Control who can view your profile">
              <SegButton options={[{value:'public',label:'Public'},{value:'private',label:'Private'}]} value={settings.profileVisibility} onChange={v=>patchSettings({profileVisibility:v})} />
            </Row>
            <Row label="Show activity location" sub="Display city/location on your activities">
              <Toggle on={settings.showActivityLocation} onClick={() => patchSettings({ showActivityLocation: !settings.showActivityLocation })} />
            </Row>
            <Row label="Show saved routes publicly" sub="Let others see your saved route library">
              <Toggle on={settings.showSavedRoutesPublicly} onClick={() => patchSettings({ showSavedRoutesPublicly: !settings.showSavedRoutesPublicly })} />
            </Row>
            <Row label="Allow messages from" sub="Who can start a conversation with you">
              <SegButton options={[{value:'everyone',label:'Everyone'},{value:'followers',label:'Followers'}]} value={settings.messagePrivacy} onChange={v=>patchSettings({messagePrivacy:v})} />
            </Row>
          </div>
        )}

        {section === 'Appearance' && (
          <div style={{ background:cardBg, borderRadius:16, padding:'16px' }}>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Theme</p>
            <div style={{ display:'flex', gap:10 }}>
              {[{value:'light',label:'Light'},{value:'dark',label:'Dark'},{value:'system',label:'System'}].map(o => (
                <button key={o.value} onClick={() => patchSettings({ appearance:o.value })} style={{ flex:1, height:60, borderRadius:12, border:`2px solid ${settings.appearance===o.value ? '#008080' : border}`, background: settings.appearance===o.value ? (dark?'rgba(0,128,128,.2)':'#e6f7f7') : 'transparent', color: settings.appearance===o.value ? '#00c853' : subFg, fontSize:12, fontWeight:700, cursor:'pointer' }}>{o.label}</button>
              ))}
            </div>
            <p style={{ fontSize:11, color:subFg, marginTop:12 }}>Applies to your Profile and Settings screens. Default stays Light to match the VISION brand identity.</p>
          </div>
        )}

        {section === 'Map' && (
          <div style={{ background:cardBg, borderRadius:16, padding:'16px' }}>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Map Style</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[{value:'standard',label:'Standard',desc:'Clean light teal map'},{value:'satellite',label:'Satellite-like',desc:'Darker high-contrast theme'},{value:'terrain',label:'Terrain / Sport',desc:'Warm earthy elevation theme'}].map(o => (
                <button key={o.value} onClick={() => patchSettings({ mapStyle:o.value })} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${settings.mapStyle===o.value ? '#008080' : border}`, background: settings.mapStyle===o.value ? (dark?'rgba(0,128,128,.2)':'#e6f7f7') : 'transparent', cursor:'pointer', textAlign:'left' }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color: settings.mapStyle===o.value ? '#00c853' : fg, margin:0 }}>{o.label}</p>
                    <p style={{ fontSize:11, color:subFg, margin:'2px 0 0' }}>{o.desc}</p>
                  </div>
                  {settings.mapStyle===o.value && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              ))}
            </div>
            <p style={{ fontSize:11, color:subFg, marginTop:12 }}>Explore will use this style for its map view.</p>
          </div>
        )}

        {section === 'Subscription' && (
          <div style={{ background:'linear-gradient(150deg,#003d3d,#007a7a)', borderRadius:18, padding:'24px 20px', color:'#fff' }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,.65)', fontWeight:700, letterSpacing:'.05em', marginBottom:6 }}>VISION PRO ANNUAL</p>
            <p style={{ fontSize:22, fontWeight:800, marginBottom:14 }}>Unlock the full athletic intelligence suite</p>
            <ul style={{ margin:'0 0 18px', padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
              {['Advanced performance insights','Premium route recommendations','Extended activity history','Pro badges','Social ranking insights'].map(f => (
                <li key={f} style={{ fontSize:13, color:'rgba(255,255,255,.85)', display:'flex', gap:8 }}><span style={{ color:'#00E676' }}>✓</span>{f}</li>
              ))}
            </ul>
            <button onClick={() => setSubModal(true)} style={{ width:'100%', height:46, borderRadius:12, background:'#00E676', color:'#003d3d', fontSize:14, fontWeight:800, border:'none', cursor:'pointer' }}>Upgrade to Annual</button>
          </div>
        )}

        {section === 'Danger Zone' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:cardBg, borderRadius:16, padding:'16px', border:'1.5px solid #f3c9c9' }}>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Delete my activity data</p>
              <p style={{ fontSize:12, color:subFg, marginBottom:12 }}>Permanently removes all activities and comments you've created. Your account stays active.</p>
              <button onClick={() => { setDeleteModal('data'); setDeleteConfirm('') }} style={{ height:40, borderRadius:10, background:'none', border:'1.5px solid #e53935', color:'#e53935', fontSize:13, fontWeight:700, cursor:'pointer', padding:'0 16px' }}>Delete My Data</button>
            </div>
            <div style={{ background:cardBg, borderRadius:16, padding:'16px', border:'1.5px solid #f3c9c9' }}>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Delete account</p>
              <p style={{ fontSize:12, color:subFg, marginBottom:12 }}>Permanently deletes your account, activities, and removes you from followers/following everywhere. This cannot be undone.</p>
              <button onClick={() => { setDeleteModal('account'); setDeleteConfirm('') }} style={{ height:40, borderRadius:10, background:'#e53935', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', padding:'0 16px' }}>Delete Account</button>
            </div>
          </div>
        )}
      </div>

      {subModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e=>e.target===e.currentTarget && setSubModal(false)}>
          <div style={{ background:'#fff', borderRadius:18, padding:'28px 24px', maxWidth:360, textAlign:'center' }}>
            <p style={{ fontSize:16, fontWeight:800, color:'#1a1a2e', marginBottom:10 }}>VISION Pro Annual</p>
            <p style={{ fontSize:13, color:'#5a6a7a', lineHeight:1.6, marginBottom:18 }}>Payment integration is not active in this academic demo.</p>
            <button onClick={() => setSubModal(false)} style={{ width:'100%', height:44, borderRadius:12, background:'#008080', color:'#fff', border:'none', fontWeight:700, cursor:'pointer' }}>Got it</button>
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e=>e.target===e.currentTarget && setDeleteModal(null)}>
          <div style={{ background:'#fff', borderRadius:18, padding:'24px 22px', maxWidth:380 }}>
            <p style={{ fontSize:16, fontWeight:800, color:'#e53935', marginBottom:10 }}>
              {deleteModal === 'data' ? 'Delete all activity data?' : 'Delete your account permanently?'}
            </p>
            <p style={{ fontSize:13, color:'#5a6a7a', lineHeight:1.6, marginBottom:14 }}>
              This action cannot be undone. Type <strong>DELETE</strong> below to confirm.
            </p>
            <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="Type DELETE" style={{ width:'100%', border:'1.5px solid #f3c9c9', borderRadius:10, padding:'10px 12px', fontSize:13, marginBottom:16, outline:'none', boxSizing:'border-box' }} />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex:1, height:44, borderRadius:10, background:'#f7fbfb', border:'1.5px solid #e0eeee', color:'#5a6a7a', fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleteConfirm !== 'DELETE' || saving} style={{ flex:1, height:44, borderRadius:10, background: deleteConfirm==='DELETE' ? '#e53935' : '#f3c9c9', border:'none', color:'#fff', fontWeight:700, cursor: deleteConfirm==='DELETE' ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
