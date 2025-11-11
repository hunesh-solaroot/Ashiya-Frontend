'use client';

import { Send, Paperclip, Sparkles, Plus, Globe, MoreHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  isWebSearchEnabled: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onToggleWebSearch: (value: boolean) => void;
}

type ModeType = 'file' | 'web' | 'more';

export default function ChatInput({
  inputValue,
  isLoading,
  isWebSearchEnabled,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onToggleWebSearch,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeModes, setActiveModes] = useState<ModeType[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    setActiveModes((prev) => {
      const hasWeb = prev.includes('web');
      if (isWebSearchEnabled && !hasWeb) {
        return [...prev, 'web'];
      }
      if (!isWebSearchEnabled && hasWeb) {
        return prev.filter((mode) => mode !== 'web');
      }
      return prev;
    });
  }, [isWebSearchEnabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (mode: ModeType) => {
    if (mode === 'web') {
      onToggleWebSearch(!isWebSearchEnabled);
      setShowDropdown(false);
      return;
    }
    if (!activeModes.includes(mode)) {
      setActiveModes([...activeModes, mode]);
    }
    setShowDropdown(false);
  };

  const removeMode = (mode: ModeType) => {
    if (mode === 'web') {
      onToggleWebSearch(false);
      setActiveModes((prev) => prev.filter((m) => m !== 'web'));
      return;
    }
    setActiveModes(activeModes.filter(m => m !== mode));
  };

  const getModeLabel = (mode: ModeType) => {
    switch (mode) {
      case 'file': return 'Attach a File';
      case 'web': return 'Web Search';
      case 'more': return 'More';
      default: return '';
    }
  };

  const getModeIcon = (mode: ModeType) => {
    switch (mode) {
      case 'file': return <Paperclip size={14} />;
      case 'web': return <Globe size={14} />;
      case 'more': return <MoreHorizontal size={14} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <div className="relative">
          <div className="relative">
            <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-[#533293] focus-within:ring-2 focus-within:ring-[#533293]/20">
              {/* Plus button with dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2.5 text-white bg-[#533293] hover:bg-[#533293]/90 rounded-full transition-all duration-200 ml-2 mb-2 flex items-center justify-center"
                  title="Add options"
                >
                  <Plus size={18} />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]">
                    <button
                      onClick={() => handleModeSelect('file')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <Paperclip size={18} className="text-gray-600" />
                      <span>Attach a File</span>
                    </button>
                    <button
                      onClick={() => handleModeSelect('web')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      aria-pressed={isWebSearchEnabled}
                    >
                      <Globe size={18} className="text-gray-600" />
                      <span>{isWebSearchEnabled ? 'Disable Web Search' : 'Enable Web Search'}</span>
                    </button>
                    <button
                      onClick={() => handleModeSelect('more')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                    >
                      <MoreHorizontal size={18} className="text-gray-600" />
                      <span>More</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Input area with badges inside */}
              <div className="flex-1 flex items-center gap-2 flex-wrap py-2">
                {activeModes.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeModes.map((mode) => (
                      <div
                        key={mode}
                        className="flex items-center gap-1.5 bg-[#533293] text-white px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {getModeIcon(mode)}
                        <span>{getModeLabel(mode)}</span>
                        <button
                          onClick={() => removeMode(mode)}
                          className="ml-0.5 hover:bg-[#533293]/80 rounded-full p-0.5 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={onKeyPress}
                  placeholder="Ask Anything"
                  rows={1}
                  className="flex-1 resize-none outline-none text-gray-900 placeholder-gray-400 bg-transparent py-2 pr-2 overflow-y-auto text-base min-w-[120px]"
                  disabled={isLoading}
                  style={{ minHeight: '28px', maxHeight: '128px' }}
                />
              </div>
            
              {/* Right side icons */}
              <div className="flex items-center gap-2 mr-2 mb-2">
                {/* Equalizer icon */}
                <div className="p-2.5 text-gray-600">
                  <svg 
                    width={20} 
                    height={20} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="2" y="14" width="3" height="6" rx="1.5" fill="currentColor" />
                    <rect x="6" y="10" width="3" height="10" rx="1.5" fill="currentColor" />
                    <rect x="10" y="4" width="3" height="16" rx="1.5" fill="currentColor" />
                    <rect x="14" y="10" width="3" height="10" rx="1.5" fill="currentColor" />
                    <rect x="18" y="14" width="3" height="6" rx="1.5" fill="currentColor" />
                  </svg>
                </div>

                {/* Send button */}
                <button
                  onClick={onSendMessage}
                  disabled={isLoading}
                  className="p-2.5 bg-[#533293] text-white rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-[#533293]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-3 gap-2">
            <p className="text-xs text-gray-500 font-light">
              Ashiya can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
