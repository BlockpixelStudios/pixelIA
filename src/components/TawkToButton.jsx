import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function TawkToButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    // Abrir widget do Tawk.to
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
      setIsOpen(!isOpen);
    } else {
      // Fallback se Tawk não estiver carregado
      alert('Chat de suporte carregando... Tente novamente em alguns segundos!');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Chat de Suporte"
    >
      {/* Efeito de pulso */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse"></div>
      
      {/* Botão principal */}
      <div className="relative bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 neon-glow">
        {isOpen ? (
          <X className="w-6 h-6 text-white" strokeWidth={2.5} />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
        )}
      </div>

      {/* Badge de notificação (opcional) */}
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
        !
      </div>

      {/* Tooltip */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 glass rounded-xl px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        <p className="text-white text-sm font-semibold">
          Precisa de ajuda? Fale conosco!
        </p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
          <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900/70"></div>
        </div>
      </div>
    </button>
  );
      }
