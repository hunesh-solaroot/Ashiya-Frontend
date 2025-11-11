'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import ChatInterface from '@/components/Chat/ChatInterface';
import ChatInput from '@/components/Chat/ChatInput';
import LoginModal from '@/components/Auth/LoginModal';
import RegisterModal from '@/components/Auth/RegisterModal';
import ForgotPasswordModal from '@/components/Auth/ForgotPasswordModal';
import ApiService from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ChatMessage, ChatHistoryItem, ChatSession } from '@/types';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [isModelStatusLoading, setIsModelStatusLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatHistoryItem[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const initialSessionLoaded = useRef(false);
  const currentSessionIdRef = useRef<number | string | null>(null);
  const searchQueryRef = useRef('');

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const apiService = useMemo(() => new ApiService(), []);

  const handleSelectChat = useCallback(async (sessionId: number | string) => {
    const isSameSession = currentSessionIdRef.current === sessionId;
    setIsSessionLoading(true);
    if (!isSameSession) {
      setMessages([]);
    }
    setCurrentSessionId(sessionId);
    currentSessionIdRef.current = sessionId;

    try {
      const sessionDetail = await apiService.getChatSession(sessionId);
      const mappedMessages: ChatMessage[] =
        sessionDetail.messages?.map((message, index) => {
          const numericId = typeof message.id === 'number' ? message.id : Number(message.id);
          const fallbackId =
            Number.isFinite(numericId) && !Number.isNaN(numericId)
              ? (numericId as number)
              : Date.now() + index;
          return {
            id: fallbackId,
            content: message.content || '',
            role: message.role === 'assistant' ? 'assistant' : 'user',
          };
        }) ?? [];

      setMessages(mappedMessages);

      setChatHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== sessionDetail.id);
        const updatedItem: ChatHistoryItem = {
          id: sessionDetail.id ?? sessionId,
          title: sessionDetail.title || 'Untitled conversation',
          subtitle: `Messages: ${sessionDetail.message_count ?? 0}`,
          messageCount: sessionDetail.message_count,
          createdAt: sessionDetail.created_at,
          updatedAt: sessionDetail.updated_at,
          isActive: sessionDetail.is_active,
        };
        return [updatedItem, ...filtered];
      });

      const resolvedId = sessionDetail.id ?? sessionId;
      setCurrentSessionId(resolvedId);
      currentSessionIdRef.current = resolvedId;
    } catch (error) {
      console.error('Failed to load chat session:', error);
    } finally {
      setIsSessionLoading(false);
      if (searchQueryRef.current) {
        setSearchQuery('');
        setSearchResults([]);
      }
      initialSessionLoaded.current = true;
    }
  }, [apiService]);

  // Show login modal if not authenticated (only after auth check is complete)
  // But allow guest mode - don't force login
  useEffect(() => {
    // Only auto-show login if we want to enforce authentication
    // For now, allowing guest mode, so commenting this out
    // if (!authLoading && !isAuthenticated && !showLoginModal && !showRegisterModal) {
    //   setShowLoginModal(true);
    // }
  }, [authLoading, isAuthenticated, showLoginModal, showRegisterModal]);

  // Fetch chat sessions on load
  useEffect(() => {
    let isMounted = true;

    const fetchChatSessions = async () => {
      setIsChatHistoryLoading(true);
      try {
        const sessions = await apiService.getChatSessions();
        if (!isMounted) return;

        if (Array.isArray(sessions)) {
          const formattedSessions: ChatHistoryItem[] = sessions.map((session: ChatSession, index: number) => {
            const sessionId = session?.id ?? index;
            const messageCount = session?.message_count ?? 0;
            return {
              id: sessionId,
              title: session?.title || `Conversation ${index + 1}`,
              subtitle: `Messages: ${messageCount}`,
              messageCount,
              createdAt: session?.created_at,
              updatedAt: session?.updated_at,
              isActive: session?.is_active,
            };
          });

          setChatHistory(formattedSessions);

          if (!initialSessionLoaded.current && formattedSessions.length > 0) {
            const targetId =
              currentSessionId !== null ? currentSessionId : formattedSessions[0].id;
            handleSelectChat(targetId);
          }
        } else {
          setChatHistory([]);
          setMessages([]);
          setCurrentSessionId(null);
          initialSessionLoaded.current = false;
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load chat sessions:', error);
          setChatHistory([]);
          setMessages([]);
          setCurrentSessionId(null);
          initialSessionLoaded.current = false;
        }
      } finally {
        if (isMounted) {
          setIsChatHistoryLoading(false);
        }
      }
    };

    fetchChatSessions();

    return () => {
      isMounted = false;
    };
  }, [apiService, handleSelectChat]);

  // Fetch model status on load and poll every 30s
  useEffect(() => {
    let isMounted = true;
    let statusInterval: ReturnType<typeof setInterval>;

    const fetchModelStatus = async () => {
      if (!isMounted) return;
      setIsModelStatusLoading(true);
      try {
        const status = await apiService.getModelStatus();
        if (!isMounted) return;

        if (status === 'online' || status === 'offline') {
          setModelStatus(status);
        } else {
          setModelStatus('unknown');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch model status:', error);
          setModelStatus('offline');
        }
      } finally {
        if (isMounted) {
          setIsModelStatusLoading(false);
        }
      }
    };

    fetchModelStatus();
    statusInterval = setInterval(fetchModelStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(statusInterval);
    };
  }, [apiService]);

  const createNewSession = async (): Promise<number | string | null> => {
    if (isCreatingSession) {
      return null;
    }

    setIsCreatingSession(true);
    try {
      const newSession = await apiService.createChatSession();
      const sessionId = newSession?.id ?? Date.now();
      const messageCount = newSession?.message_count ?? 0;

      setCurrentSessionId(sessionId);
      setMessages([]);
      initialSessionLoaded.current = true;

      setChatHistory(prev => {
        const filtered = prev.filter(item => item.id !== sessionId);
        const newItem: ChatHistoryItem = {
          id: sessionId,
          title: newSession?.title || 'New Conversation',
          subtitle: `Messages: ${messageCount}`,
          messageCount,
          createdAt: newSession?.created_at,
          updatedAt: newSession?.updated_at,
          isActive: newSession?.is_active,
        };
        return [newItem, ...filtered];
      });

      return sessionId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleStartNewChat = async () => {
    const sessionId = await createNewSession();
    if (sessionId == null) {
      // Creation failed or already in progress, no further action
      return;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const createTitleFromMessage = useCallback((message: string) => {
    const cleaned = message.replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    const words = cleaned.split(' ').slice(0, 5);
    const joined = words.join(' ');
    const capitalized = joined.charAt(0).toUpperCase() + joined.slice(1);
    return capitalized.length > 40 ? `${capitalized.slice(0, 37).trimEnd()}…` : capitalized;
  }, []);

  const extractWebSearchContext = useCallback((payload: any): string => {
    if (!payload) return '';

    const candidateArrays: any[][] = [];
    if (Array.isArray(payload)) candidateArrays.push(payload);
    if (Array.isArray(payload?.results)) candidateArrays.push(payload.results);
    if (Array.isArray(payload?.data)) candidateArrays.push(payload.data);
    if (Array.isArray(payload?.data?.results)) candidateArrays.push(payload.data.results);

    const firstArray = candidateArrays.find((arr) => Array.isArray(arr) && arr.length > 0);

    if (firstArray) {
      return firstArray
        .slice(0, 3)
        .map((item: any, index: number) => {
          const title = item?.title || item?.source || `Result ${index + 1}`;
          const snippet = item?.snippet || item?.summary || item?.content || '';
          return `${title}: ${snippet}`;
        })
        .join('\n');
    }

    if (typeof payload?.summary === 'string') {
      return payload.summary;
    }
    if (typeof payload?.context === 'string') {
      return payload.context;
    }
    if (typeof payload === 'string') {
      return payload;
    }

    return '';
  }, []);

  const handleRenameChat = useCallback(
    async (sessionId: number | string, title: string) => {
      try {
        const updated = await apiService.updateChatSession(sessionId, { title });
        setChatHistory(prev =>
          prev.map(item =>
            item.id === sessionId
              ? {
                  ...item,
                  title: updated.title,
                  updatedAt: updated.updated_at,
                  isActive: updated.is_active,
                }
              : item
          )
        );
      } catch (error) {
        console.error('Failed to rename chat:', error);
        alert('Unable to rename chat. Please try again.');
      }
    },
    [apiService]
  );

  const handleDeleteChat = useCallback(
    async (sessionId: number | string) => {
      try {
        await apiService.deleteChatSession(sessionId);

        let nextSessionId: number | string | null = null;
        setChatHistory(prev => {
          const filtered = prev.filter(item => item.id !== sessionId);
          if (currentSessionId === sessionId && filtered.length > 0) {
            nextSessionId = filtered[0].id;
          }
          return filtered;
        });

        if (currentSessionId === sessionId) {
          if (nextSessionId != null) {
            initialSessionLoaded.current = false;
            handleSelectChat(nextSessionId);
          } else {
            setCurrentSessionId(null);
            setMessages([]);
            initialSessionLoaded.current = false;
          }
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Unable to delete chat. Please try again.');
      }
    },
    [apiService, currentSessionId, handleSelectChat]
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    let cancelled = false;
    const handler = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const results = await apiService.searchChatHistory(searchQuery.trim());
        if (cancelled) return;

        const formatted: ChatHistoryItem[] = Array.isArray(results)
          ? results.map((result: any, index: number) => {
              const sessionId = result?.session_id ?? result?.id ?? index;
              const messageCount = result?.message_count ?? result?.messages_count ?? 0;
              return {
                id: sessionId,
                title: result?.title || `Result ${index + 1}`,
                subtitle: result?.snippet || result?.preview || '',
                messageCount,
                updatedAt: result?.updated_at,
                createdAt: result?.created_at,
              };
            })
          : [];
        setSearchResults(formatted);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to search chat history:', error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [apiService, searchQuery]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isCreatingSession || isLoading) return;
    
    setIsLoading(true);
    setInputValue('');

    let assistantMessageId: number | null = null;
    let sessionId: number | string | null = currentSessionId;

    try {
      if (sessionId == null) {
        sessionId = await createNewSession();
        if (sessionId == null) {
          throw new Error('Unable to create chat session.');
        }
      }

      setCurrentSessionId(sessionId);
      currentSessionIdRef.current = sessionId;

      const userMessageId = Date.now();
      assistantMessageId = userMessageId + 1;

      const userMessage = { id: userMessageId, content: trimmed, role: 'user' as const };
      const assistantPlaceholder = { id: assistantMessageId, content: '', role: 'assistant' as const };

      setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

      let webContext = '';
      if (isWebSearchEnabled) {
        try {
          const contextData = await apiService.webSearchContext(trimmed);
          webContext = extractWebSearchContext(contextData);
        } catch (error) {
          console.error('Web search context error:', error);
        }
      }

      const existingSession = chatHistory.find((item) => item.id === sessionId);
      const needsGeneratedTitle =
        !existingSession ||
        !existingSession.title ||
        existingSession.title === 'New Conversation' ||
        (existingSession.messageCount ?? 0) === 0;

      if (needsGeneratedTitle) {
        const generatedTitle = createTitleFromMessage(trimmed);
        if (generatedTitle) {
          try {
            await apiService.updateChatSession(sessionId, { title: generatedTitle });
            setChatHistory((prev) =>
              prev.map((item) =>
                item.id === sessionId
                  ? {
                      ...item,
                      title: generatedTitle,
                      updatedAt: new Date().toISOString(),
                    }
                  : item
              )
            );
          } catch (error) {
            console.error('Failed to auto-name chat session:', error);
          }
        }
      }

      setChatHistory(prev => {
        const updated = prev.map(item => {
          if (item.id === sessionId) {
            return {
              ...item,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const current = updated.find(item => item.id === sessionId);
        if (!current) {
          return updated;
        }

        return [current, ...updated.filter(item => item.id !== sessionId)];
      });

      const reader = await apiService.streamChatMessage(trimmed, sessionId, {
        webSearchEnabled: isWebSearchEnabled,
        webContext,
      });
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantContent = '';
      let readerDone = false;

      const processLine = (line: string): boolean => {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data:')) {
          return false;
        }

        const payload = trimmedLine.slice(5).trim();
        if (!payload) {
          return false;
        }

        try {
          const parsed = JSON.parse(payload);

          if (parsed.session_id && parsed.session_id !== sessionId) {
            sessionId = parsed.session_id;
            setCurrentSessionId(parsed.session_id);
          }

          if (typeof parsed.content === 'string') {
            assistantContent += parsed.content;
            setMessages(prev =>
              prev.map(message =>
                message.id === assistantMessageId
                  ? { ...message, content: assistantContent }
                  : message
              )
            );
          }

          if (parsed.done === true) {
            return true;
          }
        } catch (error) {
          console.error('Failed to parse stream chunk:', error);
        }

        return false;
      };

      while (!readerDone) {
        const { value, done: streamDone } = await reader.read();
        readerDone = streamDone ?? false;

        if (value) {
          buffer += decoder.decode(value, { stream: !readerDone });

          let newlineIndex = buffer.indexOf('\n');
          while (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            const shouldBreak = processLine(line);
            if (shouldBreak) {
              readerDone = true;
              break;
            }

            newlineIndex = buffer.indexOf('\n');
          }
        }
      }

      const remaining = buffer + decoder.decode();
      if (remaining.trim()) {
        processLine(remaining);
      }

      setMessages(prev =>
        prev.map(message =>
          message.id === assistantMessageId
            ? { ...message, content: assistantContent.trim() }
            : message
        )
      );

      setChatHistory(prev => {
        const updated = prev.map(item => {
          if (item.id === sessionId) {
            const nextCount = (item.messageCount ?? 0) + 1;
            return {
              ...item,
              messageCount: nextCount,
              subtitle: `Messages: ${nextCount}`,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const current = updated.find(item => item.id === sessionId);
        if (!current) {
          return updated;
        }

        return [current, ...updated.filter(item => item.id !== sessionId)];
      });
    } catch (error) {
      console.error('Error streaming message:', error);
      if (assistantMessageId != null) {
        setMessages(prev =>
          prev.map(message =>
            message.id === assistantMessageId
              ? { ...message, content: 'Something went wrong. Please try again.' }
              : message
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          chatHistory={chatHistory}
          isChatHistoryLoading={isChatHistoryLoading}
          onNewChat={handleStartNewChat}
          isCreatingSession={isCreatingSession}
          onSelectChat={handleSelectChat}
          currentSessionId={currentSessionId}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSearchLoading={isSearchLoading}
          onLoginClick={() => setShowLoginModal(true)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header modelStatus={modelStatus} isStatusLoading={isModelStatusLoading} />
          <ChatInterface messages={messages} isLoading={isLoading} isSessionLoading={isSessionLoading} />
          <ChatInput
            inputValue={inputValue}
            isLoading={isLoading}
            isWebSearchEnabled={isWebSearchEnabled}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            onToggleWebSearch={setIsWebSearchEnabled}
          />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false);
        }}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}