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

  async getChatSessions(dateFilter?: 'today' | 'yesterday' | 'older'): Promise<ChatSession[]> {
    try {
      const params: any = {};
      // Don't pass limit to get all sessions (omit it entirely)
      if (dateFilter) {
        params.date_filter = dateFilter;
      }
      // Explicitly set active_only to true (default behavior)
      params.active_only = true;
      
      const response = await axios.get<ChatSession[]>(`${this.baseURL}/chat/sessions`, {
        headers: this.getHeaders(),
        params,
      });
      console.log('API Response:', response.data);
      console.log('Sessions count:', response.data?.length || 0);
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching chat sessions:', error);
      console.error('Error details:', error.response?.data || error.message);
      return [];
    }
  }

  async getGlobalChats(options?: { limit?: number; skip?: number; activeOnly?: boolean }): Promise<ChatSession[]> {
    try {
      const params: Record<string, any> = {};
      if (options?.limit) params.limit = options.limit;
      if (options?.skip) params.skip = options.skip;
      if (typeof options?.activeOnly === 'boolean') params.active_only = options.activeOnly;

      const response = await axios.get<ChatSession[]>(`${this.baseURL}/chats`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching global chats:', error);
      return [];
    }
  }

  async getProjectChats(
    projectId: number | string,
    options?: { limit?: number; skip?: number; activeOnly?: boolean }
  ): Promise<ChatSession[]> {
    try {
      const normalizedId = Number(projectId);
      if (Number.isNaN(normalizedId)) {
        throw new Error('Invalid project id');
      }

      const params: Record<string, any> = {};
      if (options?.limit) params.limit = options.limit;
      if (options?.skip) params.skip = options.skip;
      if (typeof options?.activeOnly === 'boolean') params.active_only = options.activeOnly;

      const response = await axios.get<ChatSession[]>(`${this.baseURL}/projects/${normalizedId}/chats`, {
        headers: this.getHeaders(),
        params,
      });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching chats for project ${projectId}:`, error);
      return [];
    }
  }

  async getLatestProjectChat(projectId: number | string): Promise<ChatSession | null> {
    try {
      const normalizedId = Number(projectId);
      if (Number.isNaN(normalizedId)) {
        throw new Error('Invalid project id');
      }

      const response = await axios.get<ChatSession | null>(
        `${this.baseURL}/projects/${normalizedId}/chats/latest`,
        { headers: this.getHeaders() }
      );
      return response.data ?? null;
    } catch (error) {
      console.error(`Error fetching latest chat for project ${projectId}:`, error);
      return null;
    }
  }

  async createChatSession(): Promise<ChatSession> {
    return this.createGlobalChat();
  }

  async getModelStatus(): Promise<{ status: 'online' | 'offline' | 'unknown'; modelName?: string }> {
    try {
      const response = await axios.get<{ 
        status?: string; 
        online?: boolean; 
        available?: boolean;
        model?: string;
        model_name?: string;
      }>(
        `${this.baseURL}/chat/ollama/status`,
        { headers: this.getHeaders() }
      );

      let status: 'online' | 'offline' | 'unknown' = 'unknown';
      let modelName: string | undefined;

      // Extract status
      if (typeof response.data?.status === 'string') {
        const statusStr = response.data.status.toLowerCase();
        if (statusStr === 'connected' || statusStr === 'online') {
          status = 'online';
        } else if (statusStr === 'error' || statusStr === 'offline' || statusStr === 'unavailable') {
          status = 'offline';
        } else {
          status = 'unknown';
        }
      } else if (typeof response.data?.online === 'boolean') {
        status = response.data.online ? 'online' : 'offline';
      } else if (typeof response.data?.available === 'boolean') {
        status = response.data.available ? 'online' : 'offline';
      }

      // Extract model name
      modelName = response.data?.model || response.data?.model_name || undefined;

      return { status, modelName };
    } catch (error) {
      console.error('Error fetching model status:', error);
      return { status: 'offline' };
    }
  }

  async streamChatMessage(
    message: string,
    sessionId: number | string,
    options?: { webSearchEnabled?: boolean; webContext?: string; signal?: AbortSignal }
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    try {
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
        let detail = 'Failed to stream chat response.';
        try {
          const data = await response.json();
          detail = data?.detail || JSON.stringify(data) || detail;
        } catch {
          const text = await response.text();
          if (text) {
            detail = text;
          }
        }
        throw new Error(detail);
      }

      return response.body.getReader();
    } catch (error: any) {
      console.error('Streaming error details:', error?.response?.data || error);
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to stream chat response.';
      throw new Error(message);
    }
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
      const status = (error as any)?.response?.status;
      if (status === 404) {
        throw new Error('Chat session not found');
      }
      const detail =
        (error as any)?.response?.data?.detail ||
        (error as any)?.message ||
        'Failed to load chat session';
      throw new Error(detail);
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

  async uploadDocument(file: File, sessionId?: number | string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      // Get token from auth service
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData - let axios set it with boundary

      // Use chat upload endpoint if sessionId provided, otherwise use documents endpoint
      const endpoint = sessionId 
        ? `${this.baseURL}/chat/upload?session_id=${sessionId}`
        : `${this.baseURL}/documents/upload`;

      const response = await axios.post(
        endpoint,
        formData,
        {
          headers,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async startVoiceMode(personaSettings?: {
    language?: string;
    speed?: string;
    energy?: string;
    filler_words?: boolean;
    style?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/voice/start`,
        personaSettings || {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error starting voice mode:', error);
      throw new Error('Failed to start voice mode');
    }
  }

  async stopVoiceMode(): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/voice/stop`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error stopping voice mode:', error);
      throw new Error('Failed to stop voice mode');
    }
  }

  async processVoiceInput(
    audioBlob: Blob,
    sessionId?: number | string,
    webSearchEnabled: boolean = false,
    voiceSettings?: {
      language?: string;
      speed?: string;
      energy?: string;
      filler_words?: boolean;
      style?: string;
    }
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      // Determine correct filename based on blob type
      // This helps the backend detect the format correctly
      let filename = 'audio.wav';  // Default
      if (audioBlob.type.includes('webm')) {
        filename = 'audio.webm';  // Most browsers record in WebM
      } else if (audioBlob.type.includes('wav')) {
        filename = 'audio.wav';  // WAV format (if browser supports it)
      } else if (audioBlob.type.includes('ogg')) {
        filename = 'audio.ogg';
      } else if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) {
        filename = 'audio.mp4';
      } else if (audioBlob.type.includes('mp3')) {
        filename = 'audio.mp3';
      }
      
      console.log('Audio format detected:', {
        blobType: audioBlob.type,
        filename: filename,
        size: audioBlob.size
      });
      
      formData.append('audio_data', audioBlob, filename);
      
      if (sessionId !== undefined && sessionId !== null) {
        formData.append('session_id', String(sessionId));
      }
      
      formData.append('web_search_enabled', String(webSearchEnabled));
      
      if (voiceSettings) {
        formData.append('voice_language', voiceSettings.language || 'en');
        formData.append('voice_speed', voiceSettings.speed || 'normal');
        formData.append('voice_energy', voiceSettings.energy || 'balanced');
        formData.append('voice_filler_words', String(voiceSettings.filler_words || false));
        formData.append('voice_style', voiceSettings.style || 'jarvis');
      }

      const headers: Record<string, string> = {};
      const token = authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Don't set Content-Type - let browser set it with boundary for FormData

      console.log('Sending voice input:', {
        filename,
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        sessionId,
        webSearchEnabled
      });

      const response = await axios.post(
        `${this.baseURL}/chat/voice/process`,
        formData,
        {
          headers,
          timeout: 120000, // 2 minutes timeout for voice processing
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error processing voice input:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to process voice input';
      throw new Error(errorMessage);
    }
  }

  // Project API methods
  async createProject(name: string, description?: string, projectType: string = 'general'): Promise<any> {
    try {
      const payload: any = {
        name,
        project_type: projectType,
      };
      if (description) {
        payload.description = description;
      }
      const response = await axios.post(
        `${this.baseURL}/workspace/projects`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create project';
      throw new Error(errorMessage);
    }
  }

  async getProjects(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/workspace/projects`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getProject(projectId: number | string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/workspace/projects/${projectId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  async updateProject(
    projectId: number | string,
    payload: { name?: string; description?: string; color?: string }
  ): Promise<any> {
    try {
      const normalizedId = Number(projectId);
      if (Number.isNaN(normalizedId)) {
        throw new Error('Invalid project id');
      }
      if (!payload || Object.keys(payload).length === 0) {
        throw new Error('No update payload provided');
      }
      const response = await axios.put(
        `${this.baseURL}/workspace/projects/${normalizedId}`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating project ${projectId}:`, error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to update project';
      throw new Error(errorMessage);
    }
  }

  async deleteProject(projectId: number | string): Promise<void> {
    try {
      const normalizedId = Number(projectId);
      if (Number.isNaN(normalizedId)) {
        throw new Error('Invalid project id');
      }
      await axios.delete(`${this.baseURL}/workspace/projects/${normalizedId}`, {
        headers: this.getHeaders(),
      });
    } catch (error: any) {
      console.error(`Error deleting project ${projectId}:`, error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to delete project';
      throw new Error(errorMessage);
    }
  }

  async createChatSessionWithProject(projectId?: number | string | null): Promise<ChatSession> {
    if (projectId !== null && projectId !== undefined) {
      return this.createProjectChat(projectId);
    }
    return this.createGlobalChat();
  }

  async createGlobalChat(title?: string): Promise<ChatSession> {
    try {
      const payload = title ? { title } : {};
      const response = await axios.post<ChatSession>(
        `${this.baseURL}/chats`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating global chat:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create global chat session';
      throw new Error(errorMessage);
    }
  }

  async createProjectChat(projectId: number | string, title?: string): Promise<ChatSession> {
    try {
      const normalizedId = Number(projectId);
      if (Number.isNaN(normalizedId)) {
        throw new Error('Invalid project id');
      }
      const payload = title ? { title } : {};
      const response = await axios.post<ChatSession>(
        `${this.baseURL}/projects/${normalizedId}/chats`,
        payload,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error creating chat session for project ${projectId}:`, error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create project chat session';
      throw new Error(errorMessage);
    }
  }
}

export default ApiService;
