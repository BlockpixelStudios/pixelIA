import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Shield, MessageSquare, Crown, CheckCircle2, Heart, Star, Rocket, Brain, Code, Globe } from 'lucide-react';
import Header from '../components/Header';
import TawkToButton from '../components/TawkToButton';

export default function Landing({ user, userPlan, onLogout }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animação de partículas no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-30"
      />

      {/* Background galáctico */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950"></div>
        
        {/* Orbes de luz animados */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-neon-blue rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-neon-purple rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-neon-pink rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <Header user={user} userPlan={userPlan} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-gray-300">IA de última geração com GROQ</span>
            </div>

            {/* Logo central */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full blur-3xl opacity-50 animate-glow"></div>
                <div className="relative bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink p-10 rounded-3xl animate-float">
                  <Sparkles className="w-28 h-28 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block text-white">Converse com a</span>
              <span className="block bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent neon-text">
                PixelIA
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Assistente de IA poderosa com tecnologia GROQ.
              <br />
              <span className="text-white font-semibold">Gratuito</span> para começar. <span className="text-white font-semibold">Ilimitado</span> para crescer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => navigate('/auth')}
                className="group relative px-12 py-5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl font-bold text-lg text-white hover:scale-105 transition-all shadow-2xl neon-glow"
              >
                <span className="flex items-center gap-3">
                  Começar Grátis
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button
                onClick={() => navigate('/planos')}
                className="group px-12 py-5 glass hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all border-2 border-white/20 hover:border-neon-purple"
              >
                <span className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Ver Planos
                </span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-gray-400">
              {[
                { icon: CheckCircle2, text: 'Sem cartão necessário' },
                { icon: CheckCircle2, text: '50 mensagens/dia grátis' },
                { icon: CheckCircle2, text: 'Cancele quando quiser' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-neon-blue" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="relative z-10 py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Recursos <span className="text-neon-purple">Avançados</span>
            </h2>
            <p className="text-xl text-gray-400">
              Tecnologia de ponta para suas conversas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Ultra Rápido',
                desc: 'Respostas instantâneas com tecnologia GROQ de última geração',
                color: 'from-yellow-500 to-orange-500',
                gradient: 'from-yellow-500/20 to-orange-500/20'
              },
              {
                icon: Shield,
                title: 'Seguro & Privado',
                desc: 'Seus dados protegidos com criptografia de ponta a ponta',
                color: 'from-green-500 to-emerald-500',
                gradient: 'from-green-500/20 to-emerald-500/20'
              },
              {
                icon: MessageSquare,
                title: 'Histórico Completo',
                desc: 'Acesse todas suas conversas de qualquer dispositivo',
                color: 'from-neon-blue to-neon-purple',
                gradient: 'from-neon-blue/20 to-neon-purple/20'
              },
              {
                icon: Brain,
                title: 'IA Avançada',
                desc: 'Modelos de linguagem mais recentes e poderosos',
                color: 'from-purple-500 to-pink-500',
                gradient: 'from-purple-500/20 to-pink-500/20'
              },
              {
                icon: Code,
                title: 'Programação',
                desc: 'Ajuda com código em qualquer linguagem',
                color: 'from-blue-500 to-cyan-500',
                gradient: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: Globe,
                title: 'Multi-idioma',
                desc: 'Converse em português, inglês e mais de 50 idiomas',
                color: 'from-indigo-500 to-purple-500',
                gradient: 'from-indigo-500/20 to-purple-500/20'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group glass hover:bg-white/5 rounded-3xl p-8 transition-all hover:scale-105 border border-white/10 hover:border-white/20"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`inline-block bg-gradient-to-r ${feature.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { number: '10M+', label: 'Mensagens Processadas' },
                { number: '50K+', label: 'Usuários Ativos' },
                { number: '99.9%', label: 'Uptime Garantido' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-5xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 border border-white/10">
            <Rocket className="w-16 h-16 text-neon-purple mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Junte-se a milhares de usuários que já confiam na PixelIA
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-5 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-2xl font-bold text-lg hover:scale-105 transition shadow-2xl neon-glow"
            >
              Começar Gratuitamente
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-neon-blue" />
                <span className="font-bold text-white text-lg">PixelIA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Assistente de IA poderosa e acessível para todos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Produto</h4>
              <div className="space-y-2">
                <a href="/planos" className="block text-gray-400 hover:text-white transition text-sm">
                  Planos
                </a>
                <a href="/#recursos" className="block text-gray-400 hover:text-white transition text-sm">
                  Recursos
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <div className="space-y-2">
                <a href="/termos" className="block text-gray-400 hover:text-white transition text-sm">
                  Termos de Uso
                </a>
                <a href="/privacidade" className="block text-gray-400 hover:text-white transition text-sm">
                  Privacidade
                </a>
                <a href="/cookies" className="block text-gray-400 hover:text-white transition text-sm">
                  Cookies
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Suporte</h4>
              <div className="space-y-2">
                <button
                  onClick={() => window.Tawk_API && window.Tawk_API.toggle()}
                  className="block text-gray-400 hover:text-white transition text-sm text-left"
                >
                  Chat ao Vivo
                </button>
                <a href="mailto:suporte@pixelia.ai" className="block text-gray-400 hover:text-white transition text-sm">
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 PixelIA. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm flex-wrap justify-center">
              <span>Desenvolvido por</span>
              <span className="font-semibold text-white">GROQ</span>
              <span>×</span>
              <span className="font-semibold text-white">Claude AI</span>
              <span>×</span>
              <Heart className="w-4 h-4 text-neon-pink fill-neon-pink animate-pulse" />
              <span className="font-semibold text-white">Blockpixel Studios</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante Tawk.to */}
      <TawkToButton />
    </div>
  );
        }
