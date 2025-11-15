import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Cpu, Brain, Rocket } from 'lucide-react';

const curiosities = [
  { icon: Brain, text: "IA processa mais de 1 trilhão de parâmetros por segundo" },
  { icon: Zap, text: "Respostas 10x mais rápidas com tecnologia GROQ" },
  { icon: Cpu, text: "Modelo treinado com bilhões de conversas reais" },
  { icon: Rocket, text: "99.9% de uptime garantido para você" },
  { icon: Sparkles, text: "PixelIA aprende e evolui a cada interação" },
];

export default function LoadingScreen() {
  const [currentFact, setCurrentFact] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Trocar curiosidade a cada 2 segundos
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % curiosities.length);
    }, 2000);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 50);

    return () => {
      clearInterval(factInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = curiosities[currentFact].icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background galáctico animado */}
      <div className="absolute inset-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"></div>
        
        {/* Estrelas animadas */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}

        {/* Orbes de luz */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-pink rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-6">
        {/* Logo animada */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full blur-2xl opacity-50 animate-glow"></div>
          <div className="relative bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink p-8 rounded-3xl animate-float">
            <Sparkles className="w-20 h-20 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-black neon-text">
            PixelIA
          </h1>
          <p className="text-xl text-gray-400 font-light">
            Preparando sua experiência...
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="w-full max-w-md">
          <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">
            {progress}%
          </p>
        </div>

        {/* Loading dots */}
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>

        {/* Curiosidades animadas */}
        <div className="glass rounded-2xl p-6 max-w-md w-full min-h-[100px] flex items-center justify-center">
          <div className="flex items-start gap-4 animate-fade-in" key={currentFact}>
            <div className="bg-gradient-to-br from-neon-blue to-neon-purple p-3 rounded-xl flex-shrink-0">
              <CurrentIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-300 leading-relaxed">
                {curiosities[currentFact].text}
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de fatos */}
        <div className="flex gap-2">
          {curiosities.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentFact
                  ? 'w-8 bg-gradient-to-r from-neon-blue to-neon-purple'
                  : 'w-1 bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
          }
