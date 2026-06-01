import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Trash2, BarChart2, X,
  Trophy, Zap, TrendingUp, Star, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, PieChart, Pie, Legend
} from 'recharts';

// ─── Colour helpers ───────────────────────────────────────────────────────────
const DIFF_COLORS = { Easy: '#00e5a0', Medium: '#f59e0b', Hard: '#ff4757' };
const RADAR_COLOR_ME     = '#6c63ff';
const RADAR_COLOR_FRIEND = '#00e5a0';

// ─── Small stat card ─────────────────────────────────────────────────────────
const StatBox = ({ label, me, friend }) => (
  <div style={{
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: '16px 20px',
    textAlign: 'center',
    flex: 1,
    minWidth: 120,
  }}>
    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: me >= friend ? '#6c63ff' : 'var(--text-secondary)' }}>{me}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>vs</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: friend > me ? '#00e5a0' : 'var(--text-secondary)' }}>{friend}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
      <span>You</span><span>Friend</span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FriendsPage() {
  const { user } = useAuth();

  const [friends, setFriends]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchVal, setSearchVal]       = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching]       = useState(false);
  const [adding, setAdding]             = useState(false);
  const [compareData, setCompareData]   = useState(null);
  const [comparingId, setComparingId]   = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriends(res.data.data);
    } catch {
      toast.error('Could not load friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFriends(); }, []);

  // Search user
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await api.get(`/friends/search?username=${encodeURIComponent(searchVal.trim())}`);
      setSearchResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  // Add friend
  const handleAdd = async (username) => {
    setAdding(true);
    try {
      const res = await api.post('/friends/add', { username });
      toast.success(res.data.message);
      setSearchResult(null);
      setSearchVal('');
      fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add friend');
    } finally {
      setAdding(false);
    }
  };

  // Remove friend
  const handleRemove = async (friendId, name) => {
    if (!window.confirm(`Remove ${name} from friends?`)) return;
    try {
      await api.delete(`/friends/${friendId}`);
      toast.success(`${name} removed`);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
      if (comparingId === friendId) { setCompareData(null); setComparingId(null); }
    } catch {
      toast.error('Failed to remove');
    }
  };

  // Compare
  const handleCompare = async (friendId) => {
    if (comparingId === friendId) { setCompareData(null); setComparingId(null); return; }
    setCompareLoading(true);
    setComparingId(friendId);
    try {
      const res = await api.get(`/friends/compare/${friendId}`);
      setCompareData(res.data.data);
    } catch {
      toast.error('Could not load comparison');
    } finally {
      setCompareLoading(false);
    }
  };

  // Build radar data from topTopics
  const buildRadar = (me, friend) => {
    const allTopics = [...new Set([...me.topTopics.map(t => t.topic), ...friend.topTopics.map(t => t.topic)])];
    return allTopics.map(topic => ({
      topic,
      Me: me.topTopics.find(t => t.topic === topic)?.count || 0,
      Friend: friend.topTopics.find(t => t.topic === topic)?.count || 0,
    }));
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Users size={32} style={{ color: '#6c63ff' }} /> Friends & Compare
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
          Add friends by username and compare your DSA progress side-by-side.
        </p>
      </div>

      {/* Search box */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '28px 32px', marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={18} style={{ color: '#6c63ff' }} /> Add a Friend
        </h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input, rgba(0,0,0,0.25))',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '0 14px',
            gap: 10,
            transition: 'border-color 0.2s',
          }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#6c63ff'}
            onBlur={(e)  => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Search size={16} style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
            <input
              placeholder="Enter exact username…"
              value={searchVal}
              onChange={(e) => { setSearchVal(e.target.value); setSearchResult(null); }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                padding: '12px 0',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching} style={{ minWidth: 110 }}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {/* Search result */}
        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 16, padding: '16px 20px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                  {searchResult.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{searchResult.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{searchResult.email}</div>
                </div>
              </div>
              {searchResult.isFriend ? (
                <span style={{ color: '#00e5a0', fontSize: 13, fontWeight: 600 }}>✓ Already friends</span>
              ) : (
                <button className="btn btn-primary" onClick={() => handleAdd(searchResult.username)} disabled={adding} style={{ gap: 6 }}>
                  <UserPlus size={15} /> {adding ? 'Adding…' : 'Add Friend'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friends List */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.05rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={18} style={{ color: '#f59e0b' }} /> Your Friends ({friends.length})
        </h3>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading friends…</p>}

        {!loading && friends.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', background: 'var(--bg-glass)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
            <Users size={48} style={{ opacity: 0.25, marginBottom: 12 }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>No friends yet</div>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>Search for a friend above using their username.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {friends.map((f) => (
            <motion.div key={f._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--bg-glass)', border: `1px solid ${comparingId === f._id ? 'rgba(108,99,255,0.5)' : 'var(--border-color)'}`, borderRadius: 14, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s' }}
            >
              {/* Avatar */}
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                {f.username.slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{f.username}</div>
                <div style={{ display: 'flex', gap: 18, marginTop: 4, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={13} style={{ color: '#6c63ff' }} />{f.totalSolved} solved</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={13} style={{ color: '#f59e0b' }} />{f.streak} day streak</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={13} style={{ color: '#00e5a0' }} />Max: {f.longestStreak}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: 6, fontSize: 13, padding: '8px 16px', background: comparingId === f._id ? 'rgba(108,99,255,0.2)' : undefined }}
                  onClick={() => handleCompare(f._id)}
                >
                  <BarChart2 size={14} />
                  {comparingId === f._id ? 'Close' : 'Compare'}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ color: '#ff4757', padding: '8px 12px' }}
                  onClick={() => handleRemove(f._id, f.username)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Comparison Panel ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {comparingId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ background: 'var(--bg-glass)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 20, padding: '32px 36px', marginTop: 8 }}
          >
            {compareLoading && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>Loading comparison…</p>
            )}

            {!compareLoading && compareData && (() => {
              const { me, friend } = compareData;
              const radar = buildRadar(me, friend);
              return (
                <>
                  {/* Title row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BarChart2 size={22} style={{ color: '#6c63ff' }} />
                      You <span style={{ color: 'var(--text-secondary)', margin: '0 8px' }}>vs</span> {friend.username}
                    </h2>
                    <button className="btn btn-ghost" onClick={() => { setCompareData(null); setComparingId(null); }}>
                      <X size={18} />
                    </button>
                  </div>

                  {/* Stat boxes */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                    <StatBox label="Total Solved"   me={me.total}         friend={friend.total} />
                    <StatBox label="Solved ✓"       me={me.solved}        friend={friend.solved} />
                    <StatBox label="Streak (days)"  me={me.streak}        friend={friend.streak} />
                    <StatBox label="Max Streak"     me={me.longestStreak} friend={friend.longestStreak} />
                    <StatBox label="Last 7 Days"    me={me.last7Days}     friend={friend.last7Days} />
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Difficulty side-by-side bar */}
                    <div>
                      <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Difficulty Breakdown</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={['Easy','Medium','Hard'].map(d => ({
                          name: d,
                          You: me.difficultyDist.find(x => x.name === d)?.value || 0,
                          Friend: friend.difficultyDist.find(x => x.name === d)?.value || 0,
                        }))}>
                          <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'white' }} />
                          <Bar dataKey="You"    fill={RADAR_COLOR_ME}     radius={[4,4,0,0]} />
                          <Bar dataKey="Friend" fill={RADAR_COLOR_FRIEND} radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Topic Radar */}
                    <div>
                      <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Topic Coverage (Top 5)</h4>
                      {radar.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={radar}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <Radar name="You"    dataKey="Me"     stroke={RADAR_COLOR_ME}     fill={RADAR_COLOR_ME}     fillOpacity={0.25} />
                            <Radar name="Friend" dataKey="Friend" stroke={RADAR_COLOR_FRIEND} fill={RADAR_COLOR_FRIEND} fillOpacity={0.2} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'white' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 60 }}>Not enough topic data</p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
