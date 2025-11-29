// 📍 ARQUIVO: src/components/CodeGenerator.jsx

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeGenerator({ code, language, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      java: 'java',
      cpp: 'cpp',
      typescript: 'ts'
    };
    
    const ext = extensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Preview para HTML/CSS/JS
  const canPreview = ['html', 'javascript', 'css'].includes(language);

  const getPreviewContent = () => {
    if (language === 'html' || code.includes('<!DOCTYPE') || code.includes('<html')) {
      return code;
    }
    
    if (language === 'javascript') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: system-ui;
                padding: 20px;
                background: #1a1a1a;
                color: white;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>${code}</script>
          </body>
        </html>
      `;
    }
    
    if (language === 'css') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>${code}</style>
          </head>
          <body>
            <h1>CSS Preview</h1>
            <p>Aplique este CSS ao seu HTML</p>
          </body>
        </html>
      `;
    }
    
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl max-w-6xl w-full h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">💻</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Código Gerado</h2>
              <p className="text-white/50 text-sm">{language.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canPreview && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {showPreview ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Ver Código
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={copyCode}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
            
            <button
              onClick={downloadCode}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              ⬇️ Baixar
            </button>
            
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <iframe
              srcDoc={getPreviewContent()}
              className="w-full h-full bg-white"
              title="Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="h-full overflow-auto">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  height: '100%',
                  background: 'transparent'
                }}
                showLineNumbers
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
