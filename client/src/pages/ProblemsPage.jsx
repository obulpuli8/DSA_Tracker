import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Search, Plus, Trash2, ExternalLink, Filter,
  ChevronLeft, ChevronRight, Edit2, X, SlidersHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PLATFORMS = ['All','LeetCode','Codeforces','GeeksForGeeks','HackerRank','AtCoder','CodeChef','Other'];
const DIFFICULTIES = ['All','Easy','Medium','Hard'];
const STATUSES = ['All','Solved','Attempted','Revisit'];

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page:1, total:0, pages:1 });
  const [filters, setFilters] = useState({
    search:'', status:'All', difficulty:'All', platform:'All', sort:'-solvedAt'
  });
  const navigate = useNavigate();

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.platform !== 'All') params.platform = filters.platform;
      params.sort = filters.sort;
      params.page = pagination.page;
      params.limit = 15;

      const res = await api.get('/problems', { params });
      setProblems(res.data.problems);
      setPagination(p => ({ ...p, total: res.data.total, pages: res.data.pages }));
    } catch (err) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return;
    try {
      await api.delete(`/problems/${id}`);
      toast.success('Problem deleted');
      fetchProblems();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} problems?`)) return;
    try {
      await api.delete('/problems/bulk', { data: { ids: selected } });
      toast.success(`${selected.length} problems deleted`);
      setSelected([]);
      fetchProblems();
    } catch { toast.error('Bulk delete failed'); }
  };

  const toggleSelect = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const updateFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPagination(p => ({ ...p, page: 1 }));
  };

  const diffColor = { Easy:'var(--accent-easy)', Medium:'var(--accent-medium)', Hard:'var(--accent-hard)' };

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-subtitle">{pagination.total} problems tracked</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {selected.length > 0 && (
            <motion.button className="btn btn-danger" onClick={handleBulkDelete} initial={{ scale:0 }} animate={{ scale:1 }}>
              <Trash2 size={16} /> Delete ({selected.length})
            </motion.button>
          )}
          <button className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/add-problem')}>
            <Plus size={16} /> Add Problem
          </button>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        className="filters-bar"
        initial={{ opacity:0, y:-10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.1 }}
      >
        <div className="search-input-wrapper" style={{ flex:1 }}>
          <Search size={16} className="search-icon" />
          <input
            className="form-input"
            placeholder="Search problems…"
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              style={{ display:'flex', gap:10, flexWrap:'wrap', width:'100%' }}
              initial={{ opacity:0, height:0 }}
              animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }}
            >
              <select className="form-select" style={{ flex:1 }} value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="form-select" style={{ flex:1 }} value={filters.difficulty} onChange={e => updateFilter('difficulty', e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="form-select" style={{ flex:1 }} value={filters.platform} onChange={e => updateFilter('platform', e.target.value)}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="form-select" style={{ flex:1 }} value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
                <option value="-solvedAt">Newest First</option>
                <option value="solvedAt">Oldest First</option>
                <option value="difficulty">Difficulty ↑</option>
                <option value="-difficulty">Difficulty ↓</option>
                <option value="title">A–Z</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Problem List */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[...Array(6)].map((_,i) => (
            <motion.div key={i} className="glass-card" style={{ height:68 }}
              animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity, delay:i*0.1 }} />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <motion.div className="glass-card empty-state" initial={{ opacity:0 }} animate={{ opacity:1 }}>
          <div className="empty-state-icon">🧩</div>
          <div className="empty-state-title">No problems found</div>
          <div className="empty-state-desc">Try adjusting your filters or add your first problem!</div>
          <button className="btn btn-primary" onClick={() => navigate('/add-problem')}>
            <Plus size={16} /> Add Problem
          </button>
        </motion.div>
      ) : (
        <motion.div className="problem-list" initial="hidden" animate="show"
          variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.04 } } }}>
          {problems.map((p) => (
            <motion.div
              key={p._id}
              className={`problem-row ${selected.includes(p._id) ? 'selected' : ''}`}
              variants={{ hidden:{opacity:0,x:-20}, show:{opacity:1,x:0} }}
              whileHover={{ x:4 }}
              onClick={() => toggleSelect(p._id)}
            >
              {/* Checkbox */}
              <div
                onClick={e => { e.stopPropagation(); toggleSelect(p._id); }}
                style={{
                  width:18, height:18, borderRadius:4, border:`2px solid ${selected.includes(p._id) ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: selected.includes(p._id) ? 'var(--accent-primary)' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer', transition:'all 0.15s'
                }}
              >
                {selected.includes(p._id) && <X size={11} color="white" />}
              </div>

              {/* Difficulty */}
              <span className={`badge badge-${p.difficulty.toLowerCase()}`} style={{ flexShrink:0 }}>{p.difficulty}</span>

              {/* Title */}
              <span style={{ flex:1, fontSize:14, fontWeight:600, color:'var(--text-primary)' }} className="truncate">
                {p.title}
              </span>

              {/* Topics */}
              <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                {p.topics.slice(0,2).map(t => (
                  <span key={t} className="badge badge-topic" style={{ fontSize:10 }}>{t}</span>
                ))}
                {p.topics.length > 2 && <span style={{ fontSize:11, color:'var(--text-muted)' }}>+{p.topics.length-2}</span>}
              </div>

              {/* Platform */}
              <span style={{ fontSize:12, color:'var(--text-muted)', flexShrink:0 }}>{p.platform}</span>

              {/* Status */}
              <span className={`badge badge-${p.status.toLowerCase()}`} style={{ flexShrink:0 }}>{p.status}</span>

              {/* Time */}
              {p.timeTaken > 0 && <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{p.timeTaken}m</span>}

              {/* Date */}
              <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0, minWidth:70 }}>
                {formatDistanceToNow(new Date(p.solvedAt), { addSuffix:true })}
              </span>

              {/* Actions */}
              <div style={{ display:'flex', gap:6, flexShrink:0 }} onClick={e => e.stopPropagation()}>
                {p.problemUrl && (
                  <a href={p.problemUrl} target="_blank" rel="noreferrer">
                    <motion.button className="btn btn-ghost btn-icon btn-sm" whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}>
                      <ExternalLink size={14} />
                    </motion.button>
                  </a>
                )}
                <motion.button className="btn btn-ghost btn-icon btn-sm" whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                  onClick={() => navigate('/add-problem', { state: { problem: p } })}>
                  <Edit2 size={14} />
                </motion.button>
                <motion.button className="btn btn-ghost btn-icon btn-sm" whileHover={{ scale:1.1, color:'var(--accent-danger)' }} whileTap={{ scale:0.9 }}
                  onClick={() => handleDelete(p._id)}>
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:24, alignItems:'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={pagination.page === 1}
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{ color:'var(--text-secondary)', fontSize:14 }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
