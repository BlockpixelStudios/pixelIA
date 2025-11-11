import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Zap, Heart, LogOut, MessageSquare, User, Mail, Lock, ArrowRight, Menu, X, Copy, RotateCcw, Flag, CheckCircle2, UserCircle } from 'lucide-react';

export default function PixelIAApp() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
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

  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      setUser({ name: email.split('@')[0], email });
      setIsGuest(false);
      setShowApiInput(true);
    } else {
      setUser({ name, email });
      setIsGuest(false);
      setShowApiInput(true);
    }
  };

  const handleGuestMode = () => {
    setUser({ name: 'Visitante', email: 'guest@pixelia.com' });
    setIsGuest(true);
    setShowApiInput(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    setMessages([]);
    setPage('landing');
    setGroqApiKey('');
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
          message: '❌ Formato inválido! A chave deve começar com "gsk_"',
          details: `Sua chave começa com: "${groqApiKey.substring(0, 4)}..."`
        });
        setTestingApi(false);
        return;
      }

      const modelsResponse = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`
        }
      });

      if (!modelsResponse.ok) {
        const errorData = await modelsResponse.json();
        setTestResult({
          success: false,
          message: '❌ Chave inválida ou sem permissão!',
          details: errorData.error?.message || 'Verifique se copiou a chave completa'
        });
        setTestingApi(false);
        return;
      }

      const modelsData = await modelsResponse.json();
      const availableModels = modelsData.data?.map(m => m.id) || [];

      const testResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{role: 'user', content: 'Responda apenas "OK"'}],
          max_tokens: 10
        })
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        setTestResult({
          success: false,
          message: '⚠️ Chave válida, mas modelo indisponível!',
          details: `Modelos disponíveis: ${availableModels.slice(0, 3).join(', ')}...`,
          models: availableModels
        });
        setTestingApi(false);
        return;
      }

      const testData = await testResponse.json();
      
      setTestResult({
        success: true,
        message: '✅ Chave funcionando perfeitamente!',
        details: `Resposta: "${testData.choices[0].message.content}"`,
        models: availableModels
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: '❌ Erro ao testar!',
        details: error.message
      });
    } finally {
      setTestingApi(false);
    }
  };

  const sendMessage = async (customPrompt = null) => {
    const messageToSend = customPrompt || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🚀 Iniciando requisição para GROQ...');
      console.log('📝 Mensagens:', [...messages, userMessage]);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1,
          stream: false
        })
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro da API:', errorData);
        
        let errorMessage = 'Erro desconhecido';
        
        if (response.status === 401) {
          errorMessage = 'Chave de API inválida! Verifique se copiou corretamente.';
        } else if (response.status === 429) {
          errorMessage = 'Limite de requisições atingido! Aguarde alguns minutos.';
        } else if (response.status === 400) {
          errorMessage = `Erro na requisição: ${errorData.error?.message || 'Parâmetros inválidos'}`;
        } else {
          errorMessage = errorData.error?.message || 'Erro na API do GROQ';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Resposta recebida:', data);
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Resposta inválida da API - sem choices');
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.log('✅ Mensagem adicionada com sucesso!');
    } catch (error) {
      console.error('💥 Erro completo:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Erro: ${error.message}\n\n🔍 Verifique:\n• Sua chave de API está correta\n• Você tem créditos no GROQ\n• Não atingiu o limite de requisições\n• O console do navegador (F12) para mais detalhes`
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
    if (userMsg && userMsg.role === 'user') {
      sendMessage(userMsg.content);
    }
  };

  const reportMessage = (index) => {
    alert(`Mensagem ${index + 1} reportada! Em breve teremos um sistema de feedback completo.`);
  };

  const suggestedPrompts = [
    "Explique computação quântica de forma simples",
    "Crie uma história criativa sobre o futuro",
    "Me ajude a aprender Python",
    "Dê dicas de produtividade"
  ];

  // LANDING PAGE
  if (page === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <nav className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">PixelIA</span>
            </div>
            
            <button
              onClick={() => setPage('auth')}
              className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur text-white px-6 py-2 rounded-xl hover:bg-white/30 transition border border-white/30"
            >
              <User className="w-4 h-4" />
              Entrar
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/20 p-4">
              <button
                onClick={() => { setPage('auth'); setMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition"
              >
                <User className="w-4 h-4" />
                Entrar
              </button>
            </div>
          )}
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 p-6 rounded-3xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Converse com a<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                PixelIA
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto">
              Assistente de IA poderosa e 100% gratuita. Impulsionada por GROQ para respostas ultra-rápidas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => setPage('auth')}
                className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl flex items-center gap-3"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 text-purple-200">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Respostas Instantâneas</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-24">
            {[
              { icon: Zap, title: 'Ultra Rápido', desc: 'Respostas em milissegundos com tecnologia GROQ' },
              { icon: Sparkles, title: '100% Gratuito', desc: 'Sem custos, sem limites, sem assinaturas' },
              { icon: MessageSquare, title: 'Conversas Ilimitadas', desc: 'Chat inteligente e contextual sem restrições' }
            ].map((feature, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition hover:scale-105">
                <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative z-10 bg-white/5 backdrop-blur border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-purple-200 text-sm flex items-center justify-center gap-2 flex-wrap">
              <span>Desenvolvido por</span>
              <span className="font-semibold text-white">GROQ</span>
              <span>×</span>
              <span className="font-semibold text-white">Claude AI</span>
              <span>×</span>
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
              <span className="font-semibold text-white">Blockpixel Studios</span>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // AUTH PAGE
  if (page === 'auth' || (user && showApiInput)) {
    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-2xl mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {authMode === 'login' ? 'Bem-vindo de volta!' : 'Criar conta'}
              </h2>
              <p className="text-purple-200">
                {authMode === 'login' ? 'Entre para continuar conversando' : 'Junte-se à PixelIA gratuitamente'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-purple-300" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 text-white placeholder-purple-300"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-purple-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 text-white placeholder-purple-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-purple-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 text-white placeholder-purple-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
              >
                {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>

            <div className="mt-4">
              <button
                onClick={handleGuestMode}
                className="w-full bg-white/10 backdrop-blur border border-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition flex items-center justify-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Entrar como Visitante
              </button>
              <p className="text-xs text-purple-300 text-center mt-2">
                ⚠️ Modo visitante: conversas não serão salvas
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-purple-200 hover:text-white transition"
              >
                {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>

            <button
              onClick={() => setPage('landing')}
              className="mt-4 w-full text-purple-300 hover:text-white transition text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      );
    }

    // API Key Input
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-2xl mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Configurar GROQ API</h2>
            <p className="text-purple-200">Última etapa para começar!</p>
            {isGuest && (
              <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                <p className="text-yellow-200 text-sm">⚠️ Modo Visitante: Suas conversas não serão salvas</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Chave de API do GROQ</label>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl focus:ring-2 focus:ring-cyan-400 text-white placeholder-purple-300"
              />
            </div>

            <button
              onClick={testApiKey}
              disabled={!groqApiKey.trim() || testingApi}
              className="w-full bg-yellow-500/90 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingApi ? '🔍 Testando...' : '🧪 Testar Chave'}
            </button>

            {testResult && (
              <div className={`p-4 rounded-xl border ${
                testResult.success 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <p className="text-white font-bold mb-2">{testResult.message}</p>
                <p className="text-sm text-white/80">{testResult.details}</p>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="mt-3 text-xs text-white/70">
                    <p className="font-semibold mb-1">Modelos disponíveis:</p>
                    <p className="font-mono">{testResult.models.slice(0, 5).join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={startChat}
              disabled={!groqApiKey.trim() || (testResult && !testResult.success)}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Começar a Conversar
            </button>

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-sm">
              <p className="font-semibold text-white mb-2">📌 Como obter:</p>
              <ol className="list-decimal list-inside space-y-1 text-purple-200">
                <li><a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a></li>
                <li>Crie conta gratuita</li>
                <li>Gere uma API Key</li>
                <li>Cole aqui e clique em "Testar Chave"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHAT PAGE
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl p-4 border-b border-white/20 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PixelIA</h1>
              <p className="text-xs text-purple-200 flex items-center gap-1">
                {isGuest ? (
                  <>
                    <UserCircle className="w-3 h-3" />
                    Modo Visitante
                  </>
                ) : (
                  `Olá, ${user.name}!`
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center space-y-6 py-12">
              <div className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 p-4 rounded-3xl">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Bem-vindo {isGuest ? 'Visitante' : user.name}! 👋
              </h2>
              <p className="text-purple-200 text-lg">Como posso te ajudar hoje?</p>
              
              <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-left text-white hover:bg-white/20 transition hover:scale-105"
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
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white'
                  : 'bg-white/20 backdrop-blur-xl text-white border border-white/30'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
                    <button
                      onClick={() => copyMessage(msg.content, i)}
                      className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      title="Copiar"
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
                      className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      title="Reenviar"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Refazer
                    </button>
                    <button
                      onClick={() => reportMessage(i)}
                      className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      title="Reportar"
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
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-xl border border-white/30">
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

      {/* Footer */}
      <div className="bg-white/5 backdrop-blur border-t border-white/10 py-2 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-purple-200 text-xs flex items-center justify-center gap-2 flex-wrap">
            <span>Desenvolvido por</span>
            <span className="font-semibold text-white">GROQ</span>
            <span>×</span>
            <span className="font-semibold text-white">Claude AI</span>
            <span>×</span>
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400 animate-pulse" />
            <span className="font-semibold text-white">Blockpixel Studios</span>
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/10 backdrop-blur-xl p-4 shadow-2xl border-t border-white/20 relative z-10">
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
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-5 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-2xl focus:ring-2 focus:ring-cyan-400 resize-none text-white placeholder-purple-300"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl font-semibold"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
