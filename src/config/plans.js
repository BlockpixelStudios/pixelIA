// 📍 ARQUIVO: src/config/plans.js

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Essencial',
    price: 0,
    features: [
      '50 mensagens por dia',
      'Modelo Llama 3.1 70B',
      'Histórico de 7 dias',
      'Suporte por email'
    ],
    limits: {
      messagesPerDay: 50,
      historyDays: 7,
      model: 'llama-3.1-70b-versatile'
    },
    badge: '🆓',
    color: 'from-gray-500 to-gray-600'
  },
  PRO: {
    id: 'pro',
    name: 'Avançado',
    priceMonthly: 19.90,
    priceYearly: 199.00,
    features: [
      '✨ Mensagens ilimitadas',
      '🚀 Modelo Llama 3.3 70B Premium',
      '📚 Histórico ilimitado',
      '⚡ Respostas prioritárias',
      '🎁 Acesso antecipado',
      '💬 Suporte prioritário 24/7',
      '🎨 Personalização avançada'
    ],
    limits: {
      messagesPerDay: Infinity,
      historyDays: Infinity,
      model: 'llama-3.3-70b-versatile'
    },
    badge: '⭐',
    color: 'from-cyan-500 via-blue-500 to-purple-600'
  }
};

// API Key do GROQ (guardada no .env)
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
