// 📍 ARQUIVO: src/config/aiFeatures.js

export const AI_FEATURES = {
  CHAT: {
    id: 'chat',
    name: 'Chat',
    icon: '💬',
    description: 'Converse com a IA',
    enabled: true
  },
  IMAGE_GENERATION: {
    id: 'image-gen',
    name: 'Gerador de Imagens',
    icon: '🎨',
    description: 'Crie imagens com IA',
    enabled: true,
    models: {
      free: 'stable-diffusion-v1-6',
      pro: 'dall-e-3'
    }
  },
  CODE_GENERATION: {
    id: 'code-gen',
    name: 'Gerador de Código',
    icon: '💻',
    description: 'Gere código e veja ao vivo',
    enabled: true
  },
  IMAGE_ANALYSIS: {
    id: 'image-analysis',
    name: 'Análise de Imagens',
    icon: '📸',
    description: 'Analise e descreva imagens',
    enabled: true
  },
  TEXT_TO_SPEECH: {
    id: 'tts',
    name: 'Texto para Voz',
    icon: '🎙️',
    description: 'Ouça as respostas da IA',
    enabled: true
  },
  VIDEO_GENERATION: {
    id: 'video-gen',
    name: 'Gerador de Vídeos',
    icon: '🎬',
    description: 'Em breve!',
    enabled: false,
    comingSoon: true
  }
};

// APIs disponíveis
export const AI_APIS = {
  // Geração de Imagens
  IMAGE_GENERATION: {
    REPLICATE: 'https://api.replicate.com/v1/predictions',
    STABILITY: 'https://api.stability.ai/v1/generation',
    // Para usar DALL-E, usaremos o OpenAI mas via GROQ similar
  },
  
  // Text-to-Speech
  TEXT_TO_SPEECH: {
    ELEVENLABS: 'https://api.elevenlabs.io/v1/text-to-speech',
    // Ou podemos usar a API nativa do browser: window.speechSynthesis
  },
  
  // Análise de Imagens (GPT-4 Vision via GROQ)
  IMAGE_ANALYSIS: {
    GROQ_VISION: 'https://api.groq.com/openai/v1/chat/completions'
  }
};

// Modelos disponíveis para cada feature
export const AI_MODELS = {
  IMAGE_GEN_FREE: {
    name: 'Stable Diffusion XL',
    id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    provider: 'replicate',
    quality: 'standard',
    speed: 'fast'
  },
  IMAGE_GEN_PRO: {
    name: 'DALL-E 3',
    id: 'dall-e-3',
    provider: 'groq',
    quality: 'high',
    speed: 'medium'
  },
  VISION: {
    name: 'LLaVA 1.5',
    id: 'llava-v1.5-7b-4096-preview',
    provider: 'groq'
  }
};

// Limites por plano
export const FEATURE_LIMITS = {
  FREE: {
    imageGeneration: 10, // 10 imagens por dia
    imageAnalysis: 20, // 20 análises por dia
    textToSpeech: 50, // 50 conversões por dia
    codeGeneration: Infinity // Ilimitado
  },
  PRO: {
    imageGeneration: Infinity,
    imageAnalysis: Infinity,
    textToSpeech: Infinity,
    codeGeneration: Infinity
  }
};
