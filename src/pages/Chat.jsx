import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou a PixelIA, sua assistente inteligente e gratuita! Como posso te ajudar hoje? ✨'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    checkUser();
  }, []);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Integração com GROQ API (substituir pela sua API key)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.'
      }]);
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

  const handleNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Olá! Sou a PixelIA, sua assistente inteligente e gratuita! Como posso te ajudar hoje? ✨'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-700">
      <Header />
      
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-xl ${
                  message.role === 'user'
                    ? 'bg-white/10 backdrop-blur-lg border border-white/20 text-white'
                    : 'bg-white/20 backdrop-blur-lg border border-white/30 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl">
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

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-2 flex items-end gap-2 shadow-2xl hover:bg-white/15 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none resize-none px-4 py-3 max-h-[200px] min-h-[24px] text-[15px]"
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button
                onClick={handleNewChat}
                className="text-white/70 hover:text-white text-sm transition-colors hover:underline"
              >
                🔄 Nova conversa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
            }
