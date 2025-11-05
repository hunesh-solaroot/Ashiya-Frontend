'use client';

import { ChatMessage } from '@/types';
import { User, Bot, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function ChatInterface({ messages, isLoading }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#171717] scrollbar-thin dark-scrollbar">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[70vh] animate-fade-in">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="text-white w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-400 rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              A.S.H.I.Y.A
            </h1>
            <p className="text-gray-400 text-xl mb-12 font-light">How can I help you today?</p>
            
            {/* Quick suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {[
                { title: "Solar Panel Analysis", desc: "Analyze solar panel efficiency and performance", icon: "⚡" },
                { title: "Yield Estimation", desc: "Get accurate solar yield predictions", icon: "📊" },
                { title: "System Audit", desc: "Comprehensive solar system audit", icon: "🔍" },
                { title: "Technical Support", desc: "Get help with technical questions", icon: "💬" }
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  className="group p-5 text-left border border-gray-700 rounded-xl hover:border-primary-500 hover:bg-[#2f2f2f] transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-200 group-hover:text-primary-400 mb-1.5 transition-colors">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {suggestion.desc}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-8">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex gap-4 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg ring-2 ring-primary-100">
                    <Bot size={20} className="text-white" />
                  </div>
                )}
                
                <div className={`flex gap-3 max-w-[80%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-1 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl rounded-tr-sm shadow-lg' 
                      : 'bg-[#2f2f2f] text-gray-200 rounded-2xl rounded-tl-sm shadow-md border border-gray-700'
                  } px-5 py-4`}>
                    <div className="prose prose-sm max-w-none">
                      <p className={`whitespace-pre-wrap leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-200'}`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-md ring-2 ring-gray-600/20">
                    <User size={20} className="text-gray-200" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="bg-[#2f2f2f] rounded-2xl rounded-tl-sm shadow-md border border-gray-700 px-5 py-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
