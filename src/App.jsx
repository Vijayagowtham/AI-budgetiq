import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthLayout } from './components/layout/AuthLayout';
import { MainLayout } from './components/layout/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { AIInsights } from './pages/AIInsights';
import { Profile } from './pages/Profile';
import { Reports } from './pages/Reports';
import { Goals } from './pages/Goals';
import { Demo } from './pages/Demo';
import { ToastProvider } from './context/ToastContext';

function GlobalAuthListener() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <GlobalAuthListener />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<Demo />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          
          <Route element={<MainLayout />}>
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
