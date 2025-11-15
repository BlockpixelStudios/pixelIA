import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Crown, ArrowLeft, Zap, Gift } from 'lucide-react';
import { PLANS } from '../config/plans';
import { stripePromise, PRICE_IDS } from '../config/stripe';

export default function Plans({ user }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async (plan) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const priceId = billingCycle === 'monthly' ? PRICE_IDS.pro_monthly : PRICE_IDS.pro_yearly;
      
      // Criar sessão de checkout do Stripe
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email
        })
      });

      const { sessionId } = await response.json();
      
      // Redirecionar para Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Erro no Stripe:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar sessão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const yearlyDiscount = ((PLANS.PRO.priceMonthly * 12 - PLANS.PRO.priceYearly) / (PLANS.PRO.priceMonthly * 12) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-2xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PixelIA</span>
          </Link>
          
          <Link 
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl mb-6">
          <Crown className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
          Escolha seu Plano
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Comece grátis e faça upgrade quando precisar de mais poder
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              billingCycle === 'monthly'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-xl font-semibold transition relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              -{yearlyDiscount}%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-3xl p-8 hover:border-gray-600 transition">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{PLANS.FREE.badge}</span>
              <div>
                <h3 className="text-2xl font-bold text-white">{PLANS.FREE.name}</h3>
                <p className="text-gray-400 text-sm">Perfeito para começar</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">Grátis</span>
              </div>
              <p className="text-gray-400 mt-1">Para sempre</p>
            </div>

            <ul className="space-y-4 mb-8">
              {PLANS.FREE.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition"
            >
              Começar Grátis
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border-2 border-cyan-500 rounded-3xl p-8">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-full shadow-xl">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4" />
                MAIS POPULAR
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-4">
              <span className="text-4xl">{PLANS.PRO.badge}</span>
              <div>
                <h3 className="text-2xl font-bold text-white">{PLANS.PRO.name}</h3>
                <p className="text-purple-300 text-sm">Poder ilimitado</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  R$ {billingCycle === 'monthly' ? PLANS.PRO.priceMonthly.toFixed(2) : (PLANS.PRO.priceYearly / 12).toFixed(2)}
                </span>
                <span className="text-gray-400">/mês</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-green-400 text-sm mt-2 font-semibold">
                  💰 Economize R$ {(PLANS.PRO.priceMonthly * 12 - PLANS.PRO.priceYearly).toFixed(2)} por ano!
                </p>
              )}
              <p className="text-gray-400 mt-1">
                {billingCycle === 'yearly' 
                  ? `R$ ${PLANS.PRO.priceYearly.toFixed(2)} cobrado anualmente` 
                  : 'Cobrado mensalmente'
                }
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {PLANS.PRO.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:scale-105 transition shadow-xl shadow-cyan-500/50 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Processando...'
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Assinar Agora
                </>
              )}
            </button>

            {/* Promo Code Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/chat')} // Vai abrir modal no chat
                className="text-sm text-gray-400 hover:text-white transition flex items-center justify-center gap-2 mx-auto"
              >
                <Gift className="w-4 h-4" />
                Tenho um código promocional
              </button>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 bg-gray-900 border border-gray-800 rounded-2xl px-8 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Suporte 24/7</span>
            </div>
          </div>
        </div>

        {/* FAQ Quick */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Posso mudar de plano depois?',
                a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento.'
              },
              {
                q: 'Como funciona o cancelamento?',
                a: 'Cancele quando quiser pelo painel. Sem taxas ou multas.'
              },
              {
                q: 'Quais formas de pagamento aceitam?',
                a: 'Cartão de crédito, Pix, boleto e carteiras digitais via Stripe.'
              }
            ].map((faq, i) => (
              <details key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 group">
                <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-gray-400 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
        }
