import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Code2, Flame, Target, Clock, TrendingUp, CheckCircle2,
  RotateCcw, AlertCircle, Plus, ArrowRight, Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const COLORS = ['#6c63ff', '#ffb347', '#ff4757', '#00e5a0', '#00d4ff'];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25,0.46,0.45,0.94] } }
};

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
};

const ProgressRing = ({ value, max, size = 120, stroke = 10, color = 'var(--accent-primary)' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((value / max) * 100, 100);
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(108,99,255,0.15)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="progress-ring-text">
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{pct.toFixed(0)}%</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>target</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/insights')
      .then(res => setInsights(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card" style={{ height: 100, background: 'var(--bg-glass)' }}>
              <motion.div
                style={{ height: 3, background: 'var(--gradient-primary)', width: '40%', marginBottom: 8 }}
                animate={{ width: ['10%','90%','10%'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ov = insights?.overview || {};
  const streak = insights?.streak || {};

  const stats = [
    { label: 'Problems Solved', value: ov.solved || 0, icon: CheckCircle2, color: '#00e5a0', bg: 'rgba(0,229,160,0.1)' },
    { label: 'Current Streak', value: streak.current || 0, icon: Flame, color: '#ff6b35', bg: 'rgba(255,107,53,0.1)', suffix: '🔥' },
    { label: 'Total Problems', value: ov.total || 0, icon: Code2, color: '#6c63ff', bg: 'rgba(108,99,255,0.1)' },
    { label: 'Avg. Time (min)', value: ov.avgTime || 0, icon: Clock, color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    { label: "Today's Count", value: ov.todayCount || 0, icon: Zap, color: '#ffb347', bg: 'rgba(255,179,71,0.1)' },
    { label: 'To Revisit', value: ov.revisit || 0, icon: RotateCcw, color: '#ff6b9d', bg: 'rgba(255,107,157,0.1)' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.username}! Keep crushing it 💪</p>
        </div>
        <motion.button className="btn btn-primary" onClick={() => navigate('/add-problem')} whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
          <Plus size={18} /> Add Problem
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stats-grid" variants={staggerContainer} initial="hidden" animate="show">
        {stats.map((stat, i) => (
          <motion.div key={i} className="glass-card stat-card" variants={fadeUp} whileHover={{ y: -4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div
                  className="stat-value"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <AnimatedCounter value={stat.value} />
                  {stat.suffix}
                </div>
              </div>
              <div className="stat-icon" style={{ background: stat.bg }}>
                <stat.icon size={22} color={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Streak + Progress + Daily Goal */}
      <motion.div className="charts-grid" variants={staggerContainer} initial="hidden" animate="show">
        {/* Streak */}
        <motion.div className="glass-card streak-card" variants={fadeUp}>
          <div style={{ fontSize: 52 }}>
            <motion.span animate={{ scale:[1,1.1,1] }} transition={{ duration:1.5, repeat:Infinity }}>🔥</motion.span>
          </div>
          <div>
            <div className="streak-number">{streak.current || 0}</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Day Streak</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Longest: <strong style={{ color: 'var(--accent-warning)' }}>{streak.longest || 0}</strong> days
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
            <ProgressRing value={ov.solved || 0} max={ov.targetProblems || 100} size={110} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {ov.solved}/{ov.targetProblems} target
            </div>
          </div>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div className="glass-card chart-card" variants={fadeUp}>
          <div className="chart-title">
            <Target size={18} style={{ color: 'var(--accent-primary)' }} />
            Difficulty Breakdown
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={insights?.difficultyDist || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" animationBegin={400} animationDuration={800}>
                {(insights?.difficultyDist || []).map((_, i) => (
                  <Cell key={i} fill={['#00e5a0','#ffb347','#ff4757'][i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Velocity Chart */}
      <motion.div className="glass-card chart-card" style={{ marginBottom: 24 }} variants={fadeUp} initial="hidden" animate="show">
        <div className="chart-title">
          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
          Weekly Velocity (Last 12 Weeks)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={insights?.velocityData || []}>
            <defs>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill:'var(--text-muted)', fontSize:12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'var(--text-muted)', fontSize:12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:8, color:'var(--text-primary)' }} />
            <Area type="monotone" dataKey="count" stroke="#6c63ff" strokeWidth={2} fill="url(#velocityGrad)" dot={{ fill:'#6c63ff', r:4 }} activeDot={{ r:6, fill:'#00d4ff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recommendations + Recent Activity */}
      <div className="charts-grid">
        {/* Smart Recommendations */}
        <motion.div className="glass-card chart-card" variants={fadeUp} initial="hidden" animate="show">
          <div className="chart-title">
            <Zap size={18} style={{ color: 'var(--accent-warning)' }} />
            Smart Insights
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(insights?.recommendations || []).length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div style={{ fontSize: 32 }}>🎯</div>
                <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Add more problems to unlock insights!</p>
              </div>
            ) : (
              (insights?.recommendations || []).map((r, i) => (
                <motion.div
                  key={i}
                  className={`recommendation-item priority-${r.priority}`}
                  initial={{ opacity:0, x:-10 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="recommendation-icon">{r.icon}</span>
                  <div>
                    <div className="recommendation-title">{r.title}</div>
                    <div className="recommendation-msg">{r.message}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="glass-card chart-card" variants={fadeUp} initial="hidden" animate="show">
          <div className="chart-title" style={{ justifyContent:'space-between' }}>
            <span><AlertCircle size={18} style={{ color:'var(--accent-secondary)' }} /> Recent Activity</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/problems')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="problem-list">
            {(insights?.recentActivity || []).slice(0,5).map((p, i) => (
              <motion.div
                key={p._id}
                className="problem-row"
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate('/problems')}
              >
                <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color:'var(--text-primary)' }} className="truncate">{p.title}</span>
                <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                  {formatDistanceToNow(new Date(p.solvedAt), { addSuffix: true })}
                </span>
              </motion.div>
            ))}
            {(insights?.recentActivity || []).length === 0 && (
              <div className="empty-state" style={{ padding:24 }}>
                <div style={{ fontSize:32 }}>📝</div>
                <p style={{ color:'var(--text-secondary)', fontSize:13 }}>No problems yet. Start tracking!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div className="glass-card chart-card" style={{ marginTop: 24 }} variants={fadeUp} initial="hidden" animate="show">
        <div className="chart-title">
          <Flame size={18} style={{ color: '#ff6b35' }} />
          Activity Heatmap (Last Year)
        </div>
        <div className="heatmap-wrapper">
          <CalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={insights?.heatmap || []}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-scale-2';
              if (value.count === 1) return 'color-scale-1';
              if (value.count === 2) return 'color-scale-2';
              if (value.count <= 4) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value) => ({
              'data-tip': value?.date ? `${value.date}: ${value.count} problem(s)` : 'No activity',
            })}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
