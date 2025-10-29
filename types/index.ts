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
