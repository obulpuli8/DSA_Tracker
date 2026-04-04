import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 🎉');
      } else {
        await register(form.username, form.email, form.password);
        toast.success('Account created! Let\'s start tracking! 🚀');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              borderRadius: '50%',
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(108,99,255,0.15), transparent)'
                : 'radial-gradient(circle, rgba(0,212,255,0.1), transparent)',
              left: `${10 + i * 20}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <motion.div
            className="auth-logo-icon"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ⚡
          </motion.div>
          <h1 className="auth-title">AlgoTrack</h1>
          <p className="auth-subtitle">Your intelligent DSA companion</p>
        </div>

        {/* Tab switcher */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {['login', 'register'].map((t) => (
            <motion.div
              key={t}
              className={`tab-item ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.97 }}
            >
              {t === 'login' ? '🔐 Sign In' : '✨ Sign Up'}
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={tab}
            className="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  name="username"
                  placeholder="e.g. coder42"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <><Loader2 size={18} className="spin-icon" style={{ animation: 'spin 0.8s linear infinite' }} /> Processing…</>
              ) : (
                tab === 'login' ? '🚀 Sign In' : '✨ Create Account'
              )}
            </motion.button>

            <div className="divider">or</div>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                style={{ color: 'var(--accent-primary)', fontWeight: 600, background: 'none', fontSize: 13 }}
              >
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
