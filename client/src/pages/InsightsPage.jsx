import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { Brain, AlertTriangle, TrendingUp, Target, Clock, Zap, BarChart3 } from 'lucide-react';

const COLORS = ['#6c63ff','#00d4ff','#00e5a0','#ffb347','#ff4757','#ff6b9d','#9b59b6'];

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.1 } } };
const fadeUp = { hidden:{ opacity:0, y:30 }, show:{ opacity:1, y:0, transition:{ duration:0.6, ease:[0.25,0.46,0.45,0.94] } } };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:10, padding:'10px 16px' }}>
      <p style={{ color:'var(--text-secondary)', fontSize:12, marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color || 'var(--accent-primary)', fontWeight:700, fontSize:14 }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

const InsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen" style={{ position:'relative', height:400, background:'transparent' }}>
          <div className="spinner" />
          <p style={{ color:'var(--text-secondary)' }}>Generating insights…</p>
        </div>
      </div>
    );
  }

  const topicRadarData = (data?.topicStats || []).slice(0,8).map(t => ({
    topic: t.topic.length > 10 ? t.topic.slice(0,10)+'…' : t.topic,
    solved: t.solved,
    total: t.total,
  }));

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
        <div>
          <h1 className="page-title">Smart Insights</h1>
          <p className="page-subtitle">AI-powered analysis of your DSA journey</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:'var(--radius-full)', padding:'8px 16px' }}>
          <Brain size={18} style={{ color:'var(--accent-primary)' }} />
          <span style={{ fontSize:14, color:'var(--accent-primary)', fontWeight:600 }}>Smart Engine Active</span>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div className="glass-card chart-card" style={{ marginBottom:24 }} variants={fadeUp} initial="hidden" animate="show">
        <div className="chart-title">
          <Zap size={18} style={{ color:'var(--accent-warning)' }} /> Smart Recommendations
        </div>
        {(data?.recommendations || []).length === 0 ? (
          <div className="empty-state" style={{ padding:32 }}>
            <div style={{ fontSize:48 }}>🎯</div>
            <div className="empty-state-title">No recommendations yet</div>
            <div className="empty-state-desc">Solve more problems to unlock personalized insights!</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:12 }}>
            {(data?.recommendations || []).map((r, i) => (
              <motion.div
                key={i}
                className={`recommendation-item priority-${r.priority}`}
                initial={{ opacity:0, scale:0.9 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay: i*0.1 }}
                whileHover={{ y:-2 }}
              >
                <span className="recommendation-icon" style={{ fontSize:28 }}>{r.icon}</span>
                <div>
                  <div className="recommendation-title">{r.title}</div>
                  <div className="recommendation-msg">{r.message}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Weakness Detection */}
      {(data?.weaknesses || []).length > 0 && (
        <motion.div className="glass-card chart-card" style={{ marginBottom:24 }} variants={fadeUp} initial="hidden" animate="show">
          <div className="chart-title">
            <AlertTriangle size={18} style={{ color:'var(--accent-danger)' }} /> Weakness Analysis
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {(data?.weaknesses || []).map((w, i) => (
              <motion.div
                key={w.topic}
                initial={{ opacity:0, x:-20 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.1 }}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 16px', background:'var(--bg-glass)', borderRadius:'var(--radius-md)', border:'1px solid rgba(255,71,87,0.2)' }}
              >
                <div style={{ minWidth:100, fontWeight:700, color:'var(--text-primary)' }}>{w.topic}</div>
                <div style={{ flex:1, height:8, background:'rgba(255,71,87,0.15)', borderRadius:999 }}>
                  <motion.div
                    style={{ height:'100%', background:'linear-gradient(90deg,#ff4757,#ff6b9d)', borderRadius:999 }}
                    initial={{ width:0 }}
                    animate={{ width:`${w.weaknessScore}%` }}
                    transition={{ duration:1, ease:'easeOut', delay: i*0.1 + 0.2 }}
                  />
                </div>
                <div style={{ minWidth:60, textAlign:'right' }}>
                  <span style={{ color:'var(--accent-danger)', fontWeight:700, fontSize:14 }}>{w.weaknessScore}%</span>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{w.unresolved}/{w.total} pending</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom:24 }}>
        {/* Topic Radar */}
        <motion.div className="glass-card chart-card" variants={fadeUp} initial="hidden" animate="show">
          <div className="chart-title"><Target size={18} style={{ color:'var(--accent-primary)' }} /> Topic Mastery Radar</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={topicRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="topic" tick={{ fill:'var(--text-muted)', fontSize:10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Total" dataKey="total" stroke="rgba(108,99,255,0.4)" fill="rgba(108,99,255,0.15)" />
              <Radar name="Solved" dataKey="solved" stroke="#6c63ff" fill="rgba(108,99,255,0.3)" />
              <Legend iconType="circle" iconSize={10} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div className="glass-card chart-card" variants={fadeUp} initial="hidden" animate="show">
          <div className="chart-title"><BarChart3 size={18} style={{ color:'var(--accent-secondary)' }} /> Platform Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data?.platformDist || []} cx="50%" cy="50%" outerRadius={100} dataKey="value" animationBegin={300} animationDuration={1000} paddingAngle={3}>
                {(data?.platformDist || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Time Productivity */}
      <motion.div className="glass-card chart-card" style={{ marginBottom:24 }} variants={fadeUp} initial="hidden" animate="show">
        <div className="chart-title"><Clock size={18} style={{ color:'var(--accent-success)' }} /> Time-of-Day Productivity</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data?.timeProductivity || []}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c63ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="url(#barGrad)" radius={[4,4,0,0]} name="Problems" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Topic Stats Table */}
      <motion.div className="glass-card chart-card" variants={fadeUp} initial="hidden" animate="show">
        <div className="chart-title"><TrendingUp size={18} style={{ color:'var(--accent-primary)' }} /> Topic Performance</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border-color)' }}>
                {['Topic','Total','Solved','Revisit','Solve Rate','Avg Time'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'var(--text-muted)', fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.topicStats || []).map((t, i) => (
                <motion.tr
                  key={t.topic}
                  style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                  initial={{ opacity:0, x:-10 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: i*0.05 }}
                  whileHover={{ background:'var(--bg-glass)' }}
                >
                  <td style={{ padding:'12px 14px', fontWeight:600, color:'var(--text-primary)' }}>{t.topic}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text-secondary)' }}>{t.total}</td>
                  <td style={{ padding:'12px 14px', color:'var(--accent-success)' }}>{t.solved}</td>
                  <td style={{ padding:'12px 14px', color:'var(--accent-warning)' }}>{t.revisit}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:60, height:6, background:'rgba(108,99,255,0.15)', borderRadius:999 }}>
                        <div style={{ width:`${t.solveRate}%`, height:'100%', background:`linear-gradient(90deg, ${t.solveRate >= 70 ? '#00e5a0' : t.solveRate >= 40 ? '#ffb347' : '#ff4757'}, transparent)`, borderRadius:999 }} />
                      </div>
                      <span style={{ color: t.solveRate >= 70 ? 'var(--accent-success)' : t.solveRate >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)', fontWeight:700 }}>
                        {t.solveRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', color:'var(--text-secondary)' }}>{t.avgTime ? `${t.avgTime}m` : '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {(data?.topicStats || []).length === 0 && (
            <div className="empty-state" style={{ padding:48 }}>
              <div style={{ fontSize:40 }}>📊</div>
              <div className="empty-state-title">No data yet</div>
              <div className="empty-state-desc">Start logging problems to see your topic performance!</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsPage;
