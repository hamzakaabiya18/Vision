import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { VisionLockup } from './Brand'
import SignUp from './SignUp'

export default function Login() {
  const { login } = useAuth()

  const [mode,     setMode]     = useState('login')
  const [ident,    setIdent]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')

  if (mode === 'signup') return <SignUp onBack={() => setMode('login')} />

  async function submit(e) {
    e.preventDefault()
    if (!ident.trim() || !password) { setErr('Please fill in all fields'); return }
    setLoading(true); setErr('')
    try {
      await login({ emailOrUsername: ident.trim(), password })
    } catch (ex) {
      setErr(ex.message || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel" style={{ backgroundImage:`url(https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80)` }}>
        <div style={s.panelOverlay} />
        <div style={s.featureCard}>
          <div style={s.featureIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p style={s.featureTitle}>Join Our Community</p>
            <p style={s.featureSub}>Connect with athletes worldwide</p>
          </div>
        </div>
        <svg style={s.routeSvg} viewBox="0 0 450 700" preserveAspectRatio="xMidYMid slice">
          <polyline points="80,600 160,440 220,510 300,320 380,260" stroke="rgba(0,230,118,.55)" strokeWidth="2.5" fill="none" strokeDasharray="6 4"/>
          {[[80,600],[160,440],[220,510],[300,320],[380,260]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="5" fill="#00E676" opacity=".8"/>
          ))}
        </svg>
      </div>

      <div style={s.card}>
        <div style={{ marginBottom: 32 }}>
          <VisionLockup size={40} dark />
        </div>

        <h1 style={s.h1}>Welcome Back</h1>
        <p style={s.sub}>Push further. Connect deeper.</p>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14, marginTop: 28 }}>
          <div style={s.inputWrap}>
            <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input value={ident} onChange={e=>setIdent(e.target.value)} placeholder="Email or Username" type="text" style={s.input} autoComplete="username" />
          </div>

          <div style={s.inputWrap}>
            <svg style={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type={showPass?'text':'password'} style={s.input} autoComplete="current-password" />
            <button type="button" onClick={()=>setShowPass(p=>!p)} style={s.eyeBtn} aria-label={showPass?'Hide':'Show'}>
              {showPass
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="button" style={s.link}>Forgot Password?</button>
          </div>

          {err && <p style={s.errMsg}>{err}</p>}

          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }}>
            {loading ? <span style={s.spinner} /> : 'Sign In'}
          </button>

          <div style={s.dividerRow}>
            <span style={s.dividerLine}/><span style={s.dividerText}>or continue with</span><span style={s.dividerLine}/>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            {[
              { label:'Google', icon:<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { label:'Apple',  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a2e"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
            ].map(({ label, icon }) => (
              <button key={label} type="button" style={s.socialBtn}>
                {icon}
                <span style={{ fontSize:13, fontWeight:600, color:'#4a5e6a' }}>{label}</span>
              </button>
            ))}
          </div>
        </form>

        <p style={{ textAlign:'center', fontSize:13, color:'#9aaab8', marginTop:24 }}>
          Don't have an account?{' '}
          <button type="button" onClick={()=>setMode('signup')} style={{ ...s.link, color:'#008080', fontWeight:700 }}>Sign Up</button>
        </p>
      </div>

      <div className="login-panel" style={{ backgroundImage:`url(https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80)` }}>
        <div style={s.panelOverlay} />
        <div style={{ ...s.featureCard, bottom:48, right:32, left:'auto' }}>
          <div style={s.featureIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div>
            <p style={s.featureTitle}>Track Progress</p>
            <p style={s.featureSub}>Real-time GPS analytics</p>
          </div>
        </div>
        <svg style={s.routeSvg} viewBox="0 0 450 700" preserveAspectRatio="xMidYMid slice">
          <polyline points="380,600 300,420 240,490 160,310 80,250" stroke="rgba(0,230,118,.55)" strokeWidth="2.5" fill="none" strokeDasharray="6 4"/>
          {[[380,600],[300,420],[240,490],[160,310],[80,250]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="5" fill="#00E676" opacity=".8"/>
          ))}
        </svg>
      </div>

      <div className="login-footer" style={s.footer}>
        {[
          { label:'GPS Tracking',    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
          { label:'Smart Analytics', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
          { label:'Social Feed',     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        ].map(({ label, icon }) => (
          <div key={label} style={s.footerItem}>
            <span style={{ color:'rgba(255,255,255,.5)' }}>{icon}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,.6)', fontWeight:500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  panelOverlay: { position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(0,30,30,.6) 0%,rgba(0,60,60,.4) 100%)' },
  featureCard:  { position:'absolute', bottom:48, left:32, background:'rgba(10,40,40,0.62)', backdropFilter:'blur(12px)', borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, maxWidth:210, border:'1px solid rgba(0,230,118,.18)' },
  featureIcon:  { width:44, height:44, borderRadius:12, background:'rgba(0,200,100,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  featureTitle: { fontSize:13, fontWeight:700, color:'#fff', margin:0 },
  featureSub:   { fontSize:11, color:'rgba(255,255,255,.65)', margin:0, marginTop:2, lineHeight:1.4 },
  routeSvg:     { position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' },
  card:         { background:'#fff', padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'center', overflowY:'auto' },
  h1:           { fontSize:28, fontWeight:800, color:'#0a2a2a', margin:0 },
  sub:          { fontSize:14, color:'#008080', fontWeight:500, marginTop:4 },
  inputWrap:    { display:'flex', alignItems:'center', background:'#f7fbfb', border:'1.5px solid #e0eeee', borderRadius:14, padding:'0 14px', height:52, gap:10 },
  inputIcon:    { flexShrink:0 },
  input:        { flex:1, background:'transparent', fontSize:14, color:'#0a2a2a', fontFamily:'inherit', height:'100%', border:'none', outline:'none' },
  eyeBtn:       { background:'none', border:'none', cursor:'pointer', display:'flex', padding:2, flexShrink:0 },
  link:         { background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#9aaab8', fontFamily:'inherit', padding:0 },
  errMsg:       { fontSize:13, color:'#e53935', margin:0, padding:'8px 14px', background:'#fff5f5', borderRadius:10, border:'1px solid #ffcdd2' },
  submitBtn:    { width:'100%', height:52, borderRadius:14, background:'linear-gradient(135deg,#008080,#00c853)', color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,128,128,.3)', fontFamily:'inherit', letterSpacing:'0.04em' },
  spinner:      { width:20, height:20, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' },
  dividerRow:   { display:'flex', alignItems:'center', gap:10 },
  dividerLine:  { flex:1, height:1, background:'#e8f4f4' },
  dividerText:  { fontSize:12, color:'#9aaab8', whiteSpace:'nowrap' },
  socialBtn:    { flex:1, height:46, borderRadius:12, background:'#f7fbfb', border:'1.5px solid #e0eeee', display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', fontFamily:'inherit' },
  footer:       { gridColumn:'1 / -1', background:'rgba(0,20,20,0.7)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', gap:48, padding:'14px 24px', borderTop:'1px solid rgba(0,230,118,0.08)' },
  footerItem:   { display:'flex', alignItems:'center', gap:8 },
}
