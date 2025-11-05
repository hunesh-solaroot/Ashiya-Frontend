'use client';

import { ChatMessage } from '@/types';
import { User, Bot, Sparkles } from 'lucide-react';
import Image from 'next/image';
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
              <Image
                src="/logo-collapsed.png"
                alt="A.S.H.I.Y.A Logo"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              A.S.H.I.Y.A
            </h1>
            <p className="text-gray-400 text-xl font-light">How can I help you today?</p>
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
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#533293] to-[#A4496A] flex items-center justify-center shadow-lg ring-2 ring-[#533293]/20">
                    <Bot size={20} className="text-white" />
                  </div>
                )}
                
                <div className={`flex gap-3 max-w-[80%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-1 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-[#533293] to-[#A4496A] text-white rounded-2xl rounded-tr-sm shadow-lg' 
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
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#533293] to-[#A4496A] flex items-center justify-center shadow-lg">
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
