import React from 'react';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieBanner({ onAccept }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl z-50 animate-slide-up">
      <div className="flex items-start gap-4">
        <Cookie className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">🍪 Cookies</h3>
          <p className="text-gray-400 text-sm mb-4">
            Usamos cookies essenciais para o funcionamento. Ao continuar, você concorda com nossa política.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Aceitar
            </button>
            <Link
              to="/cookies"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-center"
            >
              Saber mais
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
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
