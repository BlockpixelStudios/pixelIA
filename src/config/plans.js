// 📍 ARQUIVO: src/config/plans.js

export const PLANS = {
  FREE: {
    name: 'Essencial',
    badge: '🆓',
    price: 0,
    features: [
      '50 mensagens por dia',
      'Acesso ao modelo Llama 3.3 70B',
      'Histórico de conversas',
      'Suporte por email',
      'Todas as funcionalidades básicas'
    ]
  },
  PRO: {
    name: 'Avançado',
    badge: '✨',
    priceMonthly: 19.90,
    priceYearly: 199.90,
    features: [
      '✨ Mensagens ilimitadas',
      '🚀 Modelo Llama 3.2 90B (mais poderoso)',
      '⚡ Respostas mais rápidas',
      '💾 Histórico completo ilimitado',
      '🎯 Prioridade no suporte',
      '🎨 Acesso antecipado a novos recursos',
      '🔒 Segurança avançada',
      '📊 Análises e insights'
    ]
  }
};

// Links diretos do Stripe Checkout
export const STRIPE_LINKS = {
  MONTHLY: 'https://buy.stripe.com/3cI3cogMk6fSa4M3co',
  YEARLY: 'https://buy.stripe.com/4gM4gsdA8fQsfp60co'
};

// Configuração adicional do Stripe
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  successUrl: `${window.location.origin}/chat?success=true`,
  cancelUrl: `${window.location.origin}/planos?canceled=true`
};
