'use client';

import { ChatMessage } from '@/types';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useAuth } from '@/lib/auth-context';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isSessionLoading?: boolean;
}

export default function ChatInterface({ messages, isLoading, isSessionLoading }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const markdownComponents = useMemo<Components>(() => ({
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 whitespace-pre-wrap leading-relaxed text-gray-900">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-3 last:mb-0 list-disc pl-5 text-gray-900 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-3 last:mb-0 list-decimal pl-5 text-gray-900 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-900">{children}</em>,
    code: ({ inline, children }: any) =>
      inline ? (
        <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-900">
          {children}
        </code>
      ) : (
        <pre className="mb-3 last:mb-0 overflow-x-auto rounded-lg bg-gray-900/90 p-4 text-sm text-gray-100 shadow-inner">
          <code>{children}</code>
        </pre>
      ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#533293] underline underline-offset-2 hover:text-[#A4496A]"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#533293]/40 bg-[#533293]/5 px-4 py-2 text-gray-900 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-gray-200" />,
  }), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasAssistantPlaceholder = useMemo(
    () => messages.some((message) => message.role === 'assistant' && !message.content.trim()),
    [messages]
  );

  const showLoadingBubble = isLoading && !hasAssistantPlaceholder;

  return (
    <div className="flex-1 overflow-y-auto bg-white scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[70vh] animate-fade-in">
            {isSessionLoading ? (
              <div className="flex items-center gap-3 text-gray-600">
                <svg className="h-5 w-5 animate-spin text-[#533293]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Loading conversation…</span>
              </div>
            ) : (
              <h1 className="text-4xl font-bold text-[#533293] mb-8">
                What can I help with?
              </h1>
            )}
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
                  <div className="flex-shrink-0">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white shadow-lg ring-2 ring-[#533293]/30 bg-white flex items-center justify-center">
                      <Image
                        src="/logo-collapsed.png"
                        alt="Ashiya"
                      width={25}
                      height={25}
                      className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                )}
                
                <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse max-w-[65%]' : 'flex-row max-w-[75%]'}`}>
                  <div
                    className={`flex-1 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#533293] via-[#7d3aa5] to-[#A4496A] text-white rounded-[30px] rounded-tr-md shadow-lg'
                        : 'bg-white text-gray-900 rounded-[30px] rounded-tl-md shadow-md border border-gray-200'
                    } px-4 py-3`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none text-gray-900">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {message.content || ''}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-white">
                          {message.content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    {user?.profile_picture_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white shadow-md ring-2 ring-gray-300/40 bg-white">
                        <Image
                          src={user.profile_picture_url}
                          alt={user.full_name || user.name || user.username || user.email || 'User'}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#533293] to-[#A4496A] text-sm font-semibold uppercase text-white shadow-md ring-2 ring-[#533293]/20">
                        {(user?.full_name || user?.name || user?.username || user?.email || 'U')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {showLoadingBubble && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white shadow-lg ring-2 ring-[#533293]/30 bg-white flex items-center justify-center">
                    <Image
                      src="/logo-collapsed.png"
                      alt="Ashiya"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-[30px] rounded-tl-md border border-gray-200 bg-white px-4 py-3 shadow-md">
                  <span className="text-sm font-medium text-gray-600">Ashiya is thinking</span>
                  <svg className="h-5 w-5 animate-spin text-[#533293]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
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
