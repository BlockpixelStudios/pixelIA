// 📍 ARQUIVO: src/components/ImageAnalyzer.jsx

import { useState } from 'react';

export default function ImageAnalyzer({ userProfile, onClose, onSendToChat }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Converter imagem para base64
      const base64Image = await convertToBase64(selectedImage);

      // Chamar GROQ Vision API (LLaVA)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llava-v1.5-7b-4096-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: question || 'Descreva esta imagem em detalhes.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar imagem');
      }

      const data = await response.json();
      setAnalysis(data.choices[0].message.content);

    } catch (err) {
      console.error('Erro:', err);
      setAnalysis('❌ Erro ao analisar imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendToChat = () => {
    if (analysis && onSendToChat) {
      onSendToChat(analysis);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Análise de Imagens</h2>
              <p className="text-white/70 text-sm">Envie uma imagem e faça perguntas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        {!imagePreview ? (
          <label className="border-2 border-dashed border-white/30 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-white/50 transition-all mb-6">
            <svg className="w-16 h-16 text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-white font-semibold mb-1">Clique para selecionar uma imagem</p>
            <p className="text-white/50 text-sm">PNG, JPG, WEBP até 10MB</p>
            <input
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-96 object-contain bg-black/20"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setAnalysis(null);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Question Input */}
            <div>
              <label className="text-white font-semibold mb-2 block">
                O que você quer saber sobre esta imagem? (opcional)
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Que objeto é este? Onde foi tirada esta foto?"
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none"
                disabled={isAnalyzing}
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Analisar Imagem
                </>
              )}
            </button>

            {/* Analysis Result */}
            {analysis && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed mb-4">
                  {analysis}
                </p>
                {onSendToChat && (
                  <button
                    onClick={sendToChat}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Continuar no Chat
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="bg-white/5 rounded-xl p-4 mt-4">
          <p className="text-white/70 text-sm mb-2">💡 <strong>Você pode perguntar:</strong></p>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• O que há nesta imagem?</li>
            <li>• Identifique os objetos presentes</li>
            <li>• Que cor predomina?</li>
            <li>• Descreva o ambiente</li>
            <li>• Tem alguma pessoa? Quantas?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
