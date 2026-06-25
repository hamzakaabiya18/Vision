import { useState, useEffect, useRef } from 'react'
import { ajax } from '../../lib/ajaxClient'

const DEMO_LEADERS = [
  { rank:1, _id:'demo1', fullName:'Marcus Chen',    username:'marcus_runs',   totalKm:842.4, totalActivities:64, favoriteSport:'Run',  avatarUrl:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80', sparkline:[58,72,80,69,91,104] },
  { rank:2, _id:'demo2', fullName:'Sara Valeri',    username:'sara_cycles',   totalKm:734.1, totalActivities:51, favoriteSport:'Ride', avatarUrl:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80', sparkline:[110,98,120,105,131,140] },
  { rank:3, _id:'demo3', fullName:'Leo Brooks',     username:'leo_trails',    totalKm:621.8, totalActivities:38, favoriteSport:'Hike', avatarUrl:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80', sparkline:[40,52,38,61,55,70] },
  { rank:4, _id:'demo4', fullName:'Nadia Kowalski', username:'nadia_tri',     totalKm:589.2, totalActivities:44, favoriteSport:'Swim', avatarUrl:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80', sparkline:[80,75,90,84,96,88] },
  { rank:5, _id:'demo5', fullName:'Amara Diallo',   username:'amara_sprints', totalKm:512.0, totalActivities:40, favoriteSport:'Run',  avatarUrl:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80', sparkline:[60,58,71,66,80,77] },
]

const SPORT_COLOR = { Run:'#008080', Ride:'#0077aa', Hike:'#5a7a3a', Swim:'#0055aa', Yoga:'#7b4ea0', Gym:'#b5541a', Ski:'#1a6bb5', Climb:'#9c6010' }

function fmtDuration(mins) {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function StatCard({ icon, value, label, sub }) {
  return (
    <div style={{ background:'#fff', borderRadius:18, padding:'16px 16px 14px', boxShadow:'0 2px 10px rgba(0,128,128,.07)', border:'1px solid #e8f4f4', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#e6f7f2,#d4ece3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {icon}
      </div>
      <p style={{ fontSize:21, fontWeight:800, color:'#0d1f1f', lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:11, color:'#5a6a7a', fontWeight:600 }}>{label}</p>
      {sub && <p style={{ fontSize:10, color:'#9aaab8' }}>{sub}</p>}
    </div>
  )
}

function Tooltip({ x, y, children, visible }) {
  if (!visible) return null
  return (
    <div style={{ position:'absolute', left:x, top:y, transform:'translate(-50%,-110%)', background:'#0d1f1f', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11, fontWeight:600, pointerEvents:'none', whiteSpace:'nowrap', zIndex:5 }}>
      {children}
    </div>
  )
}

function SportBarChart({ data = [] }) {
  const svgRef = useRef(null)
  const wrapRef = useRef(null)
  const [tip, setTip] = useState({ visible:false, x:0, y:0, text:'' })

  useEffect(() => {
    if (!data.length) return
    import('d3').then(d3 => {
      const W = svgRef.current?.clientWidth || 320, H = 200
      const PAD = { top:16, right:10, bottom:40, left:44 }
      d3.select(svgRef.current).selectAll('*').remove()
      const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`)
      const x = d3.scaleBand().domain(data.map(d => d._id)).range([PAD.left, W - PAD.right]).padding(0.32)
      const y = d3.scaleLinear().domain([0, (d3.max(data, d => d.totalKm) || 1) * 1.15]).range([H - PAD.bottom, PAD.top])
      svg.append('g').attr('transform', `translate(0,${H - PAD.bottom})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove()
      svg.append('g').attr('transform', `translate(${PAD.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}km`).tickSize(-W + PAD.left + PAD.right)).select('.domain').remove()
      svg.selectAll('.tick line').attr('stroke', 'rgba(0,128,128,.08)')
      svg.selectAll('.tick text').attr('fill', '#9aaab8').attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
      const defs = svg.append('defs')
      data.forEach((d, i) => {
        const gid = `bg${i}`
        const grad = defs.append('linearGradient').attr('id', gid).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#00E676')
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#008080')
        const rect = svg.append('rect')
          .attr('x', x(d._id)).attr('y', H - PAD.bottom).attr('width', x.bandwidth()).attr('height', 0).attr('rx', 6).attr('fill', `url(#${gid})`)
          .style('cursor', 'pointer')
        rect.transition().duration(650).delay(i * 70).attr('y', y(d.totalKm)).attr('height', H - PAD.bottom - y(d.totalKm))
        rect.on('mouseenter', function (ev) {
          d3.select(this).attr('opacity', .8)
          const rectBounds = svgRef.current.getBoundingClientRect()
          const wrapBounds = wrapRef.current.getBoundingClientRect()
          setTip({ visible:true, x: rectBounds.left - wrapBounds.left + x(d._id) + x.bandwidth()/2, y: rectBounds.top - wrapBounds.top + y(d.totalKm), text: `${d._id}: ${d.totalKm.toFixed(1)} km` })
        }).on('mouseleave', function () {
          d3.select(this).attr('opacity', 1)
          setTip(t => ({ ...t, visible:false }))
        })
        svg.append('text').attr('x', x(d._id) + x.bandwidth() / 2).attr('y', y(d.totalKm) - 6).attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 700).attr('fill', '#008080').attr('font-family', 'Inter, sans-serif').attr('opacity',0).text(`${Math.round(d.totalKm)}`).transition().delay(i*70+400).duration(300).attr('opacity',1)
      })
    })
  }, [data])

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <svg ref={svgRef} width="100%" height="200" />
      <Tooltip {...tip}>{tip.text}</Tooltip>
    </div>
  )
}

function TrendLineChart({ data = [], field = 'km', color1 = '#008080', color2 = '#00E676', unit = '' }) {
  const svgRef = useRef(null)
  const wrapRef = useRef(null)
  const [tip, setTip] = useState({ visible:false, x:0, y:0, text:'' })
  const gid = field

  useEffect(() => {
    if (!data.length) return
    import('d3').then(d3 => {
      const W = svgRef.current?.clientWidth || 320, H = 170
      const PAD = { top:14, right:16, bottom:32, left:44 }
      d3.select(svgRef.current).selectAll('*').remove()
      const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`)
      const x = d3.scalePoint().domain(data.map(d => d.month)).range([PAD.left, W - PAD.right])
      const y = d3.scaleLinear().domain([0, (d3.max(data, d => d[field]) || 1) * 1.15]).range([H - PAD.bottom, PAD.top])
      svg.append('g').attr('transform', `translate(0,${H - PAD.bottom})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove()
      svg.append('g').attr('transform', `translate(${PAD.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}`).tickSize(-W + PAD.left + PAD.right)).select('.domain').remove()
      svg.selectAll('.tick line').attr('stroke', 'rgba(0,128,128,.08)')
      svg.selectAll('.tick text').attr('fill', '#9aaab8').attr('font-size', 10).attr('font-family', 'Inter, sans-serif')
      const defs = svg.append('defs')
      const lGrad = defs.append('linearGradient').attr('id', `l${gid}`).attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%')
      lGrad.append('stop').attr('offset', '0%').attr('stop-color', color1)
      lGrad.append('stop').attr('offset', '100%').attr('stop-color', color2)
      const aGrad = defs.append('linearGradient').attr('id', `a${gid}`).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')
      aGrad.append('stop').attr('offset', '0%').attr('stop-color', color2).attr('stop-opacity', .18)
      aGrad.append('stop').attr('offset', '100%').attr('stop-color', color2).attr('stop-opacity', 0)
      const area = d3.area().x(d => x(d.month)).y0(H - PAD.bottom).y1(d => y(d[field])).curve(d3.curveCatmullRom)
      const line = d3.line().x(d => x(d.month)).y(d => y(d[field])).curve(d3.curveCatmullRom)
      const path = svg.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', `url(#l${gid})`).attr('stroke-width', 2.5).attr('stroke-linecap', 'round')
      svg.append('path').datum(data).attr('d', area).attr('fill', `url(#a${gid})`)
      const totalLength = path.node().getTotalLength()
      path.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength).transition().duration(800).attr('stroke-dashoffset', 0)

      svg.selectAll('.dot').data(data).enter().append('circle')
        .attr('cx', d => x(d.month)).attr('cy', d => y(d[field])).attr('r', 4).attr('fill', '#fff').attr('stroke', color1).attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function (ev, d) {
          d3.select(this).attr('r', 6)
          const rectBounds = svgRef.current.getBoundingClientRect()
          const wrapBounds = wrapRef.current.getBoundingClientRect()
          setTip({ visible:true, x: rectBounds.left - wrapBounds.left + x(d.month), y: rectBounds.top - wrapBounds.top + y(d[field]), text: `${d.month}: ${d[field]}${unit}` })
        }).on('mouseleave', function () {
          d3.select(this).attr('r', 4)
          setTip(t => ({ ...t, visible:false }))
        })
    })
  }, [data, field])

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <svg ref={svgRef} width="100%" height="170" />
      <Tooltip {...tip}>{tip.text}</Tooltip>
    </div>
  )
}

function WeeklyFrequencyChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:90, padding:'0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <div style={{ width:'100%', maxWidth:28, height:`${Math.max((d.count/max)*64, 4)}px`, borderRadius:6, background: d.count>0 ? 'linear-gradient(180deg,#00E676,#008080)' : '#eef5f4', transition:'height .4s ease' }} title={`${d.count} activities`} />
          <span style={{ fontSize:10, color:'#9aaab8', fontWeight:600 }}>{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function Sparkline({ values = [], color = '#008080' }) {
  if (!values.length) return <div style={{ width:80, height:28 }} />
  const max = Math.max(...values, 1), min = Math.min(...values, 0)
  const span = Math.max(max - min, 1)
  const W = 80, H = 28
  const pts = values.map((v, i) => [ (i/(values.length-1||1)) * W, H - ((v-min)/span) * H ])
  const d = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.5" fill={color} />
    </svg>
  )
}

function IconDistance() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function IconTime()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> }
function IconActivity() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
function IconFlame()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#008080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> }

export default function Stats({ user, onBack, isMobile = true, onOpenProfile }) {
  const [statsTab, setStatsTab] = useState('personal')
  const [myStats,  setMyStats]  = useState(null)
  const [leaders,  setLeaders]  = useState(null)
  const [userCount, setUserCount] = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      ajax.getStats().catch(() => null),
      ajax.getGlobalStats().catch(() => null),
    ]).then(([stats, global]) => {
      if (stats) setMyStats(stats)
      if (global) { setLeaders(global.leaders || []); setUserCount(global.userCount || 0) }
    }).finally(() => setLoading(false))
  }, [])

  const totals = myStats?.totals || {}
  const hasData = (totals.totalActivities || 0) > 0
  const displayName = user?.fullName || myStats?.user?.fullName || 'Athlete'
  const displayUser = user?.username || myStats?.user?.username || 'athlete'
  const avatarSrc = user?.avatarUrl || myStats?.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=008080&color=fff&size=120`

  const realLeadersHaveData = leaders?.some(l => l.totalKm > 0)
  const shownLeaders = (leaders && realLeadersHaveData) ? leaders : DEMO_LEADERS
  const usingDemoLeaders = !(leaders && realLeadersHaveData)

  const thisMonth = myStats?.monthlyDistance?.[myStats.monthlyDistance.length - 1]
  const lastMonth  = myStats?.monthlyDistance?.[myStats.monthlyDistance.length - 2]
  const monthDelta = thisMonth && lastMonth ? Math.round(((thisMonth.km - lastMonth.km) / Math.max(lastMonth.km, 1)) * 100) : null

  const Header = (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding: isMobile ? '52px 16px 16px' : '0 0 20px' }}>
      {onBack && (
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,128,128,.08)', border:'none', cursor:'pointer', flexShrink:0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e' }}>Stats</h1>
    </div>
  )

  const TabBar = (
    <div style={{ display:'flex', gap:0, margin: isMobile ? '0 16px 20px' : '0 0 24px', background:'#fff', borderRadius:14, padding:4, boxShadow:'0 2px 8px rgba(0,128,128,.06)', maxWidth: isMobile ? 'none' : 360 }}>
      {['personal','leaderboard'].map(t => (
        <button key={t} onClick={() => setStatsTab(t)} style={{ flex:1, height:38, borderRadius:10, background: statsTab===t ? 'linear-gradient(135deg,#008080,#00c853)' : 'transparent', color: statsTab===t ? '#fff' : '#9aaab8', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', transition:'all .2s' }}>
          {t === 'personal' ? 'My Stats' : 'Leaderboard'}
        </button>
      ))}
    </div>
  )

  const PersonalContent = (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'linear-gradient(150deg,#003d3d,#007a7a)', borderRadius:20, padding:'22px 20px', display:'flex', alignItems:'center', gap:16 }}>
        <img src={avatarSrc} alt={displayName} style={{ width:64, height:64, borderRadius:'50%', objectFit:'cover', border:'2.5px solid rgba(255,255,255,.35)' }} onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=008080&color=fff&size=120`}} />
        <div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.6)', fontWeight:600, letterSpacing:'.05em', marginBottom:3 }}>YOUR ATHLETIC INTELLIGENCE OVERVIEW</p>
          <p style={{ fontSize:18, fontWeight:800, color:'#fff' }}>{displayName}</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.6)' }}>@{displayUser}</p>
        </div>
      </div>

      {!hasData && (
        <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1.5px dashed #c9e6e0', textAlign:'center' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:4 }}>No activities yet</p>
          <p style={{ fontSize:13, color:'#9aaab8' }}>Start your first activity to unlock your VISION performance insights.</p>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:12 }}>
        <StatCard icon={<IconDistance/>} value={`${totals.totalDistanceKm ?? 0} km`} label="TOTAL DISTANCE" sub="all time" />
        <StatCard icon={<IconTime/>}     value={fmtDuration(totals.totalDurationMinutes || 0)} label="ACTIVE TIME" sub="all time" />
        <StatCard icon={<IconActivity/>} value={totals.totalActivities ?? 0} label="ACTIVITIES" sub={totals.favoriteSport ? `mostly ${totals.favoriteSport}` : 'sessions'} />
        <StatCard icon={<IconFlame/>}    value={(totals.totalCalories ?? 0).toLocaleString()} label="CALORIES BURNED" sub="all time" />
      </div>

      <div style={{ background:'linear-gradient(135deg,#005f5f,#00c853)', borderRadius:18, padding:'18px 20px', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:14 }}>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>#{myStats?.rank ?? '--'}</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>Your rank of {myStats?.totalUsers ?? '--'}</p>
        </div>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{myStats?.aheadOfCount ?? 0}</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>Athletes you're ahead of</p>
        </div>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{totals.favoriteSport || '--'}</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>Strongest sport</p>
        </div>
        <div>
          <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{monthDelta !== null ? `${monthDelta > 0 ? '+' : ''}${monthDelta}%` : '--'}</p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>This month vs last</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Distance by Sport</p>
          {myStats?.sportBreakdown?.length > 0
            ? <SportBarChart data={myStats.sportBreakdown.map(s => ({ _id: s._id, totalKm: s.totalKm }))} />
            : <p style={{ fontSize:13, color:'#9aaab8', textAlign:'center', padding:'40px 0' }}>Log an activity to see this chart.</p>}
        </div>

        <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Monthly Distance (km)</p>
          {myStats?.monthlyDistance?.length > 0
            ? <TrendLineChart data={myStats.monthlyDistance} field="km" unit=" km" />
            : <p style={{ fontSize:13, color:'#9aaab8', textAlign:'center', padding:'40px 0' }}>Log an activity to see this chart.</p>}
        </div>

        <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Activity Frequency (last 7 days)</p>
          <WeeklyFrequencyChart data={myStats?.weeklyFrequency || []} />
        </div>

        <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
          <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Calories Trend</p>
          {myStats?.monthlyDistance?.length > 0
            ? <TrendLineChart data={myStats.monthlyDistance} field="calories" color1="#d4880a" color2="#ffb84d" unit=" kcal" />
            : <p style={{ fontSize:13, color:'#9aaab8', textAlign:'center', padding:'40px 0' }}>Log an activity to see this chart.</p>}
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:18, padding:'14px 18px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4', display:'flex', justifyContent:'space-around', textAlign:'center' }}>
        <div><p style={{ fontSize:15, fontWeight:800, color:'#1a1a2e' }}>{totals.avgPace || '--:--'}</p><p style={{ fontSize:10, color:'#9aaab8' }}>Avg pace /km</p></div>
        <div><p style={{ fontSize:15, fontWeight:800, color:'#1a1a2e' }}>{totals.avgSpeedKmh || 0} km/h</p><p style={{ fontSize:10, color:'#9aaab8' }}>Avg speed</p></div>
      </div>
    </div>
  )

  const LeaderboardContent = (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ background:'linear-gradient(135deg,#005f5f,#00c853)', borderRadius:18, padding:'16px 20px', marginBottom:6 }}>
        <p style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, letterSpacing:.5 }}>YOUR RANK</p>
        <p style={{ fontSize:32, fontWeight:800, color:'#fff', lineHeight:1.1 }}>#{myStats?.rank ?? '--'}</p>
        <p style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:4 }}>{myStats?.totalUsers ? `Out of ${myStats.totalUsers} athletes` : ''}</p>
      </div>

      {usingDemoLeaders && (
        <p style={{ fontSize:11, color:'#9aaab8', textAlign:'center' }}>Showing sample athletes — real rankings will appear as VISION members log activities.</p>
      )}

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:10 }}>
        {shownLeaders.map((l, i) => (
          <button key={l._id} onClick={() => onOpenProfile?.(l._id)} style={{ background:'#fff', borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4', cursor:'pointer', textAlign:'left' }}>
            <span style={{ fontSize:15, fontWeight:800, color: i===0 ? '#f59e0b' : i===1 ? '#94a3b8' : i===2 ? '#d97706' : '#9aaab8', width:22, textAlign:'center', flexShrink:0 }}>
              {i < 3 ? ['🥇','🥈','🥉'][i] : `#${l.rank}`}
            </span>
            <img src={l.avatarUrl} alt={l.fullName} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #e8f4f4', flexShrink:0 }} onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(l.fullName)}&background=008080&color=fff`}} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.fullName}</p>
              <p style={{ fontSize:11, color:'#9aaab8' }}>@{l.username}{l.favoriteSport ? ` · ${l.favoriteSport}` : ''}</p>
            </div>
            <Sparkline values={l.sparkline} color={SPORT_COLOR[l.favoriteSport] || '#008080'} />
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <p style={{ fontSize:15, fontWeight:800, color:'#008080' }}>{l.totalKm.toFixed(1)}</p>
              <p style={{ fontSize:10, color:'#9aaab8' }}>km · {l.totalActivities}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{ background:'#F0FAFA', minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #e8f4f4', borderTopColor:'#008080', animation:'spin .8s linear infinite' }} />
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div style={{ padding:'40px 24px 60px' }}>
        {Header}
        {TabBar}
        {statsTab === 'personal' ? PersonalContent : LeaderboardContent}
      </div>
    )
  }

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:32 }}>
      {Header}
      {TabBar}
      <div style={{ padding:'0 16px' }}>
        {statsTab === 'personal' ? PersonalContent : LeaderboardContent}
      </div>
    </div>
  )
}
