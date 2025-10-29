'use client';

import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useState } from 'react';
import { ChatHistoryItem } from '@/types';

export default function PricingPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const chatHistory: ChatHistoryItem[] = [
    {
      id: 1,
      title: "Website development project",
      subtitle: "How Can i help you built a proje..."
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        chatHistory={chatHistory}
      />
      
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 mb-4">Pricing</h1>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
