export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

export interface ChatHistoryItem {
  id: number | string;
  title: string;
  subtitle?: string;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface ChatSession {
  id: number | string;
  user_id: number | string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count: number;
}

export interface ChatSessionDetail extends ChatSession {
  messages: Array<{
    id: number | string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

export interface ChatSearchResult {
  session_id: number | string;
  title: string;
  snippet?: string;
  message_count?: number;
  updated_at?: string;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chatHistory: ChatHistoryItem[];
  isChatHistoryLoading?: boolean;
  onNewChat?: () => void;
  isCreatingSession?: boolean;
  onSelectChat?: (sessionId: number | string) => void;
  currentSessionId?: number | string | null;
  onRenameChat?: (sessionId: number | string, title: string) => void | Promise<void>;
  onDeleteChat?: (sessionId: number | string) => void | Promise<void>;
  onSearchChange?: (value: string) => void;
  searchQuery?: string;
  searchResults?: ChatHistoryItem[];
  isSearchLoading?: boolean;
  onLoginClick?: () => void;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isSessionLoading?: boolean;
}

// Auth Types
export interface User {
  id: number | string;
  email: string;
  username?: string;
  full_name?: string | null;
  name?: string;
  phone_number?: string;
  profile_picture_url?: string;
  auth_provider?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  keep_logged_in?: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  profile_picture_url?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

// Actual API Response Types
export interface LoginApiResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterApiResponse {
  access_token?: string;
  token_type?: string;
  success?: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface OAuthCredentials {
  provider: 'google' | 'microsoft' | 'github' | 'facebook';
  token: string;
}