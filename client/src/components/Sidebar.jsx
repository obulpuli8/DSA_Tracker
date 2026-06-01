import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Code2, BarChart3, Plus,
  LogOut, User, Zap, BookOpen, Trophy, Users
} from 'lucide-react';
import logo from '../assets/logo.png';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/problems',   icon: Code2,            label: 'Problems' },
  { to: '/insights',   icon: BarChart3,         label: 'Smart Insights' },
  { to: '/add-problem',icon: Plus,              label: 'Add Problem' },
  { to: '/friends',    icon: Users,             label: 'Friends' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="AlgoTrack"
          style={{
            height: 44,
            width: 'auto',
            maxWidth: 150,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">Navigation</span>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                className={`nav-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}

        <span className="nav-section-title" style={{ marginTop: 16 }}>Progress</span>
        <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Target</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)' }}>{user?.targetProblems || 100}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(108,99,255,0.2)', borderRadius: 999 }}>
            <motion.div
              style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 999 }}
              initial={{ width: 0 }}
              animate={{ width: '30%' }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info" onClick={() => navigate('/profile')}>
          <div className="user-avatar">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name">{user?.username}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <motion.button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 8, justifyContent: 'flex-start', gap: 10 }}
          onClick={handleLogout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
