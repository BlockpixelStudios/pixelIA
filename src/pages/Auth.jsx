import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Loader2, UserCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Criar perfil se não existir
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (!profile) {
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
            plan: 'free'
          });
        }

        navigate('/chat');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Criar perfil do usuário
          await supabase.from('user_profiles').insert({
            user_id: data.user.id,
            plan: 'free'
          });

          setAuthError('✅ Conta criada! Verifique seu email para confirmar.');
          setTimeout(() => {
            navigate('/chat');
          }, 2000);
        }
      }
    } catch (error) {
      setAuthError(error.message || 'Erro ao autenticar');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestMode = () => {
    // Criar um "usuário" guest temporário
    const guestUser = {
      id: 'guest-' + Date.now(),
      email: 'guest@pixelia.com',
      isGuest: true
    };
    
    // Guardar no localStorage
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Voltar</span>
      </Link>

      {/* Auth Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {authMode === 'login' ? 'Bem-vindo!' : 'Criar conta'}
          </h2>
          <p className="text-gray-400">
            {authMode === 'login' ? 'Entre para continuar conversando' : 'Junte-se gratuitamente à PixelIA'}
          </p>
        </div>

        {/* Error/Success Message */}
        {authError && (
          <div className={`mb-4 p-4 rounded-xl border ${
            authError.includes('✅') 
              ? 'bg-green-500/20 border-green-500/50' 
              : 'bg-red-500/20 border-red-500/50'
          }`}>
            <p className={`text-sm ${authError.includes('✅') ? 'text-green-200' : 'text-red-200'}`}>
              {authError}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500 transition"
              />
            </div>
            {authMode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {authMode === 'login' ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              authMode === 'login' ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-gray-900 to-black text-gray-400">ou</span>
          </div>
        </div>

        {/* Guest Mode */}
        <button
          onClick={handleGuestMode}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          <UserCircle className="w-5 h-5" />
          Entrar como Visitante
        </button>
        
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-xs text-yellow-200 text-center">
            ⚠️ <strong>Modo Visitante:</strong> Apenas 10 mensagens/dia e sem histórico salvo
          </p>
        </div>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            {authMode === 'login' 
              ? 'Não tem conta? Cadastre-se gratuitamente' 
              : 'Já tem conta? Faça login'
            }
          </button>
        </div>

        {/* Legal Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Ao continuar, você concorda com nossos{' '}
          <Link to="/termos" className="text-cyan-400 hover:underline">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link to="/privacidade" className="text-cyan-400 hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-10 text-gray-800 text-9xl font-black opacity-5 pointer-events-none hidden lg:block">
        PixelIA
      </div>
    </div>
  );
}
