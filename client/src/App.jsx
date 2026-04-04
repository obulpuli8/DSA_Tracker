import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProblemsPage from './pages/ProblemsPage';
import AddProblem from './pages/AddProblem';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(20px)',
            },
            success: { iconTheme: { primary: '#00e5a0', secondary: '#050b15' } },
            error: { iconTheme: { primary: '#ff4757', secondary: '#050b15' } },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/problems" element={
              <ProtectedRoute>
                <AppLayout><ProblemsPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/add-problem" element={
              <ProtectedRoute>
                <AppLayout><AddProblem /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <AppLayout><InsightsPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
