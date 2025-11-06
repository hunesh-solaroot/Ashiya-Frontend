'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password, keep_logged_in: rememberMe });
      // Close modal on successful login
      onClose();
      setEmail('');
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // For Google login, you'll need to implement Google OAuth flow
      // This is a placeholder - you'll need to integrate with Google OAuth SDK
      alert('Google login integration required. Please implement Google OAuth SDK.');
      // const googleToken = await getGoogleToken(); // Implement this
      // await loginWithGoogle(googleToken);
      // onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // For Microsoft login, you'll need to implement Microsoft OAuth flow
      alert('Microsoft login integration required. Please implement Microsoft OAuth SDK.');
      // const microsoftToken = await getMicrosoftToken(); // Implement this
      // await loginWithMicrosoft(microsoftToken);
      // onClose();
    } catch (err: any) {
      setError(err.message || 'Microsoft login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white border border-gray-300 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-300 relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors z-20 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
            type="button"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in</h2>
          <p className="text-gray-600">Enter your email and password to log in</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-900 font-medium">Log in with Google</span>
          </button>

          {/* Separator */}
          <div className="relative flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-900 mb-1">
              Email*
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Password*
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-400 bg-gray-100 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-900">Keep me logged in</span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (onSwitchToForgotPassword) {
                  onSwitchToForgotPassword();
                }
              }}
              className="text-sm text-[#A4496A] hover:text-[#A4496A]/80 hover:underline"
            >
              Forget password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white py-3 rounded-lg font-semibold hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Not registered yet?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#A4496A] hover:text-[#A4496A]/80 font-semibold hover:underline"
            >
              Create an Account
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

