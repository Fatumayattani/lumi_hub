import React, { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ResetPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

function ResetPasswordPage({ onBack, onSuccess }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { updatePassword } = useAuth();

  // Logo component with fallback
  const Logo = ({ className = "h-10" }: { className?: string }) => {
    return (
      <div className={`${className} flex items-center`}>
        <img 
          src="/ll.png" 
          alt="Lumi Hub" 
          className={className}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.logo-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = `logo-fallback ${className.replace('h-', 'h-')} bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold text-lg px-3`;
              fallback.textContent = 'LH';
              fallback.style.minWidth = className.includes('h-10') ? '40px' : className.includes('h-8') ? '32px' : className.includes('h-6') ? '24px' : '40px';
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' });
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Colorful illustration grid */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-1 p-4">
          {Array.from({ length: 48 }, (_, i) => (
            <div
              key={i}
              className={`rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 hover:scale-110 ${getRandomColor(i)}`}
            >
              {getRandomCharacter(i)}
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <KeyRound size={64} className="mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4">Set New Password</h2>
            <p className="text-xl opacity-90">Choose a strong password for your account</p>
          </div>
        </div>
      </div>

      {/* Right side - Reset password form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <Logo className="h-10" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound size={32} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
              <p className="text-gray-600">
                Enter your new password below. Make sure it's strong and secure.
              </p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm your new password"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                    At least 6 characters long
                  </li>
                  <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                    Passwords match
                  </li>
                </ul>
              </div>
              
              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for the colorful grid
function getRandomColor(index: number): string {
  const colors = [
    'bg-pink-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400',
    'bg-red-400', 'bg-indigo-400', 'bg-orange-400', 'bg-teal-400', 'bg-cyan-400',
    'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500',
    'bg-red-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500'
  ];
  return colors[index % colors.length];
}

function getRandomCharacter(index: number): string {
  const characters = [
    '🔐', '🔑', '🛡️', '🔒', '⚡', '✨', '🚀', '💡', '🎯', '🌟',
    '🔥', '💫', '⭐', '🌈', '☀️', '🌙', '💎', '🎪', '🎨', '🎵',
    '📚', '🎬', '🖼️', '🎭', '🎸', '📖', '🎥', '🖌️', '🎊', '🎉',
    '🎈', '🎁', '🏆', '🎖️', '🥇', '🎲', '🎮', '🔮', '💫', '⚡',
    '✨', '🚀', '💡', '🎯', '🌟', '🔥', '💎', '🌈'
  ];
  return characters[index % characters.length];
}

export default ResetPasswordPage;