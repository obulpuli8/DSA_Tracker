import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Save, User, Target, Zap, BookOpen, Loader2 } from 'lucide-react';

const ALL_TOPICS = [
  'Array','String','Linked List','Stack','Queue','Tree','Graph',
  'Dynamic Programming','Greedy','Binary Search','Two Pointers',
  'Sliding Window','Recursion','Backtracking','Sorting','Hashing',
  'Heap','Trie','Math','Bit Manipulation'
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    targetProblems: user?.targetProblems || 100,
    dailyGoal: user?.dailyGoal || 3,
    preferredTopics: user?.preferredTopics || [],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      preferredTopics: f.preferredTopics.includes(topic)
        ? f.preferredTopics.filter(t => t !== topic)
        : [...f.preferredTopics, topic]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.slice(0,2).toUpperCase() || 'U';

  return (
    <div className="page-container" style={{ maxWidth:800 }}>
      <motion.div className="page-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Customize your tracking preferences</p>
        </div>
      </motion.div>

      {/* Avatar card */}
      <motion.div className="glass-card" style={{ padding:32, marginBottom:24, display:'flex', alignItems:'center', gap:24 }}
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <motion.div
          style={{ width:80, height:80, borderRadius:'50%', background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'white', boxShadow:'0 8px 25px rgba(108,99,255,0.4)', flexShrink:0 }}
          whileHover={{ scale:1.05, rotate:5 }}
        >
          {initials}
        </motion.div>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)' }}>{user?.username}</div>
          <div style={{ fontSize:14, color:'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })}
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
          {/* Basic Info */}
          <motion.div className="glass-card" style={{ padding:24 }} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <User size={16} style={{ color:'var(--accent-primary)' }} /> Basic Info
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about your DSA journey…" style={{ minHeight:90 }} />
              </div>
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div className="glass-card" style={{ padding:24 }} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Target size={16} style={{ color:'var(--accent-success)' }} /> Goals
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Target Problems</label>
                <input className="form-input" type="number" name="targetProblems" value={form.targetProblems} onChange={handleChange} min="1" max="5000" />
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Total problems you want to solve</span>
              </div>
              <div className="form-group">
                <label className="form-label">Daily Goal</label>
                <input className="form-input" type="number" name="dailyGoal" value={form.dailyGoal} onChange={handleChange} min="1" max="50" />
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Problems per day target</span>
              </div>

              {/* Mini preview */}
              <div style={{ background:'var(--bg-glass)', borderRadius:'var(--radius-md)', padding:14, marginTop:4 }}>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>Daily goal preview</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {[...Array(Math.min(form.dailyGoal, 10))].map((_,i) => (
                    <motion.div key={i} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: i*0.05 }}
                      style={{ width:20, height:20, borderRadius:4, background:'var(--gradient-primary)' }} />
                  ))}
                  {form.dailyGoal > 10 && <span style={{ fontSize:12, color:'var(--text-muted)' }}>+{form.dailyGoal-10} more</span>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Preferred Topics */}
        <motion.div className="glass-card" style={{ padding:24, marginBottom:24 }} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <BookOpen size={16} style={{ color:'var(--accent-secondary)' }} /> Preferred Topics
            <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>(used for recommendations)</span>
          </h3>
          <div className="topic-tags">
            {ALL_TOPICS.map(topic => (
              <motion.button
                key={topic} type="button"
                className={`topic-tag ${form.preferredTopics.includes(topic) ? 'selected' : ''}`}
                onClick={() => toggleTopic(topic)}
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              >
                {topic}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            whileHover={{ scale:loading?1:1.03 }}
            whileTap={{ scale:loading?1:0.97 }}
          >
            {loading
              ? <><Loader2 size={18} style={{ animation:'spin 0.8s linear infinite' }} /> Saving…</>
              : <><Save size={18} /> Save Changes</>
            }
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
