'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import ChatInterface from '@/components/Chat/ChatInterface';
import ChatInput from '@/components/Chat/ChatInput';
import LoginModal from '@/components/Auth/LoginModal';
import RegisterModal from '@/components/Auth/RegisterModal';
import ApiService from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ChatMessage, ChatHistoryItem } from '@/types';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const apiService = new ApiService();

  // Show login modal if not authenticated (only after auth check is complete)
  // But allow guest mode - don't force login
  useEffect(() => {
    // Only auto-show login if we want to enforce authentication
    // For now, allowing guest mode, so commenting this out
    // if (!authLoading && !isAuthenticated && !showLoginModal && !showRegisterModal) {
    //   setShowLoginModal(true);
    // }
  }, [authLoading, isAuthenticated, showLoginModal, showRegisterModal]);

  const chatHistory: ChatHistoryItem[] = [
    {
      id: 1,
      title: "Website development project",
      subtitle: "How Can i help you built a proje..."
    },
    {
      id: 2,
      title: "Website development project",
      subtitle: "How Can i help you built a proje..."
    },
    {
      id: 3,
      title: "Website development project",
      subtitle: "How Can i help you built a proje..."
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.sendMessage(inputValue);
      setMessages(prev => [...prev, 
        { id: Date.now(), content: inputValue, role: 'user' },
        { id: Date.now() + 1, content: response.message, role: 'assistant' }
      ]);
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          chatHistory={chatHistory}
          onLoginClick={() => setShowLoginModal(true)}
        />
        
        <div className="flex-1 flex flex-col">
          <Header />
          <ChatInterface messages={messages} />
          <ChatInput
            inputValue={inputValue}
            isLoading={isLoading}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
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
    </>
  );
}