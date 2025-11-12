import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Zap, Heart, LogOut, MessageSquare, User, Mail, Lock, ArrowRight, Menu, X, Copy, RotateCcw, Flag, CheckCircle2, UserCircle, Loader2, Crown, Gift, CreditCard, FileText, Shield, Cookie, ExternalLink, AlertCircle, Clock } from 'lucide-react';
import { supabase } from './supabaseClient';
import { PLANS } from './plans';
import { LEGAL_CONTENT } from './legal';
import { initTawkTo } from './tawkConfig';

export default function PixelIAApp() {
  // Estados principais
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [isGuest, setIsGuest] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Estados de planos e limites
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  // Estados legais
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [legalPage, setLegalPage] = useState(null);
  
  // Estados de formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar
  useEffect(() => {
    checkUser();
    initTawkTo();
    checkCookieConsent();
  }, []);

  const checkCookieConsent = () => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      setShowCookieBanner(false);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieBanner(false);
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setIsGuest(false);
      await loadUserData(session.user.id);
    }
  };

  const loadUserData = async (userId) => {
    // Carregar plano do usuário
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('plan, messages_used_today, last_message_date')
      .eq('user_id', userId)
      .single();
    
    if (userData) {
      setUserPlan(userData.plan || 'free');
      
      // Resetar contador se for novo dia
      const today = new Date().toDateString();
      const lastDate = userData.last_message_date ? new Date(userData.last_message_date).toDateString() : null;
      
      if (today !== lastDate) {
        setMessagesUsedToday(0);
        await supabase
          .from('user_profiles')
          .update({ messages_used_today: 0, last_message_date: new Date() })
          .eq('user_id', userId);
      } else {
        setMessagesUsedToday(userData.messages_used_today || 0);
      }
    } else {
      // Criar perfil se não existir
      await supabase.from('user_profiles').insert({
        user_id: userId,
        plan: 'free',
        messages_used_today: 0,
        last_message_date: new Date()
      });
    }
    
    loadConversations(userId);
  };

  const loadConversations = async (userId) => {
    const currentPlan = PLANS[userPlan.toUpperCase()];
    const daysLimit = currentPlan?.limits.historyDays || 7;
    
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (daysLimit !== Infinity) {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - daysLimit);
      query = query.gte('created_at', limitDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (!error && data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
      setCurrentConversationId(conversationId);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setUser(data.user);
        setIsGuest(false);
        setShowApiInput(true);
        await loadUserData(data.user.id);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser(data.user);
          setIsGuest(false);
          setShowApiInput(true);
          setAuthError('✅ Conta criada! Verifique seu email.');
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestMode = () => {
    setUser({ id: 'guest', email: 'guest@pixelia.com' });
    setIsGuest(true);
    setUserPlan('free');
    setShowApiInput(true);
  };

  const handleLogout = async () => {
    if (!isGuest) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsGuest(false);
    setMessages([]);
    setConversations([]);
    setCurrentConversationId(null);
    setPage('landing');
    setGroqApiKey('');
    setUserPlan('free');
    setMessagesUsedToday(0);
  };

  const canSendMessage = () => {
    if (isGuest) return messagesUsedToday < 10; // Visitantes: 10 msg/dia
    
    const currentPlan = PLANS[userPlan.toUpperCase()];
    const limit = currentPlan?.limits.messagesPerDay || 50;
    
    return messagesUsedToday < limit;
  };

  const getRemainingMessages = () => {
    if (userPlan === 'pro') return '∞';
    
    const limit = isGuest ? 10 : (PLANS[userPlan.toUpperCase()]?.limits.messagesPerDay || 50);
    return Math.max(0, limit - messagesUsedToday);
  };

  const getResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  const incrementMessageCount = async () => {
    const newCount = messagesUsedToday + 1;
    setMessagesUsedToday(newCount);
    
    if (!isGuest && user) {
      await supabase
        .from('user_profiles')
        .update({ 
          messages_used_today: newCount,
          last_message_date: new Date()
        })
        .eq('user_id', user.id);
    }
  };

  const startChat = () => {
    if (groqApiKey.trim()) {
      setShowApiInput(false);
      setPage('chat');
      setMessages([]);
    }
  };

  const testApiKey = async () => {
    setTestingApi(true);
    setTestResult(null);

    try {
      if (!groqApiKey.startsWith('gsk_')) {
        setTestResult({
          success: false,
          message: '❌ Formato inválido! A chave deve começar com "gsk_"'
        });
        setTestingApi(false);
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey}` }
      });

      if (!response.ok) {
        setTestResult({
          success: false,
          message: '❌ Chave inválida!'
        });
        setTestingApi(false);
        return;
      }

      setTestResult({
        success: true,
        message: '✅ Chave funcionando!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: '❌ Erro ao testar!'
      });
    } finally {
      setTestingApi(false);
    }
  };

  const saveMessageToDb = async (role, content) => {
    if (isGuest) return;
    
    try {
      if (!currentConversationId) {
        const firstWords = content.substring(0, 50);
        const { data: convData } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: firstWords + (content.length > 50 ? '...' : '')
          })
          .select()
          .single();
        
        if (convData) {
          setCurrentConversationId(convData.id);
          await supabase.from('messages').insert({
            conversation_id: convData.id,
            role,
            content
          });
        }
      } else {
        await supabase.from('messages').insert({
          conversation_id: currentConversationId,
          role,
          content
        });
        
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const sendMessage = async (customPrompt = null) => {
    const messageToSend = customPrompt || input;
    if (!messageToSend.trim() || isLoading) return;

    // Verificar limite
    if (!canSendMessage()) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await incrementMessageCount();
    await saveMessageToDb('user', messageToSend);

    try {
      const model = userPlan === 'pro' ? 'llama-3.3-70b-versatile' : 'llama-3.1-70b-versatile';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToDb('assistant', assistantMessage.content);
      
      if (!isGuest) {
        loadConversations(user.id);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Erro: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const resendMessage = (index) => {
    const userMsg = messages[index - 1];
    if (userMsg?.role === 'user') {
      sendMessage(userMsg.content);
    }
  };

  const reportMessage = () => {
    alert('Mensagem reportada! Obrigado pelo feedback.');
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const deleteConversation = async (convId) => {
    if (isGuest) return;
    
    await supabase.from('conversations').delete().eq('id', convId);
    loadConversations(user.id);
    
    if (currentConversationId === convId) {
      startNewConversation();
    }
  };

  const redeemPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoLoading(true);
    setPromoError('');

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_used', false)
        .single();

      if (error || !data) {
        throw new Error('Código inválido ou já usado!');
      }

      // Marcar código como usado
      await supabase
        .from('promo_codes')
        .update({ 
          is_used: true, 
          used_by: user.id,
          used_at: new Date()
        })
        .eq('code', promoCode.toUpperCase());

      // Atualizar plano do usuário
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (data.days || 30));

      await supabase
        .from('user_profiles')
        .update({ 
          plan: 'pro',
          plan_expiry: expiryDate
        })
        .eq('user_id', user.id);

      setUserPlan('pro');
      setShowPromoModal(false);
      setPromoCode('');
      alert('✅ Código resgatado! Plano Avançado ativado!');
    } catch (error) {
      setPromoError(error.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleUpgrade = async () => {
    // Aqui você integraria com Stripe
    alert('🚧 Integração Stripe em breve! Por enquanto, use um código promocional.');
    setShowUpgradeModal(false);
    setShowPromoModal(true);
  };

  const suggestedPrompts = [
    "Explique IA de forma simples",
    "Crie uma história criativa",
    "Me ajude a programar em Python",
    "Dê dicas de produtividade"
  ];

  // MODAL DE UPGRADE
  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-3xl p-8 max-w-4xl w-full relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
        
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl mb-4">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Desbloqueie o Poder Total
            </h2>
            <p className="text-gray-400">Escolha o plano perfeito para você</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Plano FREE */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🆓</span>
                <h3 className="text-2xl font-bold text-white">Essencial</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-1">Grátis</p>
              <p className="text-gray-400 mb-6">Para sempre</p>
              <ul className="space-y-3 mb-6">
                {PLANS.FREE.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full bg-gray-700 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed"
              >
                Plano Atual
              </button>
            </div>

            {/* Plano PRO */}
            <div className="relative bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border-2 border-cyan-500 rounded-2xl p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-1 rounded-full">
                <span className="text-xs font-bold text-white">RECOMENDADO</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <h3 className="text-2xl font-bold text-white">Avançado</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  R$ 19,90
                </p>
                <span className="text-gray-400">/mês</span>
              </div>
              <p className="text-gray-400 mb-6">ou R$ 199/ano (economize 2 meses)</p>
              <ul className="space-y-3 mb-6">
                {PLANS.PRO.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-white">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-cyan-500/50"
              >
                Assinar Agora
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setShowPromoModal(true);
                }}
                className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Tenho um código
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              💳 Pagamento seguro via Stripe • 🔒 Cancele quando quiser • ⚡ Ativação imediata
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // MODAL DE CÓDIGO PROMOCIONAL
  const PromoModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-3xl p-8 max-w-md w-full relative">
        <button
          onClick={() => {
            setShowPromoModal(false);
            setPromoCode('');
            setPromoError('');
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl mb-4">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Resgatar Código</h2>
          <p className="text-gray-400">Digite seu código promocional</p>
        </div>

        {promoError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
            <p className="text-red-200 text-sm">{promoError}</p>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="CODIGO-EXEMPLO"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 font-mono uppercase"
          />
          
          <button
            onClick={redeemPromoCode}
            disabled={!promoCode.trim() || promoLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {promoLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              'Resgatar Código'
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-400">
            💡 <strong>Dica:</strong> Códigos promocionais podem ser obtidos em eventos, parcerias ou promoções especiais da PixelIA.
          </p>
        </div>
      </div>
    </div>
  );

  // BANNER DE COOKIES
  const CookieBanner = () => (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl z-50">
      <div className="flex items-start gap-4">
        <Cookie className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">🍪 Cookies</h3>
          <p className="text-gray-400 text-sm mb-4">
            Usamos cookies essenciais para o funcionamento do site. Ao continuar, você concorda com nossa política.
          </p>
          <div className="flex gap-2">
            <button
              onClick={acceptCookies}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Aceitar
            </button>
            <button
              onClick={() => {
                setLegalPage('cookies');
                setPage('legal');
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Saber mais
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // PÁGINA LEGAL
  const LegalPage = ({ type }) => {
    const content = LEGAL_CONTENT[type];
    
    return (
      <div className="min-h-screen bg-black text-white">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setPage('landing')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Voltar
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <span className="font-bold">PixelIA</span>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{content.title}</h1>
            <p className="text-gray-400">Última atualização: {content.lastUpdate}</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {content.content}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Dúvidas? Entre em contato: <a href="mailto:suporte@pixelia.ai" className="text-cyan-400 hover:underline">suporte@pixelia.ai</a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar página legal se estiver ativa
  if (page === 'legal' && legalPage) {
    return <LegalPage type={legalPage} />;
  }

  // LANDING PAGE
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_50%)]"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 rounded-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PixelIA</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-gray-300 hover:text-white transition"
              >
                Planos
              </button>
              <button
                onClick={() => setPage('auth')}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:scale-105 transition font-semibold"
              >
                <User className="w-4 h-4" />
                Entrar
              </button>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 p-4 space-y-3">
              <button
                onClick={() => { setShowUpgradeModal(true); setMenuOpen(false); }}
                className="w-full text-left text-gray-300 hover:text-white transition px-4 py-2"
              >
                Planos
              </button>
              <button
                onClick={() => { setPage('auth'); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                <User className="w-4 h-4" />
                Entrar
              </button>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-6 rounded-3xl">
                  <Sparkles className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight">
              Converse com a<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                PixelIA
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Assistente de IA poderosa com modelos avançados.
              <br />
              <strong className="text-white">Gratuito</strong> para começar. <strong className="text-white">Ilimitado</strong> para crescer.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => setPage('auth')}
                className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-cyan-500/50 flex items-center gap-3"
              >
                Começar Grátis
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="group bg-gray-800 hover:bg-gray-700 text-white px-12 py-5 rounded-2xl font-bold text-lg transition flex items-center gap-3"
              >
                <Crown className="w-6 h-6 text-yellow-400" />
                Ver Planos
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>50 mensagens/dia grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            {[
              { 
                icon: Zap, 
                title: 'Ultra Rápido', 
                desc: 'Respostas instantâneas com tecnologia GROQ',
                color: 'from-yellow-500 to-orange-500'
              },
              { 
                icon: Shield, 
                title: 'Seguro & Privado', 
                desc: 'Seus dados protegidos com criptografia',
                color: 'from-green-500 to-emerald-500'
              },
              { 
                icon: MessageSquare, 
                title: 'Histórico Completo', 
                desc: 'Acesse suas conversas de qualquer lugar',
                color: 'from-cyan-500 to-blue-500'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-gray-700 rounded-3xl p-8 transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className={`inline-block bg-gradient-to-r ${feature.color} p-3 rounded-2xl mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-gray-900 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  <span className="font-bold text-white text-lg">PixelIA</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Assistente de IA poderosa e acessível para todos.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Produto</h4>
                <div className="space-y-2">
                  <button onClick={() => setShowUpgradeModal(true)} className="block text-gray-400 hover:text-white transition text-sm">
                    Planos
                  </button>
                  <button className="block text-gray-400 hover:text-white transition text-sm">
                    Recursos
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Legal</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setLegalPage('terms'); setPage('legal'); }}
                    className="block text-gray-400 hover:text-white transition text-sm"
                  >
                    Termos de Uso
                  </button>
                  <button 
                    onClick={() => { setLegalPage('privacy'); setPage('legal'); }}
                    className="block text-gray-400 hover:text-white transition text-sm"
                  >
                    Privacidade
                  </button>
                  <button 
                    onClick={() => { setLegalPage('cookies'); setPage('legal'); }}
                    className="block text-gray-400 hover:text-white transition text-sm"
                  >
                    Cookies
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Suporte</h4>
                <button 
                  onClick={() => window.Tawk_API && window.Tawk_API.toggle()}
                  className="block text-gray-400 hover:text-white transition text-sm mb-2"
                >
                  Chat ao Vivo
                </button>
                <a href="mailto:suporte@pixelia.ai" className="block text-gray-400 hover:text-white transition text-sm">
                  Email
                </a>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 PixelIA. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>Desenvolvido por</span>
                <span className="font-semibold text-white">GROQ</span>
                <span>×</span>
                <span className="font-semibold text-white">Claude AI</span>
                <span>×</span>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
                <span className="font-semibold text-white">Blockpixel Studios</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Cookie Banner */}
        {showCookieBanner && <CookieBanner />}
      </div>
    );
  }

  // AUTH PAGE (mesmo código anterior mas com design novo)
  if (page === 'auth' || (user && showApiInput)) {
    if (!user) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 max-w-md w-full relative z-10">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-2xl mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {authMode === 'login' ? 'Bem-vindo!' : 'Criar conta'}
              </h2>
              <p className="text-gray-400">
                {authMode === 'login' ? 'Entre para continuar' : 'Junte-se gratuitamente'}
              </p>
            </div>

            {authError && (
              <div className={`mb-4 p-3 rounded-xl ${authError.includes('✅') ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'}`}>
                <p className="text-sm">{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {authMode === 'login' ? 'Entrando...' : 'Criando...'}
                  </>
                ) : (
                  authMode === 'login' ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={handleGuestMode}
                className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Entrar como Visitante
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                ⚠️ Visitantes têm 10 mensagens/dia e sem histórico
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>

            <button
              onClick={() => setPage('landing')}
              className="mt-4 w-full text-gray-500 hover:text-gray-300 transition text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      );
    }

    // API Key Input (mesmo código)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 max-w-md w-full relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-2xl mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Configurar API</h2>
            <p className="text-gray-400">Última etapa!</p>
            {isGuest && (
              <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                <p className="text-yellow-200 text-sm">⚠️ Modo Visitante: 10 msg/dia, sem salvar</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Chave GROQ</label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
              />
            </div>

            <button
              onClick={testApiKey}
              disabled={!groqApiKey.trim() || testingApi}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {testingApi ? '🔍 Testando...' : '🧪 Testar Chave'}
            </button>

            {testResult && (
              <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                <p className="text-white font-bold">{testResult.message}</p>
              </div>
            )}

            <button
              onClick={startChat}
              disabled={!groqApiKey.trim() || (testResult && !testResult.success)}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
            >
              Começar a Conversar
            </button>

            <div className="bg-gray-800/50 rounded-xl p-4 text-sm">
              <p className="font-semibold text-white mb-2">📌 Como obter:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400 text-xs">
                <li><a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline text-cyan-400">console.groq.com</a></li>
                <li>Crie conta gratuita</li>
                <li>Gere API Key</li>
                <li>Cole e teste</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHAT PAGE - Layout Ultra Dark Moderno
  return (
    <>
      {/* Modals */}
      {showUpgradeModal && <UpgradeModal />}
      {showPromoModal && <PromoModal />}

      <div className="flex h-screen bg-black">
        {/* Sidebar */}
        {!isGuest && (
          <div className="hidden md:block w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
            <div className="p-4 space-y-3">
              <button
                onClick={startNewConversation}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Nova Conversa
              </button>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-semibold px-2">CONVERSAS</p>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative p-3 rounded-lg text-sm cursor-pointer transition ${
                      currentConversationId === conv.id
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800/50'
                    }`}
                    onClick={() => loadMessages(conv.id)}
                  >
                    <p className="truncate pr-6">{conv.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">PixelIA</h1>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    {userPlan === 'pro' ? (
                      <>
                        <Crown className="w-3 h-3 text-yellow-400" />
                        Plano Avançado
                      </>
                    ) : (
                      <>
                        {isGuest ? '👤 Visitante' : `🆓 ${user?.email?.split('@')[0]}`}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isGuest && (
                  <button
                    onClick={startNewConversation}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nova
                  </button>
                )}
                {userPlan !== 'pro' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:scale-105 transition"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-5xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="text-center space-y-6 py-12">
                  <div className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-3xl">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {isGuest ? 'Olá Visitante! 👋' : 'Bem-vindo! 👋'}
                  </h2>
                  <p className="text-gray-400 text-lg">Como posso te ajudar?</p>
                  
                  <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 text-left text-white transition hover:scale-105"
                      >
                        <Sparkles className="w-5 h-5 text-cyan-400 mb-2" />
                        <p className="text-sm">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-gray-900 border border-gray-800 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                        <button
                          onClick={() => copyMessage(msg.content, i)}
                          className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                        >
                          {copiedIndex === i ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copiar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => resendMessage(i)}
                          className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Refazer
                        </button>
                        <button
                          onClick={reportMessage}
                          className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Flag className="w-3 h-3" />
                          Reportar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Status Bar (substitui footer) */}
          <div className="bg-gray-900 border-t border-gray-800 py-2 px-4">
            <div className="max-w-5xl mx-auto">
              {userPlan !== 'pro' && !canSendMessage() ? (
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite atingido! Novo limite em: {getResetTime()}</span>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-lg font-semibold hover:scale-105 transition"
                  >
                    Upgrade
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 text-gray-400 text-xs">
                  {userPlan !== 'pro' && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{getRemainingMessages()} mensagens restantes</span>
                    </div>
                  )}
                  {userPlan !== 'pro' && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Reseta em: {getResetTime()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <div className="max-w-5xl mx-auto flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={canSendMessage() ? "Digite sua mensagem..." : "Limite atingido..."}
                disabled={isLoading || !canSendMessage()}
                rows={1}
                className="flex-1 px-5 py-4 bg-gray-800 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 resize-none text-white placeholder-gray-500 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || !canSendMessage()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 font-semibold"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
         }
