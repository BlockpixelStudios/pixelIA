// 📍 ARQUIVO: src/components/FeaturesMenu.jsx

import { AI_FEATURES } from '../config/aiFeatures';

export default function FeaturesMenu({ onSelectFeature, onClose }) {
  const features = Object.values(AI_FEATURES).filter(f => f.enabled);

  return (
    <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-40 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">🎯 Ferramentas IA</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => {
              onSelectFeature(feature.id);
              onClose();
            }}
            disabled={feature.comingSoon}
            className={`
              relative p-4 rounded-xl border transition-all text-left
              ${feature.comingSoon 
                ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed' 
                : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 hover:scale-105'
              }
            `}
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h4 className="text-white font-semibold text-sm mb-1">
              {feature.name}
            </h4>
            <p className="text-white/60 text-xs">
              {feature.description}
            </p>
            {feature.comingSoon && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                EM BREVE
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 bg-white/5 rounded-lg p-3">
        <p className="text-white/70 text-xs text-center">
          💡 Selecione uma ferramenta para começar
        </p>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
