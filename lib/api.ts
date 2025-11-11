import axios, { AxiosResponse } from 'axios';
import authService from './auth';
import { ChatSession, ChatSessionDetail, ChatSearchResult } from '@/types';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  success: boolean;
  data?: any;
}

class ApiService {
  private baseURL: string;
  private apiKey?: string;

  constructor(baseURL: string = 'http://155.117.40.181:4020/api/v1', apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // First check for API key (for backward compatibility)
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      // Otherwise, get token from auth service
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async sendMessage(message: string, sessionId?: number | string, webSearchEnabled = false): Promise<ChatResponse> {
    try {
      const payload: Record<string, unknown> = {
        message,
        web_search_enabled: webSearchEnabled,
      };

      if (sessionId !== undefined && sessionId !== null) {
        payload.session_id = sessionId;
      }

      const response: AxiosResponse<ChatResponse> = await axios.post(
        `${this.baseURL}/chat`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message to API');
    }
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const response: AxiosResponse<ChatMessage[]> = await axios.get(
        `${this.baseURL}/chat/history`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  async clearChatHistory(): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/chat/history`, {
        headers: this.getHeaders()
      });
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await axios.get<ChatSession[]>(`${this.baseURL}/chat/sessions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  async createChatSession(): Promise<ChatSession> {
    try {
      const response = await axios.post<ChatSession>(
        `${this.baseURL}/chat/sessions/new`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error('Failed to create new chat session');
    }
  }

  async getModelStatus(): Promise<'online' | 'offline' | string> {
    try {
      const response = await axios.get<{ status?: string; online?: boolean }>(
        `${this.baseURL}/chat/ollama/status`,
        { headers: this.getHeaders() }
      );

      if (typeof response.data?.status === 'string') {
        return response.data.status.toLowerCase();
      }

      if (typeof response.data?.online === 'boolean') {
        return response.data.online ? 'online' : 'offline';
      }

      return 'unknown';
    } catch (error) {
      console.error('Error fetching model status:', error);
      return 'offline';
    }
  }

  async streamChatMessage(
    message: string,
    sessionId: number | string,
    options?: { webSearchEnabled?: boolean; webContext?: string; signal?: AbortSignal }
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const headers: HeadersInit = {
      ...this.getHeaders(),
      Accept: 'text/event-stream',
    };
    const response = await fetch(`${this.baseURL}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        session_id: sessionId,
        web_search_enabled: options?.webSearchEnabled ?? false,
        web_search_context: options?.webContext ?? undefined,
      }),
      signal: options?.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to stream chat response.');
    }

    return response.body.getReader();
  }

  async getChatSession(sessionId: number | string): Promise<ChatSessionDetail> {
    try {
      const response = await axios.get<ChatSessionDetail>(
        `${this.baseURL}/chat/sessions/${sessionId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      throw new Error('Failed to load chat session');
    }
  }

  async updateChatSession(
    sessionId: number | string,
    payload: Partial<{ title: string; is_active: boolean }>
  ): Promise<ChatSession> {
    try {
      const response = await axios.put<ChatSession>(
        `${this.baseURL}/chat/sessions/${sessionId}`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw new Error('Failed to update chat session');
    }
  }

  async deleteChatSession(sessionId: number | string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/chat/sessions/${sessionId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw new Error('Failed to delete chat session');
    }
  }

  async searchChatHistory(query: string): Promise<ChatSearchResult[]> {
    try {
      const response = await axios.get<ChatSearchResult[]>(
        `${this.baseURL}/chat/history/search`,
        {
          headers: this.getHeaders(),
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching chat history:', error);
      return [];
    }
  }

  async webSearch(query: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/web-search/search`,
        {
          headers: this.getHeaders(),
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error performing web search:', error);
      throw new Error('Failed to perform web search');
    }
  }

  async webSearchContext(query: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/web-search/search-context`,
        {
          headers: this.getHeaders(),
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching web search context:', error);
      throw new Error('Failed to fetch web search context');
    }
  }

  async webSearchAsync(query: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/web-search/search-async`,
        {
          headers: this.getHeaders(),
          params: { q: query },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error starting async web search:', error);
      throw new Error('Failed to start async web search');
    }
  }
}

export default ApiService;
