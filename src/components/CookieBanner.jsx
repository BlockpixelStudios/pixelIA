// 📍 ARQUIVO: src/components/CookieBanner.jsx

import React from 'react';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieBanner({ onAccept }) {
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
      <div className="glass rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-neon-blue to-neon-purple p-3 rounded-xl flex-shrink-0">
            <Cookie className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-2">🍪 Cookies</h3>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Usamos cookies essenciais para o funcionamento. Ao continuar, você concorda com nossa política.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onAccept}
                className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white px-4 py-2 rounded-lg font-semibold transition hover:scale-105"
              >
                Aceitar
              </button>
              <Link
                to="/cookies"
                className="px-4 py-2 glass hover:bg-white/10 text-white rounded-lg transition text-center border border-white/20"
              >
                Saber mais
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
