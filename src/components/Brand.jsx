/* Simple, deliberate mark: a peak (the "V" of VISION, and a mountain/summit
   motif for athletic progress) sitting on a single flat baseline — no
   gradients-for-gradients'-sake, just two solid brand colors. */
export function VisionMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="VISION">
      <rect width="40" height="40" rx="9" fill="#0a3636"/>
      <path d="M9 27L18 13L23 21L27 15L32 27" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="18" cy="13" r="2.2" fill="#00E676"/>
    </svg>
  )
}

export function VisionLockup({ size = 36, dark = false }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <VisionMark size={size} />
      <div>
        <p style={{ fontSize: size * 0.5, fontWeight:800, color: dark ? '#0a2a2a' : '#fff', letterSpacing:'0.14em', margin:0, fontFamily:"Inter,'SF Pro Display','Segoe UI',sans-serif", lineHeight:1 }}>VISION</p>
        <p style={{ fontSize: size * 0.22, letterSpacing:'0.32em', color: dark ? '#008080' : 'rgba(0,230,118,0.85)', fontWeight:600, margin:0, lineHeight:1.3 }}>ATHLETIC INTELLIGENCE</p>
      </div>
    </div>
  )
}

export function VisionWordmark({ dark = false }) {
  return (
    <div>
      <p style={{ fontSize:20, fontWeight:800, color: dark ? '#0a2a2a' : '#fff', letterSpacing:'0.14em', margin:0, fontFamily:"Inter,'SF Pro Display','Segoe UI',sans-serif" }}>VISION</p>
      <p style={{ fontSize:8, letterSpacing:'0.34em', color: dark ? '#008080' : 'rgba(0,230,118,0.85)', fontWeight:600, margin:0 }}>ATHLETIC INTELLIGENCE</p>
    </div>
  )
}
