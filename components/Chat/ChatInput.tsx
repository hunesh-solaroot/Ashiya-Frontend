'use client';

import { Plus, Mic, Send } from 'lucide-react';

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
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 bg-white border border-primary-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-300">
          <Plus size={20} className="text-gray-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask Anything"
            className="flex-1 outline-none text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Mic size={20} className="text-gray-400" />
          </button>
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">Ashiya can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}
