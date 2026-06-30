import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ENTRY_MODE_KEY } from '../lib/entryMode'

const SPORTS = ['Running','Cycling','Hiking','Swimming','Triathlon','CrossFit','Yoga','Rock Climbing']

export default function SignUp({ onBack, entryMode }) {
  const { signup } = useAuth()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')
  const [form,    setForm]    = useState({ fullName:'', username:'', email:'', password:'', confirmPassword:'', sports:[] })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleSport = s =>
    set('sports', form.sports.includes(s) ? form.sports.filter(x => x !== s) : [...form.sports, s])

  function validateStep() {
    if (step === 1) {
      if (!form.fullName.trim()) return 'Please enter your full name'
      if (!form.username.trim()) return 'Please choose a username'
      if (!/^[a-z0-9_]{3,20}$/i.test(form.username.trim())) return 'Username: 3–20 chars, letters/numbers/underscore only'
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Please enter a valid email'
      if (form.password.length < 6) return 'Password must be at least 6 characters'
      if (form.confirmPassword && form.confirmPassword !== form.password) return 'Passwords do not match'
    }
    return null
  }

  async function next() {
    setErr('')
    const validErr = validateStep()
    if (validErr) { setErr(validErr); return }
    if (step < 3) { setStep(s => s + 1); return }

    setLoading(true)
    try {
      if (entryMode) localStorage.setItem(ENTRY_MODE_KEY, entryMode)
      await signup({
        fullName: form.fullName.trim(),
        username: form.username.trim().toLowerCase(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        sports:   form.sports,
      })
    } catch (ex) {
      localStorage.removeItem(ENTRY_MODE_KEY)
      setErr(ex.message || 'Signup failed. Please try again.')
      setLoading(false)
    }
  }

  const iStyle = { display:'flex', alignItems:'center', background:'#f7fbfb', border:'1.5px solid #e0eeee', borderRadius:14, padding:'0 16px', height:52, gap:10 }
  const inp    = { flex:1, background:'transparent', fontSize:14, color:'#1a1a2e', fontFamily:'inherit', border:'none', outline:'none' }

  return (
    <div style={{ animation:'fadeIn .3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:28, gap:8 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ flex:1, height:4, borderRadius:2, background: n<=step ? 'linear-gradient(90deg,#008080,#00E676)' : '#e0eeee', transition:'background .3s' }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ animation:'fadeIn .3s ease' }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:4 }}>Create Account</h2>
            <p style={{ color:'#5a6a7a', fontSize:13, marginBottom:24 }}>Join the athletic community</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={iStyle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><input placeholder="Full Name" value={form.fullName} onChange={e=>set('fullName',e.target.value)} style={inp} /></div>
              <div style={iStyle}><span style={{ color:'#9aaab8', fontSize:15, fontWeight:600, flexShrink:0 }}>@</span><input placeholder="username" value={form.username} onChange={e=>set('username',e.target.value.replace(/\s/g,''))} style={inp} autoCapitalize="none" /></div>
              <div style={iStyle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><input type="email" placeholder="Email address" value={form.email} onChange={e=>set('email',e.target.value)} style={inp} autoComplete="email" /></div>
              <div style={iStyle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={e=>set('password',e.target.value)} style={inp} autoComplete="new-password" /></div>
              <div style={iStyle}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aaab8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} style={inp} autoComplete="new-password" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation:'fadeIn .3s ease' }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:4 }}>Your Sports</h2>
            <p style={{ color:'#5a6a7a', fontSize:13, marginBottom:20 }}>Select all that apply (optional)</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {SPORTS.map(sp => {
                const on = form.sports.includes(sp)
                return (
                  <button key={sp} onClick={()=>toggleSport(sp)} style={{ padding:'12px 10px', borderRadius:12, border:`2px solid ${on ? '#008080' : '#e0eeee'}`, background: on ? 'rgba(0,128,128,0.08)' : '#f7fbfb', color: on ? '#008080' : '#5a6a7a', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'inherit' }}>
                    {sp}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation:'fadeIn .3s ease', textAlign:'center', padding:'16px 0' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#008080,#00E676)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', marginBottom:8 }}>You're all set!</h2>
            <p style={{ color:'#5a6a7a', fontSize:14, lineHeight:1.6 }}>Welcome to Vision, <strong>{form.fullName || 'Athlete'}</strong>.<br/>Let's start tracking your journey.</p>
            {form.sports.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:16 }}>
                {form.sports.map(sp => <span key={sp} style={{ background:'rgba(0,128,128,.1)', color:'#008080', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:20 }}>{sp}</span>)}
              </div>
            )}
          </div>
        )}

        {err && <p style={{ fontSize:13, color:'#e53935', margin:'12px 0 0', padding:'8px 14px', background:'#fff5f5', borderRadius:10, border:'1px solid #ffcdd2' }}>{err}</p>}

        <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:12 }}>
          <button onClick={next} disabled={loading} style={{ width:'100%', height:52, borderRadius:14, background:'linear-gradient(135deg,#008080,#00c853)', color:'#fff', fontSize:15, fontWeight:700, letterSpacing:1, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,128,128,0.3)', border:'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, fontFamily:'inherit' }}>
            {loading ? <span style={{ width:20, height:20, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }}/> : step === 3 ? 'Start Training' : 'Continue'}
          </button>
          {step > 1 && (
            <button onClick={() => setStep(s=>s-1)} style={{ background:'none', border:'none', color:'#9aaab8', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Back
            </button>
          )}
        </div>

        {step === 1 && (
          <p style={{ textAlign:'center', fontSize:13, color:'#9aaab8', marginTop:20 }}>
            Already have an account?{' '}
            <button type="button" onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#008080', fontWeight:700, fontFamily:'inherit', padding:0 }}>Log In</button>
          </p>
        )}
    </div>
  )
}
