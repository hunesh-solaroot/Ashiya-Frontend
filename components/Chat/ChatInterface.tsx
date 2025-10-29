'use client';

import { ChatMessage } from '@/types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
}

export default function ChatInterface({ messages }: ChatInterfaceProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {messages.length === 0 ? (
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary-600 mb-8">What can I help with?</h2>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
