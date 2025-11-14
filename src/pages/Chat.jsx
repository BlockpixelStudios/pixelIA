import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Trash2, LogOut, MessageSquare, Copy, RotateCcw, Flag, CheckCircle2, Crown, AlertCircle, Clock, Gift, Loader2, Menu, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { PLANS, GROQ_API_KEY } from '../config/plans';

export default function Chat({ user }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados de plano e limites
  const [userPlan, setUserPlan] = useState('free');
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  
  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      // Verificar se é guest
      const guestData = localStorage.getItem('guest_user');
      if (guestData) {
        const guest = JSON.parse(guestData);
        if (guest.id === user.id) {
          setIsGuest(true);
          const guestMessages = parseInt(localStorage.getItem('guest_messages_used') || '0');
          setMessagesUsedToday(guestMessages);
        }
      } else {
        loadUserData();
      }
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user || isGuest) return;

    try {
      // Carregar perfil do usuário
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, criar
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            plan: 'free',
            messages_used_today: 0,
            last_message_date: new Date()
          })
          .select()
          .single();
        
        profile = newProfile;
      }

      if (profile) {
        setUserPlan(profile.plan || 'free');
        
        // Resetar contador se for novo dia
        const today = new Date().toDateString();
        const lastDate = profile.last_message_date 
          ? new Date(profile.last_message_date).toDateString() 
          : null;
        
        if (today !== lastDate) {
          setMessagesUsedToday(0);
          await supabase
            .from('user_profiles')
            .update({ 
              messages_used_today: 0, 
              last_message_date: new Date() 
            })
            .eq('user_id', user.id);
        } else {
          setMessagesUsedToday(profile.messages_used_today || 0);
        }
      }

      // Carregar conversas
      loadConversations();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadConversations = async () => {
    if (isGuest) return;

    const currentPlan = PLANS[userPlan.toUpperCase()];
    const daysLimit = currentPlan?.limits.historyDays || 7;
    
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (daysLimit !== Infinity) {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - daysLimit);
      query = query.gte('created_at', limitDate.toISOString());
    }
    
    const { data } = await query;
    
    if (data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      setCurrentConversationId(conversationId);
      setSidebarOpen(false);
    }
  };

  const canSendMessage = () => {
    if (isGuest) return messagesUsedToday < 10;
    
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
    
    if (isGuest) {
      localStorage.setItem('guest_messages_used', newCount.toString());
    } else if (user) {
      await supabase
        .from('user_profiles')
        .update({ 
          messages_used_today: newCount,
          last_message_date: new Date()
        })
        .eq('user_id', user.id);
    }
  };

  const saveMessageToDb = async (role, content) => {
    if (isGuest) return;
    
    try {
      if (!currentConversationId) {
        // Criar nova conversa
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
          
          // Salvar mensagem
          await supabase.from('messages').insert({
            conversation_id: convData.id,
            role,
            content
          });
        }
      } else {
        // Salvar na conversa existente
        await supabase.from('messages').insert({
          conversation_id: currentConversationId,
          role,
          content
        });
        
        // Atualizar timestamp
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
      // Usar modelo baseado no plano
      const currentPlan = PLANS[userPlan.toUpperCase()];
      const model = currentPlan?.limits.model || 'llama-3.1-70b-versatile';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
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
        loadConversations();
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
    setSidebarOpen(false);
  };

  const deleteConversation = async (convId) => {
    if (isGuest) return;
    
    await supabase.from('conversations').delete().eq('id', convId);
    loadConversations();
    
    if (currentConversationId === convId) {
      startNewConversation();
    }
  };

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem('guest_user');
      localStorage.removeItem('guest_messages_used');
    } else {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  const redeemPromoCode = async () => {
    if (!promoCode.trim() || isGuest) return;
    
    setPromoLoading(true);
    setPromoError('');

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Código inválido ou expirado!');
      }

      if (data.current_uses >= data.max_uses) {
        throw new Error('Código já atingiu o limite de usos!');
      }

      // Marcar código como usado
      await supabase
        .from('promo_codes')
        .update({ 
          current_uses: data.current_uses + 1,
          is_used: data.max_uses === 1,
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
      loadUserData();
    } catch (error) {
      setPromoError(error.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const suggestedPrompts = [
    "Explique IA de forma simples",
    "Crie uma história criativa",
    "Me ajude com programação",
    "Dê dicas de produtividade"
  ];

  // RENDER DO COMPONENTE
  return (
    <>
      {/* MODAL DE UPGRADE */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Limite Atingido!</h2>
              <p className="text-gray-400">
                {isGuest 
                  ? 'Visitantes têm limite de 10 mensagens/dia' 
                  : 'Você atingiu o limite do plano gratuito'}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🌟 Plano Avançado</h3>
              <ul className="space-y-2 text-white">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Mensagens ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Modelo premium mais rápido
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Histórico completo
                </li>
              </ul>
              <div className="mt-4 text-center">
                <span className="text-3xl font-bold text-white">R$ 19,90</span>
                <span className="text-gray-400">/mês</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/planos')}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition"
              >
                Ver Planos
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-6 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
              >
                Fechar
              </button>
            </div>

            {!isGuest && (
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setShowPromoModal(true);
                }}
                className="w-full mt-3 text-gray-400 hover:text-white text-sm transition flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Tenho um código promocional
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CÓDIGO PROMOCIONAL */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <Gift className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Resgatar Código</h2>
              <p className="text-gray-400">Digite seu código promocional</p>
            </div>

            {promoError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4">
                <p className="text-red-200 text-sm">{promoError}</p>
              </div>
            )}

            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="CODIGO-EXEMPLO"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 font-mono uppercase mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={redeemPromoCode}
                disabled={!promoCode.trim() || promoLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {promoLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Resgatar'
                )}
              </button>
              <button
                onClick={() => {
                  setShowPromoModal(false);
                  setPromoCode('');
                  setPromoError('');
                }}
                className="px-6 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div className="flex h-screen bg-black">
        {/* SIDEBAR - Desktop */}
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
                {conversations.length === 0 ? (
                  <p className="text-xs text-gray-600 px-2 py-4">Nenhuma conversa ainda</p>
                ) : (
                  conversations.map((conv) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR - Mobile */}
        {!isGuest && sidebarOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="w-64 h-full bg-gray-900 border-r border-gray-800 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 space-y-3">
                <button
                  onClick={startNewConversation}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Nova Conversa
                </button>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-semibold px-2">CONVERSAS</p>
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg text-sm cursor-pointer ${
                        currentConversationId === conv.id
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400'
                      }`}
                      onClick={() => loadMessages(conv.id)}
                    >
                      <p className="truncate">{conv.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CHAT */}
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isGuest && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-gray-400 hover:text-white"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                )}
                
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
                      isGuest ? '👤 Visitante' : '🆓 Essencial'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isGuest && (
                  <button
                    onClick={startNewConversation}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Nova
                  </button>
                )}
                {userPlan !== 'pro' && (
                  <button
                    onClick={() => navigate('/planos')}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:scale-105 transition text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* MESSAGES */}
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

          {/* STATUS BAR */}
          <div className="bg-gray-900 border-t border-gray-800 py-2 px-4">
            <div className="max-w-5xl mx-auto">
              {userPlan !== 'pro' && !canSendMessage() ? (
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite atingido! Reseta em: {getResetTime()}</span>
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
                    <>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{getRemainingMessages()} mensagens restantes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Reseta em: {getResetTime()}</span>
                      </div>
                    </>
                  )}
                  {userPlan === 'pro' && (
                    <div className="flex items-center gap-1 text-green-400">
                      <Crown className="w-3 h-3" />
                      <span>Mensagens ilimitadas ✨</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* INPUT */}
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
