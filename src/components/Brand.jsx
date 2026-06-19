export function VisionMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="VISION">
      <rect width="40" height="40" rx="10" fill="url(#vm_grad)"/>
      <defs>
        <linearGradient id="vm_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#005f5f"/>
          <stop offset="1" stopColor="#00b86b"/>
        </linearGradient>
      </defs>
      <polyline
        points="6,23 11,23 14,15 19,29 23,19 27,23 34,23"
        stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
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
