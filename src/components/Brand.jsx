export function VisionMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="VISION">
      <rect width="40" height="40" rx="9" fill="url(#vm_bg)"/>
      <path d="M8 22.5L15 28.5L20.5 19.5L30 9.5" stroke="url(#vm_stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M30 9.5H23.5M30 9.5V16" stroke="#00E676" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <defs>
        <linearGradient id="vm_bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#004d4d"/>
          <stop offset="1" stopColor="#007a7a"/>
        </linearGradient>
        <linearGradient id="vm_stroke" x1="8" y1="28.5" x2="30" y2="9.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff"/>
          <stop offset="1" stopColor="#00E676"/>
        </linearGradient>
      </defs>
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
