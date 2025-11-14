import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, FileText, Shield, Cookie } from 'lucide-react';
import { LEGAL_CONTENT } from '../config/legal';

export default function Legal({ type }) {
  const content = LEGAL_CONTENT[type];
  
  const icons = {
    terms: FileText,
    privacy: Shield,
    cookies: Cookie
  };
  
  const Icon = icons[type] || FileText;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-2xl group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">PixelIA</span>
          </Link>
          
          <Link 
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black">{content.title}</h1>
            <p className="text-gray-400 mt-1">Última atualização: {content.lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-gray-300 leading-relaxed space-y-6"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {content.content.split('\n\n').map((paragraph, i) => {
                // Headers (linhas que começam com #)
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={i} className="text-3xl font-bold text-white mt-8 mb-4">
                      {paragraph.replace('# ', '')}
                    </h1>
                  );
                }
                
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-white mt-6 mb-3">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={i} className="text-xl font-semibold text-white mt-4 mb-2">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }

                // Bold text
                const processedParagraph = paragraph.split('**').map((part, idx) => 
                  idx % 2 === 0 ? part : <strong key={idx} className="text-white font-semibold">{part}</strong>
                );

                // Lista (linhas que começam com -)
                if (paragraph.trim().startsWith('- ')) {
                  const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
                  return (
                    <ul key={i} className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      {items.map((item, idx) => (
                        <li key={idx}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }

                // Parágrafo normal
                return (
                  <p key={i} className="text-gray-300 leading-relaxed">
                    {processedParagraph}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {type !== 'terms' && (
            <Link
              to="/termos"
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition group"
            >
              <FileText className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-cyan-400 transition">
                  Termos de Uso
                </div>
                <div className="text-xs text-gray-500">Leia nossos termos</div>
              </div>
            </Link>
          )}
          
          {type !== 'privacy' && (
            <Link
              to="/privacidade"
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition group"
            >
              <Shield className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-green-400 transition">
                  Privacidade
                </div>
                <div className="text-xs text-gray-500">Como protegemos você</div>
              </div>
            </Link>
          )}
          
          {type !== 'cookies' && (
            <Link
              to="/cookies"
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition group"
            >
              <Cookie className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-yellow-400 transition">
                  Cookies
                </div>
                <div className="text-xs text-gray-500">Política de cookies</div>
              </div>
            </Link>
          )}
        </div>

        {/* Contact */}
        <div className="mt-12 p-6 bg-gray-900 border border-gray-800 rounded-xl text-center">
          <p className="text-gray-400 mb-2">Dúvidas sobre este documento?</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a 
              href="mailto: blockpixelstudios@Yahoo.com" 
              className="text-cyan-400 hover:underline font-semibold"
            >
              blockpixelstudios@Yahoo.com
            </a>
            <span className="text-gray-600">|</span>
            <button 
              onClick={() => window.Tawk_API && window.Tawk_API.toggle()}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Chat ao Vivo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2025 PixelIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
          }
