import axios, { AxiosResponse } from 'axios';
import authService from './auth';

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

  constructor(baseURL: string = 'http://localhost:8000/api', apiKey?: string) {
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

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response: AxiosResponse<ChatResponse> = await axios.post(
        `${this.baseURL}/chat`,
        { message },
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
}

export default ApiService;
