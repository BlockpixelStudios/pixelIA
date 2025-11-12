export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Essencial',
    price: 0,
    priceId: null,
    features: [
      '50 mensagens por dia',
      'Modelo Llama 3.1 70B',
      'Histórico de 7 dias',
      'Suporte por email'
    ],
    limits: {
      messagesPerDay: 50,
      historyDays: 7
    },
    badge: '🆓',
    color: 'from-gray-500 to-gray-600'
  },
  PRO: {
    id: 'pro',
    name: 'Avançado',
    price: 19.90,
    priceMonthly: 'price_xxx', // Você vai pegar isso no Stripe
    priceYearly: 'price_yyy',  // ID do preço anual
    features: [
      '✨ Mensagens ilimitadas',
      '🚀 Modelo Llama 3.3 70B',
      '📚 Histórico ilimitado',
      '⚡ Respostas prioritárias',
      '🎁 Acesso antecipado',
      '💬 Suporte prioritário'
    ],
    limits: {
      messagesPerDay: Infinity,
      historyDays: Infinity
    },
    badge: '⭐',
    color: 'from-cyan-500 via-blue-500 to-purple-600'
  }
};

export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SSlhL5QUOaweBvtWeMIS65HIYlfP9fZckCYBL5wRBPEYn5iMf7Ww80ImNgPPdX7Fa2KDQFRfJ2QH1fReCPCXKqy00FK9KM2IJ'
