import { useRef, useEffect, useState } from 'react'

const VIDEO = '/videos/vision-sports-highlight.mp4'

export default function TrainingVideoPlayer({ videoUrl, isMobile }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const src = videoUrl || VIDEO

  /* Canvas: draw only a thin green progress arc in the corner */
  function drawOverlay() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!canvas || !video || !video.duration) {
      rafRef.current = requestAnimationFrame(drawOverlay)
      return
    }
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const pct = video.currentTime / video.duration
    setProgress(pct * 100)

    /* Thin progress arc — bottom-right corner, subtle */
    const cx = W - 32, cy = H - 32, r = 18
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = '#00E676'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
    ctx.stroke()

    rafRef.current = requestAnimationFrame(drawOverlay)
  }

  function stopDraw() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlay  = () => { setPlaying(true);  drawOverlay() }
    const onPause = () => { setPlaying(false); stopDraw() }
    video.addEventListener('play',  onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('play',  onPlay)
      video.removeEventListener('pause', onPause)
      stopDraw()
    }
  }, [src])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play().catch(() => {}) : v.pause()
  }

  function seek(e) {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }

  return (
    <div style={{
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
      marginBottom: isMobile ? 16 : 24,
      background: '#000',
      aspectRatio: '16/9',
    }}>
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Canvas overlay — only draws the small arc */}
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Gradient vignette at bottom for depth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)',
        pointerEvents: 'none',
      }} />

      {/* Click to pause/play */}
      <div
        onClick={togglePlay}
        style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
      />

      {/* Pause icon — only visible when paused */}
      {!playing && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(0,128,128,0.80)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,128,128,0.5)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </div>
      )}

      {/* Seek bar — thin line at very bottom */}
      <div
        onClick={e => { e.stopPropagation(); seek(e) }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
        }}
      >
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg,#008080,#00E676)',
          transition: 'width .1s linear',
        }} />
      </div>
    </div>
  )
}
