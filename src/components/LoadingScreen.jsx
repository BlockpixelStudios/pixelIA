import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-6 rounded-3xl animate-bounce">
          <Sparkles className="w-16 h-16 text-white" />
        </div>
      </div>
      <p className="mt-8 text-white text-xl font-semibold">Carregando PixelIA...</p>
      <div className="mt-4 flex gap-2">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
      }
