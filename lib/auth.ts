import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, OAuthCredentials, User, LoginApiResponse, RegisterApiResponse } from '@/types';

// Using Next.js API routes as proxy to avoid CORS issues
// Note: In production, use proper SSL certificates with HTTPS
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api' // Use Next.js API routes in browser
  : 'http://155.117.40.181:4020/api/v1'; // Direct connection from server-side

// Token storage utilities (localStorage with encryption-like naming)
const TOKEN_KEY = 'ashiya_auth_token';
const USER_KEY = 'ashiya_user_data';

class AuthService {
  // Store token securely in localStorage
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  // Store user data
  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  // Get user data
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Clear all auth data
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<RegisterApiResponse>(
        `${API_BASE_URL}/auth/register`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      ).catch((error: any) => {
        // Better error handling for network issues
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
          throw new Error('Network error: Unable to connect to server. Please check your connection or try again later.');
        }
        if (error.response) {
          throw error;
        }
        throw new Error(`Network error: ${error.message || 'Connection failed'}`);
      });

      // Handle different response formats
      if (response.data.access_token) {
        // Format: { access_token, token_type }
        this.setToken(response.data.access_token);
        
        // Fetch user details after successful registration
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || {
              id: '',
              email: credentials.email,
              name: credentials.full_name,
            },
          },
        };
      } else if (response.data.success && response.data.data) {
        // Format: { success, data: { token, user } }
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
        return response.data as AuthResponse;
      }

      throw new Error('Registration failed: Unexpected response format');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      );
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      ).catch((error: any) => {
        // Better error handling for network issues
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
          throw new Error('Network error: Unable to connect to server. Please check your connection or try again later.');
        }
        if (error.response) {
          // Server responded with error status
          throw error;
        }
        // Network or other error
        throw new Error(`Network error: ${error.message || 'Connection failed'}`);
      });

      // API returns { access_token, token_type }
      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        
        // Fetch user details after successful login
        const userData = await this.getCurrentUser();
        
        // Return in expected format
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || {
              id: '',
              email: credentials.email,
            },
          },
        };
      }

      throw new Error('Login failed: No access token received');
    } catch (error: any) {
      // Extract error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.detail
        || error.message 
        || 'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  }

  // Login with Google (Google ID token)
  async loginWithGoogle(googleIdToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/google-login`,
        { token: googleIdToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // API returns { access_token, token_type }
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        
        // Fetch user details after successful login
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || {
              id: '',
              email: '',
            },
          },
        };
      }

      throw new Error('Google login failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Google login failed. Please try again.'
      );
    }
  }

  // Login with OAuth providers (Google/Microsoft/GitHub/Facebook)
  async loginWithOAuth(credentials: OAuthCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login/oauth`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // API returns { access_token, token_type }
      if (response.data.access_token) {
        this.setToken(response.data.access_token);
        
        // Fetch user details after successful login
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || {
              id: '',
              email: '',
            },
          },
        };
      }

      throw new Error('OAuth login failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'OAuth login failed. Please try again.'
      );
    }
  }

  // Get current user details
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await axios.get<User | { success: boolean; data?: User }>(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      ).catch((error: any) => {
        if (error.response?.status === 401) {
          this.clearAuth();
        }
        throw error;
      });

      // API returns user object directly OR wrapped in { success, data }
      let userData: User | null = null;
      
      if ('success' in response.data && response.data.success && response.data.data) {
        // Wrapped format: { success: true, data: { ... } }
        userData = response.data.data;
      } else if ('id' in response.data && 'email' in response.data) {
        // Direct format: { id, email, ... }
        userData = response.data as User;
      }

      if (userData) {
        // Normalize name field from full_name
        if (userData.full_name && !userData.name) {
          userData.name = userData.full_name;
        }
        this.setUser(userData);
        return userData;
      }

      return null;
    } catch (error: any) {
      // If token is invalid, clear auth
      if (error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to send reset password email.'
      );
    }
  }

  // Reset password
  async resetPassword(
    token: string,
    password: string,
    otp?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/auth/reset-password`,
        { token, password, otp },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to reset password.'
      );
    }
  }

  // Logout
  logout(): void {
    this.clearAuth();
  }
}

export default new AuthService();

