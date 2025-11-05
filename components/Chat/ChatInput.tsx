'use client';

import { Send, Paperclip, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function ChatInput({ 
  inputValue, 
  isLoading, 
  onInputChange, 
  onSendMessage, 
  onKeyPress 
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [inputValue]);

  return (
    <div className="border-t border-gray-800 bg-[#171717]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <div className="relative">
          <div className="flex items-end gap-3 bg-[#2f2f2f] border-2 border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/20">
            <button 
              className="p-2.5 text-gray-400 hover:text-primary-400 hover:bg-[#3f3f3f] rounded-lg transition-all duration-200 ml-2 mb-2"
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
            
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Message A.S.H.I.Y.A..."
              rows={1}
              className="flex-1 resize-none outline-none text-gray-200 placeholder-gray-500 bg-transparent py-4 pr-2 overflow-y-auto text-base"
              disabled={isLoading}
              style={{ minHeight: '28px', maxHeight: '128px' }}
            />
            
            <button
              onClick={onSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="m-2 p-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg disabled:hover:shadow-md transform hover:scale-105 disabled:hover:scale-100"
              title="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-3 gap-2">
            <Sparkles size={12} className="text-gray-500" />
            <p className="text-xs text-gray-500 font-light">
              A.S.H.I.Y.A can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
