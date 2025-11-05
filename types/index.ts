export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
}

export interface ChatHistoryItem {
  id: number;
  title: string;
  subtitle: string;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chatHistory: ChatHistoryItem[];
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

// Auth Types
export interface User {
  id: number | string;
  email: string;
  username?: string;
  full_name?: string | null;
  name?: string;
  avatar?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  full_name: string;
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