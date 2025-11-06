'use client';

import { 
  Plus, 
  Search, 
  Folder, 
  ChevronDown,
  LogOut,
  Settings,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { SidebarProps } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useState, useRef, useEffect } from 'react';

interface SidebarPropsExtended extends SidebarProps {
  onLoginClick?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, chatHistory, onLoginClick }: SidebarPropsExtended) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    today: true,
    yesterday: false,
    last7Days: false
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'A';

  const displayName = user?.full_name || user?.name || user?.username || user?.email?.split('@')[0] || 'Alexandra';
  
  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-300 flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* User Profile Header */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200 relative" ref={menuRef}>
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-gray-900 font-medium text-sm truncate">{displayName}</div>
                  <div className="text-gray-500 text-xs truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Toggle sidebar"
              >
                <PanelRightOpen size={18} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-bold text-sm">G</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-medium text-sm">Guest</div>
                  {onLoginClick && (
                    <button
                      onClick={onLoginClick}
                      className="text-[#533293] hover:text-[#A4496A] text-xs font-medium hover:underline mt-0.5"
                    >
                      Log in
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Toggle sidebar"
              >
                <PanelRightOpen size={18} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed state - show only avatar */}
      {isCollapsed && (
        <div className="px-2 py-3 border-b border-gray-200 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="w-10 h-10 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-full flex items-center justify-center flex-shrink-0 group relative"
            title="Toggle sidebar"
          >
            {/* Profile avatar - hidden on hover */}
            <span className="text-white font-bold text-sm group-hover:opacity-0 transition-opacity">{isAuthenticated && user ? userInitial : 'G'}</span>
            {/* Icon - shown on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PanelRightClose size={18} className="text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Start new chat Button */}
      {!isCollapsed && (
        <div className="px-4 py-3">
        <button 
            className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg flex items-center justify-center gap-2 px-4 py-3 hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <Plus size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Start new chat</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 py-3 flex items-center justify-center">
          <button 
            className="w-10 h-10 bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg flex items-center justify-center hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all shadow-md"
            title="New chat"
          >
            <Plus size={18} />
        </button>
      </div>
      )}

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Chat"
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 mb-2">
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors duration-200"
            title="Search"
          >
            <Search size={18} />
          </button>
        </div>
      )}

      {/* Project Section */}
      {!isCollapsed && (
        <div className="px-4 mb-2">
          <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <Folder size={18} className="text-gray-600" />
            <span className="text-gray-900 font-medium text-sm">Project</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 mb-2">
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Project"
          >
            <Folder size={18} />
          </button>
        </div>
      )}

      {/* Chat History Sections */}
      {!isCollapsed && (
        <div className="flex-1 px-4 overflow-y-auto scrollbar-thin">
          {/* Today Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('today')}
              className="w-full flex items-center justify-between px-2 py-1.5 mb-1 hover:bg-gray-50 rounded transition-colors"
            >
              <span className="text-[#533293] font-semibold text-sm">Today</span>
              <ChevronDown 
                size={16} 
                className={`text-[#533293] transition-transform ${expandedSections.today ? '' : '-rotate-90'}`}
              />
            </button>
            {expandedSections.today && (
              <div className="space-y-0.5">
                {chatHistory.map((item) => (
                  <button 
                    key={item.id} 
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="text-gray-700 text-sm truncate">{item.subtitle || item.title}</div>
          </button>
            ))}
              </div>
            )}
          </div>

          {/* Yesterday Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('yesterday')}
              className="w-full flex items-center justify-between px-2 py-1.5 mb-1 hover:bg-gray-50 rounded transition-colors"
            >
              <span className="text-[#533293] font-semibold text-sm">Yesterday</span>
              <ChevronDown 
                size={16} 
                className={`text-[#533293] transition-transform ${expandedSections.yesterday ? '' : '-rotate-90'}`}
              />
            </button>
            {expandedSections.yesterday && (
              <div className="space-y-0.5">
                {/* Add yesterday's chats here */}
              </div>
            )}
          </div>

          {/* Last 7 Days Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('last7Days')}
              className="w-full flex items-center justify-between px-2 py-1.5 mb-1 hover:bg-gray-50 rounded transition-colors"
            >
              <span className="text-[#533293] font-semibold text-sm">Last 7 Days</span>
              <ChevronDown 
                size={16} 
                className={`text-[#533293] transition-transform ${expandedSections.last7Days ? '' : '-rotate-90'}`}
              />
            </button>
            {expandedSections.last7Days && (
              <div className="space-y-0.5">
                {/* Add last 7 days chats here */}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Spacer for collapsed state */}
      {isCollapsed && <div className="flex-1"></div>}

    </div>
  );
}

