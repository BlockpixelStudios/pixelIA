// 📍 ARQUIVO: api/stripe-webhook.js
// Criar essa estrutura de pastas na raiz do projeto:
// api/
// └── stripe-webhook.js

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Inicializar Stripe e Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Chave de serviço (admin)
);

// Configuração necessária para webhooks
export const config = {
  api: {
    bodyParser: false, // CRÍTICO: Stripe precisa do body raw
  },
};

export default async function handler(req, res) {
  // Só aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Ler body raw
    const body = await buffer(req);
    
    // Verificar assinatura do Stripe (segurança)
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    
    console.log('✅ Webhook recebido:', event.type);
  } catch (err) {
    console.error('❌ Erro na verificação do webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar diferentes tipos de eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Evento não processado: ${event.type}`);
    }
    
    res.json({ received: true, type: event.type });
  } catch (error) {
    console.error('❌ Erro ao processar evento:', error);
    res.status(500).json({ error: error.message });
  }
}

// 🎉 Pagamento inicial concluído
async function handleCheckoutCompleted(session) {
  console.log('💳 Processando pagamento concluído...');
  
  const customerEmail = session.customer_email;
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  
  // Determinar se é plano anual ou mensal
  const amountPaid = session.amount_total; // Em centavos
  const isYearly = amountPaid >= 19990; // R$ 199,90 ou mais = anual
  
  // Calcular data de expiração
  const expiryDate = new Date();
  if (isYearly) {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // +1 ano
  } else {
    expiryDate.setMonth(expiryDate.getMonth() + 1); // +1 mês
  }
  
  console.log(`📧 Email: ${customerEmail}`);
  console.log(`💰 Valor: R$ ${(amountPaid / 100).toFixed(2)}`);
  console.log(`📅 Expira em: ${expiryDate.toISOString()}`);
  
  // Atualizar usuário no Supabase
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      plan: 'avancado',
      plan_expiry: expiryDate.toISOString(),
      messages_used_today: 0, // Resetar contador
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString()
    })
    .eq('email', customerEmail)
    .select();
  
  if (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    throw error;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Usuário atualizado para plano avançado:', customerEmail);
  } else {
    console.warn('⚠️ Nenhum usuário encontrado com email:', customerEmail);
  }
}

// 🔄 Assinatura atualizada (renovação, mudança de plano)
async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Processando atualização de assinatura...');
  
  const customerId = subscription.customer;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  console.log(`Status: ${status}`);
  console.log(`Expira em: ${currentPeriodEnd.toISOString()}`);
  
  // Determinar plano baseado no status
  const newPlan = status === 'active' ? 'avancado' : 'essencial';
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      plan: newPlan,
      plan_expiry: status === 'active' ? currentPeriodEnd.toISOString() : null,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
    .select();
  
  if (error) {
    console.error('❌ Erro ao atualizar assinatura:', error);
    throw error;
  }
  
  console.log('✅ Assinatura atualizada');
}

// ❌ Assinatura cancelada
async function handleSubscriptionCanceled(subscription) {
  console.log('❌ Processando cancelamento de assinatura...');
  
  const customerId = subscription.customer;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      plan: 'essencial',
      plan_expiry: null,
      messages_used_today: 0,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
    .select();
  
  if (error) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    throw error;
  }
  
  console.log('✅ Assinatura cancelada - usuário voltou para plano essencial');
}

// 💰 Pagamento recorrente bem-sucedido (renovação mensal/anual)
async function handlePaymentSucceeded(invoice) {
  console.log('💰 Pagamento recorrente bem-sucedido...');
  
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;
  
  // Pegar detalhes da assinatura
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      plan: 'avancado',
      plan_expiry: currentPeriodEnd.toISOString(),
      messages_used_today: 0, // Resetar contador na renovação
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
    .select();
  
  if (error) {
    console.error('❌ Erro ao processar renovação:', error);
    throw error;
  }
  
  console.log('✅ Assinatura renovada com sucesso');
}

// ⚠️ Pagamento falhou
async function handlePaymentFailed(invoice) {
  console.log('⚠️ Pagamento falhou...');
  
  const customerId = invoice.customer;
  
  // Não cancelar imediatamente, Stripe tenta novamente
  // Mas podemos avisar o usuário
  
  console.log(`⚠️ Falha no pagamento para customer: ${customerId}`);
  // TODO: Enviar email de aviso ao usuário
}

// Helper: Ler body como buffer (necessário para verificação do Stripe)
async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
