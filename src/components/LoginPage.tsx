import React, { useState } from 'react';
import { ArrowLeft, Mail, Wallet, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();

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

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'Successfully signed in! Redirecting...' });
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created successfully! Please check your email to verify your account.' 
          });
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Password reset email sent! Please check your inbox and follow the instructions.' 
        });
        setTimeout(() => {
          setShowPasswordReset(false);
          setResetEmail('');
        }, 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to send password reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to sign in with Google. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Form
  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Colorful illustration grid */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-500 relative overflow-hidden">
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
              <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
              <p className="text-xl opacity-90">We'll send you a secure link to reset your password</p>
            </div>
          </div>
        </div>

        {/* Right side - Password reset form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button
              onClick={() => {
                setShowPasswordReset(false);
                setMessage(null);
                setResetEmail('');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Login</span>
            </button>
            
            <div className="flex items-center gap-4">
              <Logo className="h-10" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={32} className="text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
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

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <button
                    onClick={() => {
                      setShowPasswordReset(false);
                      setMessage(null);
                      setResetEmail('');
                    }}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                    disabled={loading}
                  >
                    Sign in instead
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Colorful illustration grid */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-400 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-1 p-4">
          {/* Generate colorful squares with various shapes and characters */}
          {Array.from({ length: 48 }, (_, i) => (
            <div
              key={i}
              className={`rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 hover:scale-110 ${getRandomColor(i)}`}
            >
              {getRandomCharacter(i)}
            </div>
          ))}
        </div>
        
        {/* Overlay with brand message */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Join the Creator Economy</h2>
            <p className="text-xl opacity-90">Start selling your digital products today</p>
          </div>
        </div>
      </div>

      {/* Right side - Login/Signup form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
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
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              disabled={loading}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Log in' : 'Create your account'}
              </h1>
              <p className="text-gray-600">
                {isLogin 
                  ? 'Welcome back! Please sign in to your account.' 
                  : 'Join thousands of creators selling digital products.'
                }
              </p>
            </div>

            {/* Message display */}
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

            {/* Social login buttons */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(true);
                      setMessage(null);
                    }}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Log in' : 'Create account'
                )}
              </button>
            </form>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
              </p>
            )}
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
    '🎨', '🎵', '📚', '🎬', '🖼️', '✨', '🚀', '💡', '🎯', '🌟',
    '🎪', '🎭', '🎨', '🎸', '📖', '🎥', '🖌️', '⭐', '🔥', '💫',
    '🎊', '🎉', '🎈', '🎁', '🏆', '🎖️', '🥇', '🎲', '🎮', '🎯',
    '🌈', '☀️', '🌙', '⚡', '🔮', '💎', '🎪', '🎨', '🎵', '📚',
    '🎬', '🖼️', '✨', '🚀', '💡', '🎯', '🌟', '🎭'
  ];
  return characters[index % characters.length];
}

export default LoginPage;