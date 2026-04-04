import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Loader2, Plus, X } from 'lucide-react';

const PLATFORMS = ['LeetCode','Codeforces','GeeksForGeeks','HackerRank','AtCoder','CodeChef','Other'];
const DIFFICULTIES = ['Easy','Medium','Hard'];
const STATUSES = ['Solved','Attempted','Revisit'];
const APPROACHES = ['Not Set','Brute Force','Optimal','Space Optimized'];

const ALL_TOPICS = [
  'Array','String','Linked List','Stack','Queue','Tree','Graph',
  'Dynamic Programming','Greedy','Binary Search','Two Pointers',
  'Sliding Window','Recursion','Backtracking','Sorting','Hashing',
  'Heap','Trie','Math','Bit Manipulation','Matrix','Divide & Conquer',
  'Segment Tree','Union Find','Monotonic Stack','BFS','DFS'
];

const defaultForm = {
  title:'', platform:'LeetCode', difficulty:'Medium', topics:[], status:'Solved',
  notes:'', timeTaken:'', problemUrl:'', approach:'Not Set',
  complexity:{ time:'', space:'' }, solvedAt: new Date().toISOString().slice(0,16)
};

const AddProblem = () => {
  const location = useLocation();
  const editProblem = location.state?.problem;
  const [form, setForm] = useState(
    editProblem
      ? { ...editProblem, solvedAt: new Date(editProblem.solvedAt).toISOString().slice(0,16), timeTaken: editProblem.timeTaken || '' }
      : defaultForm
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('complexity.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, complexity: { ...f.complexity, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      topics: f.topics.includes(topic)
        ? f.topics.filter(t => t !== topic)
        : [...f.topics, topic]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.topics.length === 0) { toast.error('Select at least one topic!'); return; }
    setLoading(true);
    try {
      const payload = { ...form, timeTaken: Number(form.timeTaken) || 0 };
      if (editProblem) {
        await api.put(`/problems/${editProblem._id}`, payload);
        toast.success('Problem updated! ✅');
      } else {
        await api.post('/problems', payload);
        toast.success('Problem added! 🎉');
      }
      navigate('/problems');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const diffColors = { Easy:'var(--accent-easy)', Medium:'var(--accent-medium)', Hard:'var(--accent-hard)' };
  const statusColors = { Solved:'var(--accent-success)', Attempted:'var(--accent-primary)', Revisit:'var(--accent-warning)' };

  return (
    <div className="page-container" style={{ maxWidth:900 }}>
      <motion.div className="page-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{editProblem ? 'Edit Problem' : 'Add Problem'}</h1>
          <p className="page-subtitle">{editProblem ? 'Update your solution details' : 'Log a new DSA problem you solved'}</p>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Title */}
            <div className="glass-card" style={{ padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Problem Details</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input className="form-input" name="title" placeholder="e.g. Two Sum" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Problem URL</label>
                  <input className="form-input" name="problemUrl" placeholder="https://leetcode.com/problems/..." value={form.problemUrl} onChange={handleChange} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group">
                    <label className="form-label">Platform</label>
                    <select className="form-select" name="platform" value={form.platform} onChange={handleChange}>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Taken (min)</label>
                    <input className="form-input" type="number" name="timeTaken" placeholder="e.g. 25" value={form.timeTaken} onChange={handleChange} min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Solved</label>
                  <input className="form-input" type="datetime-local" name="solvedAt" value={form.solvedAt} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="glass-card" style={{ padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Complexity</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Time Complexity</label>
                  <input className="form-input" name="complexity.time" placeholder="O(n log n)" value={form.complexity?.time || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Space Complexity</label>
                  <input className="form-input" name="complexity.space" placeholder="O(n)" value={form.complexity?.space || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop:12 }}>
                <label className="form-label">Approach</label>
                <select className="form-select" name="approach" value={form.approach} onChange={handleChange}>
                  {APPROACHES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Difficulty, Status */}
            <div className="glass-card" style={{ padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Classification</h3>

              <div className="form-group" style={{ marginBottom:16 }}>
                <label className="form-label">Difficulty</label>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {DIFFICULTIES.map(d => (
                    <motion.button
                      key={d} type="button"
                      onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                      className={`btn ${form.difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                      style={form.difficulty === d ? { background:`linear-gradient(135deg, ${diffColors[d]}, ${diffColors[d]}aa)` } : {}}
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                    >
                      {d === 'Easy' ? '🟢' : d === 'Medium' ? '🟡' : '🔴'} {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {STATUSES.map(s => (
                    <motion.button
                      key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`btn ${form.status === s ? 'btn-primary' : 'btn-ghost'}`}
                      style={form.status === s ? { background:`linear-gradient(135deg, ${statusColors[s]}, ${statusColors[s]}aa)` } : {}}
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                    >
                      {s === 'Solved' ? '✅' : s === 'Attempted' ? '⚡' : '🔄'} {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="glass-card" style={{ padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
                Topics *
                {form.topics.length > 0 && (
                  <span style={{ marginLeft:8, fontSize:12, color:'var(--accent-primary)', fontWeight:600 }}>
                    ({form.topics.length} selected)
                  </span>
                )}
              </h3>
              <div className="topic-tags">
                {ALL_TOPICS.map(topic => (
                  <motion.button
                    key={topic} type="button"
                    className={`topic-tag ${form.topics.includes(topic) ? 'selected' : ''}`}
                    onClick={() => toggleTopic(topic)}
                    whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  >
                    {topic}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <motion.div className="glass-card" style={{ padding:24, marginBottom:24 }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Notes & Approach</h3>
          <textarea
            className="form-textarea"
            name="notes"
            placeholder="Write your approach, key observations, or stumbling blocks…"
            value={form.notes}
            onChange={handleChange}
            style={{ minHeight:140 }}
          />
        </motion.div>

        {/* Submit */}
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <motion.button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            whileHover={{ scale:loading?1:1.03 }}
            whileTap={{ scale:loading?1:0.97 }}
          >
            {loading
              ? <><Loader2 size={18} style={{ animation:'spin 0.8s linear infinite' }} /> Saving…</>
              : <><Save size={18} /> {editProblem ? 'Update Problem' : 'Save Problem'}</>
            }
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddProblem;
