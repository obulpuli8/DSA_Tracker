import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon:'📊', title:'Visual Analytics', desc:'Stunning charts tracking your progress — velocity, difficulty spread, and more.' },
  { icon:'🧠', title:'Smart Insights', desc:'AI-powered weakness detection and personalized recommendations.' },
  { icon:'🔥', title:'Streak Tracking', desc:'Daily solve streaks with GitHub-style heatmap to keep you consistent.' },
  { icon:'🎯', title:'Goal Setting', desc:'Set daily and total targets. Track your journey to interview-readiness.' },
  { icon:'🔍', title:'Smart Filters', desc:'Filter by topic, difficulty, platform, and status instantly.' },
  { icon:'⚡', title:'Multi-Platform', desc:'Track LeetCode, Codeforces, GFG, HackerRank and more in one place.' },
];

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        {[...Array(6)].map((_,i) => (
          <motion.div
            key={i}
            style={{
              position:'absolute',
              width: `${200+i*100}px`, height:`${200+i*100}px`,
              borderRadius:'50%',
              background: i%2===0
                ? 'radial-gradient(circle,rgba(108,99,255,0.12),transparent)'
                : 'radial-gradient(circle,rgba(0,212,255,0.08),transparent)',
              left:`${5+i*17}%`, top:`${10+i*12}%`,
            }}
            animate={{ x:[0,40,-30,0], y:[0,-40,30,0], scale:[1,1.1,0.9,1] }}
            transition={{ duration:10+i*2, repeat:Infinity, ease:'easeInOut' }}
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        style={{ position:'fixed', top:0, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 40px', background:'rgba(5,11,21,0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border-color)', zIndex:100 }}
        initial={{ y:-80 }} animate={{ y:0 }} transition={{ duration:0.5 }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'var(--gradient-primary)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚡</div>
          <span style={{ fontSize:18, fontWeight:800, background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>AlgoTrack</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {user ? (
            <motion.button className="btn btn-primary" onClick={() => navigate('/dashboard')} whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
              Go to Dashboard →
            </motion.button>
          ) : (
            <>
              <motion.button className="btn btn-ghost" onClick={() => navigate('/login')} whileHover={{ scale:1.03 }}>Sign In</motion.button>
              <motion.button className="btn btn-primary" onClick={() => navigate('/login')} whileHover={{ scale:1.05 }}>Get Started →</motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="hero" style={{ paddingTop:140 }}>
        <motion.div className="hero-badge" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <span>✨</span> Smart DSA Progress Tracking
        </motion.div>

        <motion.h1 className="hero-title" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
          Track your DSA journey<br />
          <span className="gradient-text">with intelligence</span>
        </motion.h1>

        <motion.p className="hero-desc" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
          AlgoTrack combines beautiful analytics, streak tracking, and AI-powered insights to help you solve DSA problems smarter — and get that dream offer.
        </motion.p>

        <motion.div className="hero-actions" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}>
          <motion.button className="btn btn-primary btn-lg" onClick={() => navigate('/login')} whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
            🚀 Start Tracking Free
          </motion.button>
          <motion.button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')} whileHover={{ scale:1.03 }}>
            Sign In →
          </motion.button>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          style={{ display:'flex', gap:32, marginTop:60, flexWrap:'wrap', justifyContent:'center' }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
        >
          {[['2500+','Problems Catalogued'], ['50+','DSA Topics'], ['7','Smart Insights']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:900, background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{n}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', padding:'0 40px 40px' }}>
          <h2 style={{ fontSize:36, fontWeight:800, color:'var(--text-primary)', marginBottom:12 }}>Everything you need</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:16 }}>Built for serious DSA practitioners who want to win</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card feature-card"
              initial={{ opacity:0, y:40 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ delay: i*0.1, duration:0.5 }}
              whileHover={{ y:-6, boxShadow:'var(--shadow-glow)' }}
            >
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign:'center', padding:'80px 40px', position:'relative', zIndex:1 }}>
        <motion.div
          className="glass-card"
          style={{ maxWidth:600, margin:'0 auto', padding:48, background:'var(--gradient-card)' }}
          initial={{ opacity:0, scale:0.9 }}
          whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }}
          transition={{ duration:0.5 }}
        >
          <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
          <h2 style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', marginBottom:12 }}>Ready to level up?</h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:24 }}>Join thousands of engineers tracking their DSA progress smarter.</p>
          <motion.button className="btn btn-primary btn-lg" onClick={() => navigate('/login')} whileHover={{ scale:1.05 }}>
            🚀 Get Started — It's Free
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign:'center', padding:'24px', borderTop:'1px solid var(--border-color)', color:'var(--text-muted)', fontSize:13, position:'relative', zIndex:1 }}>
        © 2024 AlgoTrack — Built with ⚡ for DSA warriors
      </footer>
    </div>
  );
};

export default LandingPage;
