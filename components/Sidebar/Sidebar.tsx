'use client';

import { 
  Plus, 
  Search, 
  Folder, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import { SidebarProps } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { useState, useRef, useEffect } from 'react';

interface SidebarPropsExtended extends SidebarProps {
  onLoginClick?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle, chatHistory, onLoginClick }: SidebarPropsExtended) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  // Auto-expand on hover, collapse on mouse leave with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isHovered && isCollapsed) {
      timeoutId = setTimeout(() => {
        onToggle();
      }, 100); // Small delay for smooth transition
    } else if (!isHovered && !isCollapsed) {
      timeoutId = setTimeout(() => {
        onToggle();
      }, 200); // Slightly longer delay when leaving
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered]);

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
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#171717] border-r border-gray-800 flex flex-col transition-all duration-500 ease-in-out relative group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`${isCollapsed ? 'px-2 py-3' : 'px-4 py-3'} flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} transition-all duration-500 ease-in-out`}>
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center">
            <Image
              src="/logo-collapsed.png"
              alt="Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <Image
            src="/logo-open.png"
            alt="Logo"
            width={150}
            height={30}
            className="object-contain"
            priority
          />
        )}
      </div>

      {/* New Chat Button */}
      <div className={`${isCollapsed ? 'px-2' : 'px-3'} pt-2 pb-3 transition-all duration-500 ease-in-out ${isCollapsed ? 'flex items-center justify-center' : ''}`}>
        <button 
          className={`bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg flex items-center hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
            isCollapsed ? 'w-[42px] h-[40px] p-0 justify-center' : 'w-full px-4 py-3 space-x-2 justify-start'
          }`}
          title={isCollapsed ? "New chat" : ""}
        >
          <Plus size={18} className="flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-semibold text-sm">New chat</span>
          )}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 mb-2 transition-all duration-500 ease-in-out">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#2f2f2f] border border-gray-700 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 mb-2 transition-all duration-500 ease-in-out">
          <button 
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[#2f2f2f] text-gray-400 transition-colors duration-200"
            title="Search"
          >
            <Search size={18} />
          </button>
        </div>
      )}

      {/* History */}
      {!isCollapsed && (
        <div className="flex-1 px-3 overflow-y-auto scrollbar-thin dark-scrollbar">
          <div className="space-y-1 mt-3">
            {chatHistory.map((item, idx) => (
          <button 
                key={item.id} 
                className="w-full text-left p-3 rounded-lg hover:bg-[#2f2f2f] cursor-pointer transition-all duration-200 group transform hover:translate-x-1"
                style={{ animationDelay: `${idx * 0.05}s` }}
          >
                <div className="font-medium text-gray-300 text-sm truncate group-hover:text-white transition-colors">{item.title}</div>
                <div className="text-gray-500 text-xs truncate mt-0.5">{item.subtitle}</div>
          </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Spacer for collapsed state */}
      {isCollapsed && <div className="flex-1"></div>}

      {/* User Profile */}
      <div className="border-t border-gray-800 mt-auto">
        {isAuthenticated && user ? (
          <div className="p-2 relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-2 hover:bg-[#2f2f2f] rounded-lg p-2 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-[#533293]/20">
                <span className="text-white font-bold text-sm">{userInitial}</span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-gray-300 font-medium text-sm truncate text-left">{displayName}</div>
                  <div className="text-gray-500 text-xs truncate text-left">{user.email}</div>
                </div>
              )}
              {!isCollapsed && (
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#2f2f2f] rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Settings functionality will be added later
                    console.log('Settings clicked');
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#3f3f3f] flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {onLoginClick && !isCollapsed ? (
              <button
                onClick={onLoginClick}
                className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg py-2 px-3 font-medium hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-colors mb-2 text-sm shadow-md"
              >
                Log In
              </button>
            ) : null}
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-[#2f2f2f] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 font-bold text-sm">G</span>
            </div>
              {!isCollapsed && (
                <span className="text-gray-400 font-medium text-sm">Guest</span>
              )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

