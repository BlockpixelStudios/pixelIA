import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, User, Crown, LogOut, MessageSquare } from 'lucide-react';

export default function Header({ user, userPlan, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition"></div>
              <div className="relative bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink p-2.5 rounded-2xl group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              PixelIA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/planos"
              className={`text-sm font-semibold transition ${
                isActive('/planos')
                  ? 'text-neon-blue'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Planos
            </Link>
            <a
              href="/#recursos"
              className="text-sm font-semibold text-gray-300 hover:text-white transition"
            >
              Recursos
            </a>

            {user ? (
              <>
                <Link
                  to="/chat"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white rounded-xl font-semibold transition hover:scale-105 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Link>
                
                {userPlan !== 'pro' && (
                  <Link
                    to="/planos"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold transition hover:scale-105 shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </Link>
                )}

                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-white rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white rounded-xl font-semibold transition hover:scale-105 shadow-lg neon-glow"
              >
                <User className="w-4 h-4" />
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white hover:text-neon-blue transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 glass rounded-2xl p-4 space-y-3 animate-slide-up">
            <Link
              to="/planos"
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl font-semibold transition ${
                isActive('/planos')
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Planos
            </Link>
            <a
              href="/#recursos"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:bg-white/5 rounded-xl transition"
            >
              Recursos
            </a>

            {user ? (
              <>
                <Link
                  to="/chat"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl font-semibold"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Link>
                
                {userPlan !== 'pro' && (
                  <Link
                    to="/planos"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </Link>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 glass text-white rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl font-semibold"
              >
                <User className="w-4 h-4" />
                Entrar
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
            }
