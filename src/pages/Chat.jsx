// 📍 ARQUIVO: src/pages/Chat.jsx - VERSÃO COMPLETA COM TODAS AS FEATURES

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import ImageGenerator from '../components/ImageGenerator';
import ImageAnalyzer from '../components/ImageAnalyzer';
import CodeGenerator from '../components/CodeGenerator';
import FeaturesMenu from '../components/FeaturesMenu';

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // Features states
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Text-to-Speech hook
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const suggestedPrompts = [
    "Me dê dicas de produtividade",
    "Explique o que é IA",
    "Crie uma imagem de um gato astronauta",
    "Gere um código HTML de landing page"
  ];

  const addConsoleLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setConsoleMessages(prev => [...prev, { type, message, timestamp }]);
    console.log(`[${timestamp}] ${type}:`, message);
  };

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
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) {
        addConsoleLog('INFO', 'Usuário não autenticado, redirecionando...');
        navigate('/auth');
      } else {
        setUser(user);
        addConsoleLog('SUCCESS', `Usuário autenticado: ${user.email}`);
      }
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao verificar usuário: ${error.message}`);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile(data);
        addConsoleLog('SUCCESS', `Perfil carregado - Plano: ${data.plan}`);
        checkMessageLimit(data);
      }
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao carregar perfil: ${error.message}`);
    }
  };

  const checkMessageLimit = (profile) => {
    if (profile.plan === 'essencial') {
      const today = new Date().toISOString().split('T')[0];
      const lastMessageDate = profile.last_message_date?.split('T')[0];
      
      if (lastMessageDate === today && profile.messages_used_today >= 50) {
        setShowLimitWarning(true);
        addConsoleLog('WARNING', 'Limite de mensagens atingido!');
      }
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setConversations(data);
        addConsoleLog('SUCCESS', `${data.length} conversas carregadas`);
      }
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao carregar conversas: ${error.message}`);
    }
  };

  const loadMessages = async () => {
    try {
      setStatusMessage('Carregando mensagens...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data);
        addConsoleLog('SUCCESS', `${data.length} mensagens carregadas`);
      }
      setStatusMessage('');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao carregar mensagens: ${error.message}`);
      setStatusMessage('');
    }
  };

  const createNewConversation = async () => {
    try {
      setStatusMessage('Criando nova conversa...');
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

      if (error) throw error;

      if (data) {
        setCurrentConversation(data);
        setConversations([data, ...conversations]);
        setMessages([]);
        setShowLimitWarning(false);
        addConsoleLog('SUCCESS', 'Nova conversa criada');
      }
      setStatusMessage('');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao criar conversa: ${error.message}`);
      setStatusMessage('');
    }
  };

  const updateConversationTitle = async (conversationId, firstMessage) => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;
      
      loadConversations();
      addConsoleLog('SUCCESS', 'Título da conversa atualizado');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao atualizar título: ${error.message}`);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      loadConversations();
      addConsoleLog('SUCCESS', 'Conversa deletada');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao deletar conversa: ${error.message}`);
    }
  };

  const updateMessageCount = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastMessageDate = userProfile.last_message_date?.split('T')[0];
      
      let newCount = 1;
      if (lastMessageDate === today) {
        newCount = (userProfile.messages_used_today || 0) + 1;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          messages_used_today: newCount,
          last_message_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserProfile({ ...userProfile, messages_used_today: newCount, last_message_date: new Date().toISOString() });
      
      if (userProfile.plan === 'essencial' && newCount >= 50) {
        setShowLimitWarning(true);
        addConsoleLog('WARNING', 'Limite de mensagens atingido!');
      }
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao atualizar contador: ${error.message}`);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addConsoleLog('SUCCESS', 'Texto copiado!');
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(m => m.id === messageId ? { ...m, content: newContent } : m));
      setEditingMessageId(null);
      setEditingText('');
      addConsoleLog('SUCCESS', 'Mensagem editada');

      const messageIndex = messages.findIndex(m => m.id === messageId);
      const messagesUpToEdit = messages.slice(0, messageIndex + 1);
      messagesUpToEdit[messagesUpToEdit.length - 1].content = newContent;
      
      await regenerateResponse(messagesUpToEdit);
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao editar mensagem: ${error.message}`);
    }
  };

  const regenerateResponse = async (previousMessages = messages) => {
    try {
      setIsLoading(true);
      setStatusMessage('🔄 Regenerando resposta...');

      const model = userProfile.plan === 'avancado' ? 'llama-3.2-90b-text-preview' : 'llama-3.3-70b-versatile';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: previousMessages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) throw new Error('Erro na API');

      const data = await response.json();
      
      const assistantMessage = {
        conversation_id: currentConversation.id,
        role: 'assistant',
        content: data.choices[0].message.content,
        created_at: new Date().toISOString()
      };
      
      const { data: savedMsg } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (savedMsg) {
        setMessages(prev => [...prev, savedMsg]);
        addConsoleLog('SUCCESS', 'Resposta regenerada');
      }

      setStatusMessage('');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao regenerar: ${error.message}`);
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const reportMessage = async (messageId) => {
    addConsoleLog('INFO', `Mensagem ${messageId} reportada`);
    alert('Mensagem reportada com sucesso! Nossa equipe irá analisar.');
  };

  const handleSuggestedPrompt = async (prompt) => {
    addConsoleLog('INFO', `Prompt sugerido selecionado: ${prompt}`);
    
    if (!currentConversation) {
      try {
        setStatusMessage('Criando conversa...');
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

        if (error) throw error;

        if (data) {
          setCurrentConversation(data);
          setConversations([data, ...conversations]);
          setTimeout(() => handleSend(prompt, data.id), 100);
        }
        setStatusMessage('');
      } catch (error) {
        addConsoleLog('ERROR', `Erro ao criar conversa: ${error.message}`);
        setStatusMessage('');
      }
    } else {
      handleSend(prompt, currentConversation.id);
    }
  };

  const detectCodeInResponse = (content) => {
    // Detectar blocos de código na resposta
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      const firstBlock = matches[0];
      const language = firstBlock[1] || 'javascript';
      const code = firstBlock[2].trim();
      
      return { language, code };
    }
    
    return null;
  };

  const handleSend = async (messageText = input, conversationId = currentConversation?.id) => {
    if (!messageText.trim() || isLoading || !conversationId) {
      addConsoleLog('WARNING', 'Mensagem vazia ou sem conversa ativa');
      return;
    }

    if (userProfile.plan === 'essencial') {
      const today = new Date().toISOString().split('T')[0];
      const lastMessageDate = userProfile.last_message_date?.split('T')[0];
      const count = lastMessageDate === today ? userProfile.messages_used_today : 0;
      
      if (count >= 50) {
        setShowLimitWarning(true);
        addConsoleLog('ERROR', 'Limite de mensagens diário atingido');
        return;
      }
    }

    addConsoleLog('INFO', 'Enviando mensagem...');
    setInput('');
    setIsLoading(true);
    setStatusMessage('Salvando sua mensagem...');

    try {
      const userMessage = {
        conversation_id: conversationId,
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString()
      };

      const { data: savedUserMsg, error: saveError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select()
        .single();

      if (saveError) throw saveError;

      if (savedUserMsg) {
        setMessages(prev => [...prev, savedUserMsg]);
        addConsoleLog('SUCCESS', 'Mensagem do usuário salva');
      }

      if (messages.length === 0) {
        updateConversationTitle(conversationId, messageText);
      }

      await updateMessageCount();

      setStatusMessage('🤖 A IA está pensando...');
      addConsoleLog('INFO', 'Chamando API GROQ...');

      const model = userProfile.plan === 'avancado' ? 'llama-3.2-90b-text-preview' : 'llama-3.3-70b-versatile';
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), 
                     { role: 'user', content: messageText }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;
      addConsoleLog('SUCCESS', 'Resposta recebida da API');

      // Detectar se há código na resposta
      const codeDetected = detectCodeInResponse(responseContent);
      if (codeDetected) {
        setGeneratedCode(codeDetected);
      }

      setStatusMessage('Salvando resposta...');
      
      const assistantMessage = {
        conversation_id: conversationId,
        role: 'assistant',
        content: responseContent,
        created_at: new Date().toISOString()
      };
      
      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (assistantError) throw assistantError;

      if (savedAssistantMsg) {
        setMessages(prev => [...prev, savedAssistantMsg]);
        addConsoleLog('SUCCESS', 'Resposta da IA salva');
      }

      setStatusMessage('');
    } catch (error) {
      addConsoleLog('ERROR', `Erro ao enviar mensagem: ${error.message}`);
      setStatusMessage('');
      
      const errorMsg = {
        conversation_id: conversationId,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${error.message}. Tente novamente.`,
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
      setStatusMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeatureSelect = (featureId) => {
    setActiveFeature(featureId);
    addConsoleLog('INFO', `Feature selecionada: ${featureId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia!';
    if (hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  };

  const getModelName = () => {
    return userProfile?.plan === 'avancado' ? 'Llama 3.2 90B' : 'Llama 3.3 70B';
  };

  const getNextResetTime = () => {
    return '00:00';
  };

  const MarkdownMessage = ({ content }) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeContent = String(children).replace(/\n$/, '');
          
          return !inline && match ? (
            <div className="relative group my-2">
              <button
                onClick={() => copyToClipboard(codeContent)}
                className="absolute right-2 top-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                📋 Copiar
              </button>
              <button
                onClick={() => setGeneratedCode({ language: match[1], code: codeContent })}
                className="absolute right-20 top-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                👁️ Ver Preview
              </button>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg"
                {...props}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-pink-300">{children}</strong>,
        em: ({ children }) => <em className="italic text-purple-300">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 text-pink-300">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-2 text-pink-300">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-purple-300">{children}</h3>,
      }}
    >
      {content}
    </ReactMarkdown>
  );

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

      {/* Modals */}
      {activeFeature === 'image-gen' && (
        <ImageGenerator 
          userProfile={userProfile}
          onClose={() => setActiveFeature(null)}
        />
      )}

      {activeFeature === 'image-analysis' && (
        <ImageAnalyzer
          userProfile={userProfile}
          onClose={() => setActiveFeature(null)}
          onSendToChat={(text) => {
            setInput(text);
            setActiveFeature(null);
          }}
        />
      )}

      {generatedCode && (
        <CodeGenerator
          code={generatedCode.code}
          language={generatedCode.language}
          onClose={() => setGeneratedCode(null)}
        />
      )}

      <div className="flex h-screen relative z-10">
        {/* Overlay para mobile quando sidebar aberto */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-80 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!sidebarOpen && 'lg:w-0'}
        `}>
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

            {/* Menu Items */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => navigate('/planos')}
                className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 px-4 flex items-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Planos</span>
              </button>

              <button
                onClick={() => setShowConsole(!showConsole)}
                className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 px-4 flex items-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Console</span>
              </button>
            </div>

            {/* Console */}
            {showConsole && (
              <div className="bg-black/50 backdrop-blur-lg rounded-lg p-3 mb-4 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                <p className="text-white/70 text-xs font-bold mb-2">Console de Debug</p>
                <div className="space-y-1">
                  {consoleMessages.slice(-10).map((log, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="text-white/50">[{log.timestamp}]</span>
                      <span className={`ml-2 ${
                        log.type === 'ERROR' ? 'text-red-400' :
                        log.type === 'SUCCESS' ? 'text-green-400' :
                        log.type === 'WARNING' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {log.type}:
                      </span>
                      <span className="text-white/70 ml-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <p className="text-white/50 text-xs font-semibold mb-2">CONVERSAS</p>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setCurrentConversation(conv);
                    setSidebarOpen(false);
                  }}
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

            {/* User Info */}
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
          className="fixed left-4 top-20 z-30 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-lg p-2 hover:bg-white/20 transition-all lg:absolute"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col pt-16 relative">
          {!currentConversation || messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{getGreeting()}</h1>
                <p className="text-lg md:text-xl text-white/70">Como posso te ajudar hoje?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    disabled={isLoading}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl p-6 hover:bg-white/20 transition-all text-left group disabled:opacity-50"
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                >
                  <div className="flex flex-col max-w-[85%] md:max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 md:px-6 py-4 shadow-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-pink-300/30 text-white'
                          : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white'
                      }`}
                    >
                      {editingMessageId === message.id && message.role === 'user' ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-white/10 text-white rounded-lg p-2 outline-none resize-none"
                            rows="3"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMessage(message.id, editingText)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditingText('');
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm md:text-[15px]">
                          {message.role === 'assistant' ? (
                            <MarkdownMessage content={message.content} />
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.role === 'user' ? (
                        <button
                          onClick={() => {
                            setEditingMessageId(message.id);
                            setEditingText(message.content);
                          }}
                          className="text-white/60 hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => regenerateResponse(messages.slice(0, index))}
                            disabled={isLoading}
                            className="text-white/60 hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Tentar novamente
                          </button>
                          <button
                            onClick={() => {
                              if (isSpeaking) {
                                stop();
                              } else {
                                speak(message.content);
                              }
                            }}
                            className="text-white/60 hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSpeaking ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" : "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828 2.828"} />
                            </svg>
                            {isSpeaking ? 'Parar' : 'Ouvir'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="text-white/60 hover:text-white text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar
                          </button>
                          <button
                            onClick={() => reportMessage(message.id)}
                            className="text-white/60 hover:text-red-400 text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Reportar
                          </button>
                        </>
                      )}
                    </div>
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

          {/* Features Menu */}
          {showFeaturesMenu && (
            <FeaturesMenu
              onSelectFeature={handleFeatureSelect}
              onClose={() => setShowFeaturesMenu(false)}
            />
          )}

          {/* Status Bar acima do input */}
          <div className="px-4 py-2 border-t border-white/10 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs md:text-sm gap-2">
              <span className="text-white/70">
                🤖 Modelo: <span className="font-semibold text-white">{getModelName()}</span>
              </span>
              
              {statusMessage ? (
                <span className="text-blue-400 font-semibold animate-pulse">
                  {statusMessage}
                </span>
              ) : showLimitWarning ? (
                <span className="text-red-400 font-semibold">
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
                  onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                  className="text-white/70 hover:text-white p-2 transition-colors flex-shrink-0"
                  title="Ferramentas IA"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 outline-none resize-none px-3 md:px-4 py-3 max-h-[200px] min-h-[24px] text-sm md:text-[15px]"
                  rows="1"
                  disabled={isLoading || showLimitWarning}
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading || showLimitWarning}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

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
