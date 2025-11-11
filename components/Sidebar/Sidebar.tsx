'use client';

import { 
  Plus, 
  Search, 
  ChevronDown,
  LogOut,
  Settings,
  PanelRightOpen,
  PanelRightClose,
  Loader2,
  MoreVertical,
  Edit3,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChatHistoryItem, SidebarProps } from '@/types';

export default function Sidebar({
  isCollapsed,
  onToggle,
  chatHistory,
  onLoginClick,
  isChatHistoryLoading,
  onNewChat,
  isCreatingSession,
  onSelectChat,
  currentSessionId,
  onRenameChat,
  onDeleteChat,
  onSearchChange,
  searchQuery = '',
  searchResults = [],
  isSearchLoading = false,
}: SidebarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openChatMenuId, setOpenChatMenuId] = useState<number | string | null>(null);
  const [renameState, setRenameState] = useState<{
    chat: ChatHistoryItem | null;
    value: string;
    loading: boolean;
  }>({
    chat: null,
    value: '',
    loading: false,
  });
  const [deleteState, setDeleteState] = useState<{
    chat: ChatHistoryItem | null;
    loading: boolean;
  }>({
    chat: null,
    loading: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOutsideChatMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-chat-menu]')) {
        setOpenChatMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideChatMenu);
    return () => document.removeEventListener('mousedown', handleOutsideChatMenu);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleSearchInputChange = (value: string) => {
    onSearchChange?.(value);
  };

  const handleChatClick = (sessionId: number | string) => {
    onSelectChat?.(sessionId);
    setOpenChatMenuId(null);
  };

  const handleChatDoubleClick = (item: ChatHistoryItem) => {
    if (!onRenameChat) return;
    setRenameState({
      chat: item,
      value: item.title || 'Untitled conversation',
      loading: false,
    });
    setOpenChatMenuId(null);
  };

  const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>, sessionId: number | string) => {
    event.stopPropagation();
    setOpenChatMenuId((prev) => (prev === sessionId ? null : sessionId));
  };

  const handleDeleteChat = (sessionId: number | string) => {
    if (!onDeleteChat) return;
    const chat = displayChats.find((item) => item.id === sessionId) || null;
    setDeleteState({ chat, loading: false });
    setOpenChatMenuId(null);
  };

  const closeRenameModal = () => {
    setRenameState({ chat: null, value: '', loading: false });
  };

  const closeDeleteModal = () => {
    setDeleteState({ chat: null, loading: false });
  };

  const handleOverlayClose = () => {
    if (renameState.chat) {
      closeRenameModal();
    }
    if (deleteState.chat) {
      closeDeleteModal();
    }
  };

  const handleRenameSubmit = async () => {
    if (!onRenameChat || !renameState.chat) {
      closeRenameModal();
      return;
    }
    const trimmed = renameState.value.trim();
    if (!trimmed || trimmed === (renameState.chat.title || '')) {
      closeRenameModal();
      return;
    }

    try {
      setRenameState((prev) => ({ ...prev, loading: true }));
      await onRenameChat(renameState.chat.id, trimmed);
    } catch (error) {
      console.error('Failed to rename chat:', error);
    } finally {
      closeRenameModal();
    }
  };

  const handleRenameKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleRenameSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeRenameModal();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDeleteChat || !deleteState.chat) {
      closeDeleteModal();
      return;
    }

    try {
      setDeleteState((prev) => ({ ...prev, loading: true }));
      await onDeleteChat(deleteState.chat.id);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    } finally {
      closeDeleteModal();
    }
  };

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'Alexandra';

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'A';

  const displayChats = useMemo(
    () => (searchQuery.trim() ? searchResults : chatHistory) ?? [],
    [chatHistory, searchQuery, searchResults]
  );

  const parseDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  const groupedChats = useMemo(() => {
    const sections: Record<'today' | 'yesterday' | 'older', ChatHistoryItem[]> = {
      today: [],
      yesterday: [],
      older: [],
    };

    const sorted = [...chatHistory].sort((a, b) => {
      const dateA = parseDate(a.updatedAt || a.createdAt || '');
      const dateB = parseDate(b.updatedAt || b.createdAt || '');
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

    sorted.forEach((chat) => {
      const date = parseDate(chat.updatedAt || chat.createdAt || '');
      if (!date) {
        sections.older.push(chat);
        return;
      }
      const diffDays = Math.floor((todayStart - startOfDay(date).getTime()) / msPerDay);
      if (diffDays === 0) {
        sections.today.push(chat);
      } else if (diffDays === 1) {
        sections.yesterday.push(chat);
      } else {
        sections.older.push(chat);
      }
    });

    return sections;
  }, [chatHistory, todayStart]);

  const [expandedSections, setExpandedSections] = useState<Record<'today' | 'yesterday' | 'older', boolean>>({
    today: true,
    yesterday: false,
    older: false,
  });

  useEffect(() => {
    // Reset expansions when search is active
    if (searchQuery.trim()) {
      setExpandedSections({
        today: true,
        yesterday: true,
        older: true,
      });
    } else {
      setExpandedSections((prev) => ({
        today: prev.today ?? true,
        yesterday: prev.yesterday ?? false,
        older: prev.older ?? false,
      }));
    }
  }, [searchQuery]);

  const toggleSection = (key: 'today' | 'yesterday' | 'older') => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderChatList = (chats: ChatHistoryItem[]) =>
    chats.map((item) => {
      const isActive = currentSessionId === item.id;
      return (
        <div
          key={item.id}
          className={`group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors ${
            isActive ? 'bg-[#533293]/10' : 'hover:bg-gray-100'
          }`}
          data-chat-menu
        >
          <button
            className="flex-1 text-left"
            onClick={() => handleChatClick(item.id)}
            onDoubleClick={() => handleChatDoubleClick(item)}
          >
            <div className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
              {item.title || 'Untitled conversation'}
            </div>
          </button>

          {(onRenameChat || onDeleteChat) && (
            <div className="relative flex-shrink-0" data-chat-menu>
              <button
                type="button"
                onClick={(event) => handleMenuToggle(event, item.id)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#533293]/60 focus:ring-offset-2"
                style={{ width: 30, height: 30 }}
                aria-label="Conversation actions"
              >
                <MoreVertical size={16} />
              </button>

              {openChatMenuId === item.id && (
                <div className="absolute right-0 top-7 z-30 w-36 rounded-md border border-gray-200 bg-white py-2 shadow-lg">
                  {onRenameChat && (
                    <button
                      type="button"
                      onClick={() => handleChatDoubleClick(item)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit3 size={14} />
                      Rename
                    </button>
                  )}
                  {onDeleteChat && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChat(item.id)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    });

  const isListLoading = searchQuery.trim() ? isSearchLoading : isChatHistoryLoading;
  
  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-300 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200 relative">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 min-w-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                <div className="w-10 h-10 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{userInitial}</span>
                </div>
                  <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-medium text-sm truncate">{displayName}</div>
                  <div className="text-gray-500 text-xs truncate">{user.email}</div>
                </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} className="text-gray-500" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <PanelRightOpen size={18} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle sidebar"
              >
                <PanelRightOpen size={18} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 py-3 border-b border-gray-200 flex items-center justify-center">
          <button
            onClick={onToggle}
            className="w-10 h-10 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-full flex items-center justify-center group relative"
            title="Toggle sidebar"
          >
            <span className="text-white font-bold text-sm group-hover:opacity-0 transition-opacity">
              {isAuthenticated && user ? userInitial : 'G'}
            </span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PanelRightClose size={18} className="text-white" />
            </div>
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="px-4 py-3">
        <button 
            type="button"
            onClick={onNewChat}
            disabled={isCreatingSession}
            className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg flex items-center justify-center gap-2 px-4 py-3 hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              {isCreatingSession ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
              <Plus size={12} className="text-white" />
              )}
            </div>
            <span className="font-semibold text-sm">
              {isCreatingSession ? 'Creating...' : 'Start new chat'}
            </span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 py-3 flex items-center justify-center">
          <button 
            type="button"
            onClick={onNewChat}
            disabled={isCreatingSession}
            className="w-10 h-10 bg-gradient-to-r from-[#533293] to-[#A4496A] text-white rounded-lg flex items-center justify-center hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            title="New chat"
          >
            {isCreatingSession ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </div>
      )}

      {!isCollapsed && (
        <div className="px-4 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
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
            onClick={() => {
              if (isCollapsed) {
                onToggle();
              }
            }}
          >
            <Search size={18} />
          </button>
        </div>
      )}

      <div className={`${isCollapsed ? 'flex-1 px-1' : 'flex-1 px-4'} overflow-y-auto scrollbar-thin`}>
      {!isCollapsed && (
          <div className="space-y-3 pb-4">
            {isListLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading chats...
        </div>
            ) : searchQuery.trim() ? (
              <>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-[#533293] font-semibold text-sm">Search Results</span>
        </div>
                {displayChats.length > 0 ? (
                  renderChatList(displayChats)
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">No chats found for this search.</div>
                )}
              </>
            ) : (
              <>
                <div>
            <button
                    type="button"
              onClick={() => toggleSection('today')}
                    className="flex w-full items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              <span className="text-[#533293] font-semibold text-sm">Today</span>
              <ChevronDown 
                size={16} 
                      className={`text-[#533293] transition-transform ${
                        expandedSections.today ? '' : '-rotate-90'
                      }`}
              />
            </button>
            {expandedSections.today && (
                    groupedChats.today.length > 0 ? (
                      renderChatList(groupedChats.today)
                    ) : (
                      <div className="px-2 py-2 text-sm text-gray-500">No chats today.</div>
                    )
            )}
          </div>

                <div>
            <button
                    type="button"
              onClick={() => toggleSection('yesterday')}
                    className="flex w-full items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              <span className="text-[#533293] font-semibold text-sm">Yesterday</span>
              <ChevronDown 
                size={16} 
                      className={`text-[#533293] transition-transform ${
                        expandedSections.yesterday ? '' : '-rotate-90'
                      }`}
              />
            </button>
            {expandedSections.yesterday && (
                    groupedChats.yesterday.length > 0 ? (
                      renderChatList(groupedChats.yesterday)
                    ) : (
                      <div className="px-2 py-2 text-sm text-gray-500">No chats yesterday.</div>
                    )
            )}
          </div>

                <div>
            <button
                    type="button"
                    onClick={() => toggleSection('older')}
                    className="flex w-full items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
            >
                    <span className="text-[#533293] font-semibold text-sm">Older</span>
              <ChevronDown 
                size={16} 
                      className={`text-[#533293] transition-transform ${
                        expandedSections.older ? '' : '-rotate-90'
                      }`}
              />
            </button>
                  {expandedSections.older && (
                    groupedChats.older.length > 0 ? (
                      renderChatList(groupedChats.older)
                    ) : (
                      <div className="px-2 py-2 text-sm text-gray-500">No older chats.</div>
                    )
                  )}
              </div>
              </>
            )}
          </div>
        )}

        {isCollapsed && <div className="flex-1" />}
      </div>

      {(renameState.chat || deleteState.chat) && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          onClick={handleOverlayClose}
        >
          {renameState.chat ? (
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900">Rename Conversation</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update the title so it’s easier to find later.
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Conversation name
                </label>
                <input
                  type="text"
                  value={renameState.value}
                  onChange={(event) =>
                    setRenameState((prev) => ({
                      ...prev,
                      value: event.target.value,
                    }))
                  }
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#533293] focus:outline-none focus:ring-2 focus:ring-[#533293]/40"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRenameModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  disabled={renameState.loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRenameSubmit}
                  disabled={
                    renameState.loading ||
                    !renameState.value.trim() ||
                    renameState.value.trim() === (renameState.chat.title || '')
                  }
                  className="rounded-lg bg-[#533293] px-4 py-2 text-sm font-semibold text-white hover:bg-[#42257a] disabled:cursor-not-allowed disabled:bg-[#533293]/50"
                >
                  {renameState.loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : null}

          {deleteState.chat ? (
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900">Delete Conversation</h2>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-800">
                  {deleteState.chat.title || 'this conversation'}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  disabled={deleteState.loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteState.loading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  {deleteState.loading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

