import { useState, useEffect, useRef } from 'react'
import { ajax } from '../../lib/ajaxClient'

const DEMO_SPORTS = [
  { _id:'Running', totalKm:142.4, sessions:18 },
  { _id:'Cycling', totalKm:312.8, sessions:9  },
  { _id:'Hiking',  totalKm:48.6,  sessions:5  },
  { _id:'Swimming',totalKm:12.2,  sessions:8  },
]

const DEMO_MONTHS = [
  { month:'Jan', km:38  },{ month:'Feb', km:55  },{ month:'Mar', km:72  },
  { month:'Apr', km:68  },{ month:'May', km:91  },{ month:'Jun', km:104 },
  { month:'Jul', km:87  },{ month:'Aug', km:115 },{ month:'Sep', km:98  },
  { month:'Oct', km:120 },{ month:'Nov', km:88  },{ month:'Dec', km:64  },
]

const DEMO_LEADERS = [
  { rank:1, name:'Marcus Chen',     username:'marcus_runs',  km:842.4, avatar:'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80' },
  { rank:2, name:'Sara Valeri',     username:'sara_cycles',  km:734.1, avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80' },
  { rank:3, name:'Leo Brooks',      username:'leo_trails',   km:621.8, avatar:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80' },
  { rank:4, name:'Nadia Kowalski',  username:'nadia_tri',    km:589.2, avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80' },
  { rank:5, name:'Amara Diallo',    username:'amara_sprints',km:512.0, avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80' },
]

function SportBarChart({ data = [] }) {
  const svgRef = useRef(null)
  useEffect(() => {
    if (!data.length) return
    import('d3').then(d3 => {
      const W = svgRef.current?.clientWidth || 320, H = 180
      const PAD = { top:10, right:10, bottom:40, left:44 }
      d3.select(svgRef.current).selectAll('*').remove()
      const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`)
      const x = d3.scaleBand().domain(data.map(d=>d._id)).range([PAD.left, W-PAD.right]).padding(0.3)
      const y = d3.scaleLinear().domain([0, d3.max(data, d=>d.totalKm)*1.1]).range([H-PAD.bottom, PAD.top])
      svg.append('g').attr('transform',`translate(0,${H-PAD.bottom})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove()
      svg.append('g').attr('transform',`translate(${PAD.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d=>`${d}km`).tickSize(-W+PAD.left+PAD.right)).select('.domain').remove()
      svg.selectAll('.tick line').attr('stroke','rgba(0,128,128,.08)')
      svg.selectAll('.tick text').attr('fill','#9aaab8').attr('font-size',10).attr('font-family','Inter, sans-serif')
      const defs = svg.append('defs')
      data.forEach((d, i) => {
        const gid=`bg${i}`
        const grad = defs.append('linearGradient').attr('id',gid).attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%')
        grad.append('stop').attr('offset','0%').attr('stop-color','#00E676')
        grad.append('stop').attr('offset','100%').attr('stop-color','#008080')
        svg.append('rect').attr('x',x(d._id)).attr('y',y(d.totalKm)).attr('width',x.bandwidth()).attr('height',H-PAD.bottom-y(d.totalKm)).attr('rx',6).attr('fill',`url(#${gid})`)
        svg.append('text').attr('x',x(d._id)+x.bandwidth()/2).attr('y',y(d.totalKm)-4).attr('text-anchor','middle').attr('font-size',9).attr('font-weight',700).attr('fill','#008080').attr('font-family','Inter, sans-serif').text(`${Math.round(d.totalKm)}`)
      })
    })
  }, [data])
  return <svg ref={svgRef} width="100%" height="180" />
}

function MonthlyLineChart({ data = [] }) {
  const svgRef = useRef(null)
  useEffect(() => {
    if (!data.length) return
    import('d3').then(d3 => {
      const W = svgRef.current?.clientWidth || 320, H = 160
      const PAD = { top:10, right:16, bottom:32, left:44 }
      d3.select(svgRef.current).selectAll('*').remove()
      const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${W} ${H}`)
      const x = d3.scalePoint().domain(data.map(d=>d.month)).range([PAD.left, W-PAD.right])
      const y = d3.scaleLinear().domain([0, d3.max(data, d=>d.km)*1.1]).range([H-PAD.bottom, PAD.top])
      svg.append('g').attr('transform',`translate(0,${H-PAD.bottom})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove()
      svg.append('g').attr('transform',`translate(${PAD.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d=>`${d}`).tickSize(-W+PAD.left+PAD.right)).select('.domain').remove()
      svg.selectAll('.tick line').attr('stroke','rgba(0,128,128,.08)')
      svg.selectAll('.tick text').attr('fill','#9aaab8').attr('font-size',10).attr('font-family','Inter, sans-serif')
      const defs = svg.append('defs')
      const grad = defs.append('linearGradient').attr('id','lGrad').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%')
      grad.append('stop').attr('offset','0%').attr('stop-color','#008080')
      grad.append('stop').attr('offset','100%').attr('stop-color','#00E676')
      const areaGrad = defs.append('linearGradient').attr('id','aGrad').attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%')
      areaGrad.append('stop').attr('offset','0%').attr('stop-color','rgba(0,230,118,.18)')
      areaGrad.append('stop').attr('offset','100%').attr('stop-color','rgba(0,230,118,0)')
      const area = d3.area().x(d=>x(d.month)).y0(H-PAD.bottom).y1(d=>y(d.km)).curve(d3.curveCatmullRom)
      const line = d3.line().x(d=>x(d.month)).y(d=>y(d.km)).curve(d3.curveCatmullRom)
      svg.append('path').datum(data).attr('d',area).attr('fill','url(#aGrad)')
      svg.append('path').datum(data).attr('d',line).attr('fill','none').attr('stroke','url(#lGrad)').attr('stroke-width',2.5).attr('stroke-linecap','round')
    })
  }, [data])
  return <svg ref={svgRef} width="100%" height="160" />
}

export default function Stats({ user, onBack }) {
  const [statsTab,   setStatsTab]   = useState('personal')
  const [sportData,  setSportData]  = useState(DEMO_SPORTS)
  const [monthData,  setMonthData]  = useState(DEMO_MONTHS)
  const [leaders,    setLeaders]    = useState(DEMO_LEADERS)
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    setLoading(true)
    ajax.getStats()
      .then(data => {
        if (data.bySport?.length) setSportData(data.bySport)
        if (data.byMonth?.length) setMonthData(data.byMonth)
      })
      .catch(() => {})
    ajax.getGlobalStats()
      .then(data => { if (data.leaders?.length) setLeaders(data.leaders) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalKm     = sportData.reduce((s, d) => s + d.totalKm, 0)
  const totalSes    = sportData.reduce((s, d) => s + d.sessions, 0)

  return (
    <div style={{ background:'#F0FAFA', minHeight:'100%', paddingBottom:32 }}>
      <div style={{ padding:'52px 16px 16px', display:'flex', alignItems:'center', gap:12 }}>
        {onBack && (
          <button onClick={onBack} style={{ width:36, height:36, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,128,128,.08)', border:'none', cursor:'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1a1a2e' }}>Stats</h1>
      </div>

      <div style={{ display:'flex', gap:0, margin:'0 16px 20px', background:'#fff', borderRadius:14, padding:4, boxShadow:'0 2px 8px rgba(0,128,128,.06)' }}>
        {['personal','leaderboard'].map(t => (
          <button key={t} onClick={() => setStatsTab(t)} style={{ flex:1, height:38, borderRadius:10, background: statsTab===t ? 'linear-gradient(135deg,#008080,#00c853)' : 'transparent', color: statsTab===t ? '#fff' : '#9aaab8', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize', transition:'all .2s' }}>
            {t === 'personal' ? 'My Stats' : 'Leaderboard'}
          </button>
        ))}
      </div>

      {statsTab === 'personal' && (
        <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'Total Distance', val:`${totalKm.toFixed(1)} km`, sub:'all time' },
              { label:'Activities', val:totalSes, sub:'sessions' },
              { label:'This Month', val:`${DEMO_MONTHS[new Date().getMonth()]?.km || 0} km`, sub:'distance' },
              { label:'Avg per session', val:`${totalSes ? (totalKm/totalSes).toFixed(1) : 0} km`, sub:'average' },
            ].map(({ label, val, sub }) => (
              <div key={label} style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
                <p style={{ fontSize:11, color:'#9aaab8', fontWeight:600, marginBottom:6 }}>{label.toUpperCase()}</p>
                <p style={{ fontSize:22, fontWeight:800, color:'#1a1a2e' }}>{val}</p>
                <p style={{ fontSize:11, color:'#9aaab8', marginTop:2 }}>{sub}</p>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Distance by Sport</p>
            <SportBarChart data={sportData} />
          </div>

          <div style={{ background:'#fff', borderRadius:18, padding:'16px 14px', boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:14 }}>Monthly Distance (km)</p>
            <MonthlyLineChart data={monthData} />
          </div>
        </div>
      )}

      {statsTab === 'leaderboard' && (
        <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ background:'linear-gradient(135deg,#005f5f,#00c853)', borderRadius:18, padding:'16px 20px', marginBottom:6 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, letterSpacing:.5 }}>YOUR RANK</p>
            <p style={{ fontSize:32, fontWeight:800, color:'#fff', lineHeight:1.1 }}>#14</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:4 }}>Top 15% of all athletes</p>
          </div>
          {leaders.map((l, i) => (
            <div key={l.rank} style={{ background:'#fff', borderRadius:16, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 2px 8px rgba(0,128,128,.06)', border:'1px solid #e8f4f4' }}>
              <span style={{ fontSize:16, fontWeight:800, color: i===0 ? '#f59e0b' : i===1 ? '#94a3b8' : i===2 ? '#d97706' : '#9aaab8', width:24, textAlign:'center', flexShrink:0 }}>
                {i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : `#${l.rank}`}
              </span>
              <img src={l.avatar} alt={l.name} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2px solid #e8f4f4', flexShrink:0 }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80'}} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#1a1a2e' }}>{l.name}</p>
                <p style={{ fontSize:11, color:'#9aaab8' }}>@{l.username}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:15, fontWeight:800, color:'#008080' }}>{l.km.toFixed(1)}</p>
                <p style={{ fontSize:10, color:'#9aaab8' }}>km total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
