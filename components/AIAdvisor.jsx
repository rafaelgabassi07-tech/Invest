
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, Lightbulb } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService.js';

export const AIAdvisor = ({ summary, portfolio, assets }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      text: 'Olá! Sou seu assistente financeiro IA. Já analisei sua carteira atualizada. Como posso ajudar a otimizar seus investimentos hoje?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Passa 'assets' para o serviço para análise detalhada
      const responseText = await getFinancialAdvice(userMsg.text, summary, portfolio, assets);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "Tive um problema técnico. Tente novamente em instantes.",
          timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    "Analise minha diversificação",
    "Qual meu maior risco hoje?",
    "Sugira melhorias na carteira",
    "Resumo de performance"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-secondary rounded-full flex items-center justify-center shadow-2xl shadow-brand-500/40 z-30 hover:scale-110 active:scale-95 transition-all group tap-active"
      >
        <Sparkles size={24} className="text-white group-hover:animate-spin-slow" />
        {/* Status Dot */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#050505]"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md h-[85vh] sm:h-[650px] sm:rounded-3xl rounded-t-[2.5rem] flex flex-col shadow-2xl border border-gray-200 dark:border-white/10 animate-slide-up overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c1c1e] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-secondary flex items-center justify-center shadow-lg border border-white/10">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight">Gemini Advisor</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">ONLINE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2c2c2e] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hover:rotate-90 duration-300 border border-gray-200 dark:border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gradient-to-b dark:from-[#1c1c1e] dark:to-[#050505]">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed shadow-sm font-medium ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-br-sm shadow-brand-500/20'
                    : 'bg-white dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-white/5 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
               <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl px-4 py-4 rounded-bl-sm flex gap-1.5 border border-gray-200 dark:border-white/5 items-center h-12 shadow-sm">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Suggestions */}
        <div className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1c1c1e] flex flex-col">
          {/* Suggestions */}
          {messages.length < 5 && !isLoading && (
             <div className="flex gap-2 p-3 overflow-x-auto custom-scrollbar bg-gray-50/50 dark:bg-[#1c1c1e]/50 backdrop-blur-sm border-b border-gray-100 dark:border-white/5">
                {SUGGESTIONS.map((sugg, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(sugg)}
                        className="whitespace-nowrap bg-white dark:bg-[#2c2c2e] hover:bg-brand-50 dark:hover:bg-brand-500/20 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-500 border border-gray-200 dark:border-white/5 text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 font-bold shadow-sm"
                    >
                        <Lightbulb size={12} />
                        {sugg}
                    </button>
                ))}
             </div>
          )}

          <div className="p-4 flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua dúvida..."
              rows={1}
              className="flex-1 bg-gray-100 dark:bg-[#2c2c2e] text-gray-900 dark:text-white text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-brand-500/50 placeholder-gray-500 border border-transparent transition-all resize-none custom-scrollbar max-h-24 shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex-shrink-0"
            >
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
