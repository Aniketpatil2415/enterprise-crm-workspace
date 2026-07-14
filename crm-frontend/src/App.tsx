import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Loader2 } from 'lucide-react';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import JoinWorkspace from './pages/JoinWorkspace';
import ApiKeys from './pages/ApiKeys'; // PHASE 6 IMPORT
import Layout from './components/glass/Layout';

function App() {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-brand-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        className: 'bg-brand-800 text-white border border-glass-border',
        style: { background: '#1e293b', color: '#fff' }
      }} />
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/join" element={<JoinWorkspace />} />

          {/* PROTECTED ENTERPRISE ROUTES (Wrapped in Global Layout) */}
          {isAuthenticated && (
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/api-keys" element={<ApiKeys />} /> {/* PHASE 6 ROUTE */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          )}

          {/* Fallback for Unauthenticated Users */}
          {!isAuthenticated && <Route path="*" element={<Navigate to="/" />} />}
        </Routes>
      </Router>
    </>
  );
}

export default App;