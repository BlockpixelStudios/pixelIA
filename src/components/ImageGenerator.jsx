// 📍 ARQUIVO: src/components/ImageGenerator.jsx

import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ImageGenerator({ userProfile, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Usar Replicate API para Stable Diffusion (gratuito e bom)
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`
        },
        body: JSON.stringify({
          version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          input: {
            prompt: prompt,
            negative_prompt: 'ugly, blurry, low quality, distorted',
            width: 1024,
            height: 1024,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: userProfile?.plan === 'avancado' ? 50 : 30
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar imagem');
      }

      const prediction = await response.json();
      
      // Poll para resultado (Replicate é assíncrono)
      let result = prediction;
      while (result.status !== 'succeeded' && result.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(result.urls.get, {
          headers: {
            'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_KEY}`
          }
        });
        
        result = await statusResponse.json();
      }

      if (result.status === 'failed') {
        throw new Error('Falha ao gerar imagem');
      }

      setGeneratedImage(result.output[0]);

      // Salvar no histórico (opcional)
      await supabase.from('generated_images').insert([{
        user_id: userProfile.user_id,
        prompt: prompt,
        image_url: result.output[0],
        created_at: new Date().toISOString()
      }]);

    } catch (err) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao gerar imagem. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `pixelia-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-2xl w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gerador de Imagens</h2>
              <p className="text-white/70 text-sm">Crie imagens incríveis com IA</p>
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

        {/* Input */}
        <div className="mb-6">
          <label className="text-white font-semibold mb-2 block">
            Descreva a imagem que deseja criar:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Um gato astronauta flutuando no espaço, arte digital, ultra realista..."
            className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none resize-none"
            rows="4"
            disabled={isGenerating}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={generateImage}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Gerando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gerar Imagem
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={generatedImage}
                alt="Imagem gerada"
                className="w-full h-auto"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadImage}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar
              </button>
              <button
                onClick={() => {
                  setGeneratedImage(null);
                  setPrompt('');
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Nova Imagem
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!generatedImage && !isGenerating && (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/70 text-sm mb-2">💡 <strong>Dicas:</strong></p>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Seja específico: "gato laranja" em vez de só "gato"</li>
              <li>• Adicione estilo: "arte digital", "pintura a óleo", "fotorrealista"</li>
              <li>• Use referências: "estilo Studio Ghibli", "como Picasso"</li>
              {userProfile?.plan === 'essencial' && (
                <li className="text-yellow-400">⚡ Plano Avançado: qualidade superior e sem limites!</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
