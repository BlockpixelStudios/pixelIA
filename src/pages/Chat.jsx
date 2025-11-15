import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestedPrompts = [
    "Me dê dicas de produtividade",
    "Explique o que é IA",
    "Explique o que é física quântica",
    "Conte uma história engraçada e interessante"
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages();
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
    } else {
      setUser(user);
    }
  };

  const loadUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserProfile(data);
      checkMessageLimit(data);
    }
  };

  const checkMessageLimit = (profile) => {
    if (profile.plan === 'essencial') {
      const today = new Date().toISOString().split('T')[0];
      const lastMessageDate = profile.last_message_date?.split('T')[0];
      
      if (lastMessageDate === today && profile.messages_used_today >= 50) {
        setShowLimitWarning(true);
      }
    }
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setConversations(data);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', currentConversation.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { 
          user_id: user.id, 
          title: 'Nova Conversa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (data) {
      setCurrentConversation(data);
      setConversations([data, ...conversations]);
      setMessages([]);
      setShowLimitWarning(false);
    }
  };

  const updateConversationTitle = async (conversationId, firstMessage) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    loadConversations();
  };

  const deleteConversation = async (conversationId) => {
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
    loadConversations();
  };

  const updateMessageCount = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastMessageDate = userProfile.last_message_date?.split('T')[0];
    
    let newCount = 1;
    if (lastMessageDate === today) {
      newCount = (userProfile.messages_used_today || 0) + 1;
    }

    await supabase
      .from('user_profiles')
      .update({
        messages_used_today: newCount,
        last_message_date: new Date().toISOString()
      })
      .eq('user_id', user.id);

    setUserProfile({ ...userProfile, messages_used_today: newCount, last_message_date: new Date().toISOString() });
    
    if (userProfile.plan === 'essencial' && newCount >= 50) {
      setShowLimitWarning(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleSuggestedPrompt = async (prompt) => {
    // Se não tem conversa, criar uma nova primeiro
    if (!currentConversation) {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { 
            user_id: user.id, 
            title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (data) {
        setCurrentConversation(data);
        setConversations([data, ...conversations]);
        // Aguardar um pouco para garantir que a conversa foi criada
        setTimeout(() => handleSend(prompt, data.id), 100);
      }
    } else {
      handleSend(prompt, currentConversation.id);
    }
  };

  const handleSend = async (messageText = input, conversationId = currentConversation?.id) => {
    if (!messageText.trim() || isLoading || !conversationId) return;

    // Verificar limite de mensagens
    if (userProfile.plan === 'essencial') {
      const today = new Date().toISOString().split('T')[0];
      const lastMessageDate = userProfile.last_message_date?.split('T')[0];
      const count = lastMessageDate === today ? userProfile.messages_used_today : 0;
      
      if (count >= 50) {
        setShowLimitWarning(true);
        return;
      }
    }

    const userMessage = {
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      topic: 'chat',
      created_at: new Date().toISOString()
    };

    setInput('');
    setIsLoading(true);

    // Salvar mensagem do usuário
    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert([userMessage])
      .select()
      .single();

    if (savedUserMsg) {
      setMessages(prev => [...prev, savedUserMsg]);
    }

    // Atualizar título da conversa se for a primeira mensagem
    if (messages.length === 0) {
      updateConversationTitle(conversationId, messageText);
    }

    // Atualizar contador de mensagens
    await updateMessageCount();

    try {
      const model = userProfile.plan === 'avancado' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [...messages, savedUserMsg].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        conversation_id: conversationId,
        role: 'assistant',
        content: data.choices[0].message.content,
        topic: 'chat',
        created_at: new Date().toISOString()
      };
      
      // Salvar resposta do assistente
      const { data: savedAssistantMsg } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (savedAssistantMsg) {
        setMessages(prev => [...prev, savedAssistantMsg]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMsg = {
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        topic: 'chat',
        created_at: new Date().toISOString()
      };
      
      const { data: savedErrorMsg } = await supabase
        .from('messages')
        .insert([errorMsg])
        .select()
        .single();

      if (savedErrorMsg) {
        setMessages(prev => [...prev, savedErrorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // TODO: Implementar upload de arquivo
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia!';
    if (hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  };

  const getModelName = () => {
    return userProfile?.plan === 'avancado' ? 'Llama 3.3 70B' : 'Llama 3.1 8B';
  };

  const getNextResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Cosmic Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Logo no topo */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">✨</span>
        </div>
        <h1 className="text-white text-2xl font-bold">PixelIA</h1>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="h-full bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col pt-20">
            <button
              onClick={createNewConversation}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl py-3 px-4 hover:from-pink-600 hover:to-purple-700 transition-all mb-4 flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Conversa
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentConversation?.id === conv.id
                      ? 'bg-white/20 border border-white/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm truncate flex-1">{conv.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="text-white/50 hover:text-red-400 transition-colors ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-white/70 text-sm">
                <p className="font-semibold mb-1">{userProfile?.plan === 'avancado' ? '✨ Plano Avançado' : '🆓 Plano Essencial'}</p>
                {userProfile?.plan === 'essencial' && (
                  <p className="text-xs">Mensagens hoje: {userProfile.messages_used_today || 0}/50</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-20 z-20 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-lg p-2 hover:bg-white/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
          </svg>
        </button>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col pt-16">
          {!currentConversation || messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-white mb-4">{getGreeting()}</h1>
                <p className="text-xl text-white/70">Como posso te ajudar hoje?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl p-6 hover:bg-white/20 transition-all text-left group"
                  >
                    <p className="text-sm group-hover:text-pink-300 transition-colors">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages Area
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-pink-300/30 text-white'
                        : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Status Bar acima do input */}
          <div className="px-4 py-2 border-t border-white/10 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
              <span className="text-white/70">
                🤖 Modelo: <span className="font-semibold text-white">{getModelName()}</span>
              </span>
              
              {showLimitWarning ? (
                <span className="text-red-400 font-semibold animate-pulse">
                  🚨 Limite atingido! Novo limite: {getNextResetTime()}
                </span>
              ) : userProfile?.plan === 'essencial' && (
                <span className="text-white/70">
                  Mensagens: {userProfile.messages_used_today || 0}/50
                </span>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-2 flex items-end gap-2 shadow-2xl">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white/70 hover:text-white p-2 transition-colors flex-shrink-0"
                  title="Anexar arquivo"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 outline-none resize-none px-4 py-3 max-h-[200px] min-h-[24px] text-[15px]"
                  rows="1"
                  disabled={isLoading || showLimitWarning}
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading || showLimitWarning}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Stars */
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, white, transparent),
            radial-gradient(2px 2px at 90px 10px, white, transparent);
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.7;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 20s ease-in-out infinite;
          opacity: 0.6;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: rgba(168, 85, 247, 0.4);
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 300px;
          height: 300px;
          background: rgba(236, 72, 153, 0.4);
          bottom: 20%;
          right: 20%;
          animation-delay: 5s;
        }

        .blob-3 {
          width: 350px;
          height: 350px;
          background: rgba(99, 102, 241, 0.3);
          top: 50%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(50px, -50px); }
          50% { transform: translate(-30px, 30px); }
          75% { transform: translate(40px, 40px); }
        }

        /* Scrollbar personalizado */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
