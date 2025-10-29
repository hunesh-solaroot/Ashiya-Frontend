'use client';

import { 
  Plus, 
  Search, 
  Folder, 
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SidebarProps } from '@/types';

export default function Sidebar({ isCollapsed, onToggle, chatHistory }: SidebarProps) {
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-1/5'} bg-gray-100 border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out relative group`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-primary-200 rounded-full p-2.5 hover:bg-primary-50 hover:border-primary-400 hover:scale-110 z-10 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={18} className="text-primary-600 transition-transform duration-200" />
        ) : (
          <ChevronLeft size={18} className="text-primary-600 transition-transform duration-200" />
        )}
      </button>

      {/* Logo */}
      <div className={`p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} mb-4 transition-all duration-500 ease-in-out`}>
        <button 
          className={`w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg flex items-center justify-center hover:from-primary-700 hover:to-primary-600 transition-all duration-300 ${
            isCollapsed ? 'px-3 py-3' : 'px-4 py-3 space-x-2'
          }`}
          title={isCollapsed ? "Start new chat" : ""}
        >
          <Plus size={20} className="flex-shrink-0" />
          <span className={`font-medium transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-2'
          }`}>
            Start new chat
          </span>
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 mb-4 transition-all duration-500 ease-in-out">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Chat"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 mb-4 transition-all duration-500 ease-in-out">
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors duration-200"
            title="Search Chat"
          >
            <Search size={20} />
          </button>
        </div>
      )}

      {/* Folder */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} mb-4 transition-all duration-500 ease-in-out`}>
        {isCollapsed ? (
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors duration-200"
            title="Folder"
          >
            <Folder size={20} />
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-gray-600 transition-opacity duration-300">
            <Folder size={16} />
            <span className="text-sm transition-opacity duration-300">Folder</span>
          </div>
        )}
      </div>

      {/* History - Spacer to push profile to bottom */}
      {!isCollapsed && (
        <div className="flex-1 px-4 overflow-y-auto">
          <h3 className="text-primary-600 font-medium mb-3 transition-opacity duration-300">History</h3>
          <div className="space-y-2">
            {chatHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-opacity duration-300"
              >
                <div className="font-medium text-primary-600 text-sm">{item.title}</div>
                <div className="text-gray-500 text-xs">{item.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Spacer for collapsed state */}
      {isCollapsed && <div className="flex-1"></div>}

      {/* User Profile - Always expanded style, positioned at bottom */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className={`flex items-center transition-all duration-500 ease-in-out ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-800 font-medium">Alexandra</span>
              <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
