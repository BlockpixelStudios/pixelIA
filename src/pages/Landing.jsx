import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Shield, MessageSquare, User, Menu, X, Crown, CheckCircle2, Heart } from 'lucide-react';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Blobs - Melhorados e mais suaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
          style={{
            top: '10%',
            left: '10%',
            animation: 'blob1 25s infinite ease-in-out'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
          style={{
            top: '60%',
            right: '10%',
            animation: 'blob2 20s infinite ease-in-out',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-15"
          style={{
            bottom: '20%',
            left: '50%',
            animation: 'blob3 30s infinite ease-in-out',
            animationDelay: '4s'
          }}
        ></div>
        <div 
          className="absolute w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15"
          style={{
            top: '40%',
            right: '30%',
            animation: 'blob4 22s infinite ease-in-out',
            animationDelay: '1s'
          }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.03),transparent_50%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-2xl group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PixelIA</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/planos" className="text-gray-300 hover:text-white transition">
              Planos
            </Link>
            <a 
              href="#recursos" 
              className="text-gray-300 hover:text-white transition"
            >
              Recursos
            </a>
            <Link 
              to="/auth" 
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition font-semibold shadow-lg shadow-cyan-500/25"
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-white hover:text-cyan-400 transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-4 space-y-3">
            <Link 
              to="/planos" 
              onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Planos
            </Link>
            <a 
              href="#recursos"
              onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Recursos
            </a>
            <Link 
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          {/* Logo/Icon */}
          <div className="inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black text-white leading-tight">
            Converse com a<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-600 bg-clip-text text-transparent animate-gradient">
              PixelIA
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Assistente de IA poderosa com modelos avançados.
            <br />
            <strong className="text-white">Gratuito</strong> para começar. <strong className="text-white">Ilimitado</strong> para crescer.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button
              onClick={() => navigate('/auth')}
              className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-cyan-500/50 flex items-center gap-3"
            >
              Começar Grátis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => navigate('/planos')}
              className="group bg-gray-800 hover:bg-gray-700 text-white px-12 py-5 rounded-2xl font-bold text-lg transition flex items-center gap-3 border border-gray-700"
            >
              <Crown className="w-6 h-6 text-yellow-400" />
              Ver Planos
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Sem cartão necessário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>50 mensagens/dia grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="recursos" className="grid md:grid-cols-3 gap-6 mt-32 scroll-mt-20">
          {[
            { 
              icon: Zap, 
              title: 'Ultra Rápido', 
              desc: 'Respostas instantâneas com tecnologia GROQ de última geração',
              color: 'from-yellow-500 to-orange-500',
              delay: '0s'
            },
            { 
              icon: Shield, 
              title: 'Seguro & Privado', 
              desc: 'Seus dados protegidos com criptografia de ponta a ponta',
              color: 'from-green-500 to-emerald-500',
              delay: '0.1s'
            },
            { 
              icon: MessageSquare, 
              title: 'Histórico Completo', 
              desc: 'Acesse todas suas conversas de qualquer dispositivo',
              color: 'from-cyan-500 to-blue-500',
              delay: '0.2s'
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-gray-700 rounded-3xl p-8 transition-all hover:scale-105 hover:shadow-2xl"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`inline-block bg-gradient-to-r ${feature.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-3xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Junte-se a milhares de usuários que já confiam na PixelIA
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl shadow-cyan-500/50"
          >
            Começar Gratuitamente
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        to="/planos"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition z-40 flex items-center gap-2 font-bold"
      >
        <Crown className="w-6 h-6" />
        <span className="hidden sm:inline">Ver Planos</span>
      </Link>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="font-bold text-white text-lg">PixelIA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Assistente de IA poderosa e acessível para todos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Produto</h4>
              <div className="space-y-2">
                <Link to="/planos" className="block text-gray-400 hover:text-white transition text-sm">
                  Planos
                </Link>
                <a href="#recursos" className="block text-gray-400 hover:text-white transition text-sm">
                  Recursos
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <div className="space-y-2">
                <Link to="/termos" className="block text-gray-400 hover:text-white transition text-sm">
                  Termos de Uso
                </Link>
                <Link to="/privacidade" className="block text-gray-400 hover:text-white transition text-sm">
                  Privacidade
                </Link>
                <Link to="/cookies" className="block text-gray-400 hover:text-white transition text-sm">
                  Cookies
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Suporte</h4>
              <button 
                onClick={() => window.Tawk_API && window.Tawk_API.toggle()}
                className="block text-gray-400 hover:text-white transition text-sm mb-2"
              >
                Chat ao Vivo
              </button>
              <a href="mailto:suporte@pixelia.ai" className="block text-gray-400 hover:text-white transition text-sm">
                Email
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 PixelIA. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm flex-wrap justify-center">
              <span>Desenvolvido por</span>
              <span className="font-semibold text-white">GROQ</span>
              <span>×</span>
              <span className="font-semibold text-white">Claude AI</span>
              <span>×</span>
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
              <span className="font-semibold text-white">Blockpixel Studios</span>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 30px) scale(1.05); }
        }
        
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, -30px) scale(1.15); }
          66% { transform: translate(20px, 40px) scale(0.95); }
        }
        
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(-30px, -20px) scale(1.1) rotate(180deg); }
        }
        
        @keyframes blob4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(25px, -35px) scale(1.08); }
          80% { transform: translate(-35px, 25px) scale(0.92); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
