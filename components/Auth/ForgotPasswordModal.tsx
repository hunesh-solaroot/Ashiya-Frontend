'use client';

import { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';
import authService from '@/lib/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset password email. Please try again.');
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
        {/* Header */}
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
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBackToLogin();
            }}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 transition-colors z-20 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center justify-center mt-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#533293] to-[#A4496A] rounded-full flex items-center justify-center">
              <Mail className="text-white w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Forgot Password</h2>
          <p className="text-gray-600 text-center">
            {success 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
                <p className="font-medium mb-1">Email sent successfully!</p>
                <p>We've sent password reset instructions to your email address. Please check your inbox and follow the instructions to reset your password.</p>
              </div>
              
              <button
                onClick={onBackToLogin}
                className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white py-3 rounded-lg font-semibold hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all shadow-lg"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address*
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-[#533293] to-[#A4496A] text-white py-3 rounded-lg font-semibold hover:from-[#533293]/90 hover:to-[#A4496A]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-[#A4496A] hover:text-[#A4496A]/80 font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

