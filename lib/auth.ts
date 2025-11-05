import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, OAuthCredentials, User, LoginApiResponse, RegisterApiResponse } from '@/types';

// Direct backend API URL
// Note: Ensure CORS is configured on the backend to allow requests from this origin
const API_BASE_URL = 'http://155.117.40.181:4020/api/v1';

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

  // Register new user (Signup)
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const payload = {
        email: credentials.email,
        username: credentials.username,
        full_name: credentials.full_name,
        password: credentials.password,
        ...(credentials.phone_number && { phone_number: credentials.phone_number }),
        ...(credentials.profile_picture_url && { profile_picture_url: credentials.profile_picture_url }),
      };

      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/signup/complete`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      ).catch((error: any) => {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
          throw new Error('Network error: Unable to connect to server. Please check your connection or try again later.');
        }
        if (error.response) {
          throw error;
        }
        throw new Error(`Network error: ${error.message || 'Connection failed'}`);
      });

      // API returns { access_token, token_type }
      if (response.data && response.data.access_token) {
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
              full_name: credentials.full_name,
              username: credentials.username,
            },
          },
        };
      }

      throw new Error('Registration failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.response?.data?.detail || error.message || 'Registration failed. Please try again.'
      );
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password,
        keep_logged_in: credentials.keep_logged_in || false,
      };

      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      ).catch((error: any) => {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('ERR_EMPTY_RESPONSE')) {
          throw new Error('Network error: Unable to connect to server. Please check your connection or try again later.');
        }
        if (error.response) {
          throw error;
        }
        throw new Error(`Network error: ${error.message || 'Connection failed'}`);
      });

      // API returns { access_token, token_type }
      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        
        // Fetch user details after successful login
        const userData = await this.getCurrentUser();
        
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
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.detail
        || error.message 
        || 'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  }

  // Login with Google
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login/google`,
        { token: googleToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || { id: '', email: '' },
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

  // Login with Microsoft
  async loginWithMicrosoft(microsoftToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login/microsoft`,
        { token: microsoftToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || { id: '', email: '' },
          },
        };
      }

      throw new Error('Microsoft login failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Microsoft login failed. Please try again.'
      );
    }
  }

  // Login with Phone
  async loginWithPhone(phoneNumber: string, verificationCode: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/login/phone`,
        { phone_number: phoneNumber, verification_code: verificationCode },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || { id: '', email: '' },
          },
        };
      }

      throw new Error('Phone login failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Phone login failed. Please try again.'
      );
    }
  }

  // Signup with Google
  async signupWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/signup/google`,
        { token: googleToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || { id: '', email: '' },
          },
        };
      }

      throw new Error('Google signup failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Google signup failed. Please try again.'
      );
    }
  }

  // Signup with Microsoft
  async signupWithMicrosoft(microsoftToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginApiResponse>(
        `${API_BASE_URL}/auth/signup/microsoft`,
        { token: microsoftToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.access_token) {
        this.setToken(response.data.access_token);
        const userData = await this.getCurrentUser();
        
        return {
          success: true,
          data: {
            token: response.data.access_token,
            user: userData || { id: '', email: '' },
          },
        };
      }

      throw new Error('Microsoft signup failed: No access token received');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Microsoft signup failed. Please try again.'
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
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/auth/reset-password`,
        { token, new_password: newPassword },
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
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      const user = this.getUser();
      
      if (token && user) {
        // Call logout API with user information
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {
            user_id: user.id,
            email: user.email,
            message: 'User logged out'
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch((error) => {
          // Even if API call fails, clear local auth
          console.error('Logout API error:', error);
        });
      }
    } catch (error) {
      // Even if API call fails, clear local auth
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      this.clearAuth();
    }
  }
}

export default new AuthService();

