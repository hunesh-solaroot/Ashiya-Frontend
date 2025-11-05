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
    <div className="bg-[#171717]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <div className="relative">
          <div className="flex items-end gap-3 bg-[#2f2f2f] border-2 border-gray-700 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-[#533293] focus-within:ring-4 focus-within:ring-[#533293]/20">
            <button 
              className="p-2.5 text-gray-400 hover:text-[#A4496A] hover:bg-[#3f3f3f] rounded-lg transition-all duration-200 ml-2 mb-2"
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
              disabled={isLoading}
              className={`m-2 p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 shadow-md hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100 ${
                inputValue.trim() 
                  ? 'bg-gradient-to-r from-[#533293] to-[#A4496A] text-white hover:from-[#533293]/90 hover:to-[#A4496A]/90 disabled:opacity-50 disabled:cursor-not-allowed' 
                  : 'bg-[#3f3f3f] text-gray-400 hover:bg-[#4f4f4f] hover:text-[#A4496A] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              title={inputValue.trim() ? "Send message" : "Voice input"}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : inputValue.trim() ? (
                <Send size={20} />
              ) : (
                <svg 
                  width={20} 
                  height={20} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Left bar - short */}
                  <rect x="2" y="14" width="3" height="6" rx="1.5" fill="white" />
                  {/* Second bar - medium */}
                  <rect x="6" y="10" width="3" height="10" rx="1.5" fill="white" />
                  {/* Center bar - tall */}
                  <rect x="10" y="4" width="3" height="16" rx="1.5" fill="white" />
                  {/* Fourth bar - medium */}
                  <rect x="14" y="10" width="3" height="10" rx="1.5" fill="white" />
                  {/* Right bar - short */}
                  <rect x="18" y="14" width="3" height="6" rx="1.5" fill="white" />
                </svg>
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
