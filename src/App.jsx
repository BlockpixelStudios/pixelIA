import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Plans from './pages/Plans';
import Legal from './pages/Legal';

// Components
import CookieBanner from './components/CookieBanner';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  useEffect(() => {
    // Verificar usuário logado
    checkUser();
    
    // Verificar consentimento de cookies
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      setShowCookieBanner(false);
    }

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/chat" /> : <Auth />} />
        <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/auth" />} />
        <Route path="/planos" element={<Plans user={user} />} />
        <Route path="/termos" element={<Legal type="terms" />} />
        <Route path="/privacidade" element={<Legal type="privacy" />} />
        <Route path="/cookies" element={<Legal type="cookies" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {showCookieBanner && <CookieBanner onAccept={acceptCookies} />}
    </Router>
  );
  }
