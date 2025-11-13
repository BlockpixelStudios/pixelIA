import { loadStripe } from '@stripe/stripe-js';

// COLE SUA PUBLISHABLE KEY AQUI
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SSlhL5QUOaweBvtWeMIS65HIYlfP9fZckCYBL5wRBPEYn5iMf7Ww80ImNgPPdX7Fa2KDQFRfJ2QH1fReCPCXKqy00FK9KM2IJ';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const PRICE_IDS = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1ST6YR5QUOaweBvtG8iqe93J',
  pro_yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_1ST6mV5QUOaweBvtRKsUF7tQ'
};

export async function createCheckoutSession(priceId, userEmail) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail: userEmail
      })
    });

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
    }
