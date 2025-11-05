import { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import JournalPage from './pages/JournalPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import ResourcesPage from './pages/ResourcesPage';
import CalmToolsPage from './pages/CalmToolsPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'sonner';
import { apiRequest } from './lib/api';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session on first load
  useEffect(() => {
    try {
      const token = localStorage.getItem('sharespace_token');
      if (!token) {
        setInitializing(false);
        return;
      }
      // Verify token with backend for stronger security
      (async () => {
        try {
          const res = await apiRequest('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res?.ok && res?.data?.valid && res?.data?.user) {
            setUser(res.data.user);
            try { localStorage.setItem('sharespace_user', JSON.stringify(res.data.user)); } catch {}
          } else {
            localStorage.removeItem('sharespace_token');
            localStorage.removeItem('sharespace_user');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('sharespace_token');
          localStorage.removeItem('sharespace_user');
          setUser(null);
        } finally {
          setInitializing(false);
        }
      })();
    } catch {
      // ignore and treat as unauthenticated
      setInitializing(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sharespace_token');
      localStorage.removeItem('sharespace_user');
    } catch {}
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/feed" element={user ? <FeedPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreatePostPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/journal" element={user ? <JournalPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/mood" element={user ? <MoodTrackerPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/resources" element={user ? <ResourcesPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/calm" element={user ? <CalmToolsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
