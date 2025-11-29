// 📍 ARQUIVO: src/hooks/useTextToSpeech.js

import { useState, useEffect } from 'react';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    // Carregar vozes disponíveis
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filtrar vozes em português
      const portugueseVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('pt')
      );
      
      setVoices(portugueseVoices.length > 0 ? portugueseVoices : availableVoices);
      
      // Selecionar voz padrão
      if (!selectedVoice && portugueseVoices.length > 0) {
        setSelectedVoice(portugueseVoices[0]);
      }
    };

    loadVoices();
    
    // Algumas browsers precisam de um evento para carregar vozes
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  const speak = (text, options = {}) => {
    // Parar qualquer fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurações
    utterance.voice = selectedVoice || voices[0];
    utterance.rate = options.rate || 1; // Velocidade (0.1 a 10)
    utterance.pitch = options.pitch || 1; // Tom (0 a 2)
    utterance.volume = options.volume || 1; // Volume (0 a 1)
    utterance.lang = 'pt-BR';

    // Eventos
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Erro TTS:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
  };

  const resume = () => {
    window.speechSynthesis.resume();
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}
