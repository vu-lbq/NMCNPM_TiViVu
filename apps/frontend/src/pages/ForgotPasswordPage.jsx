import { useState } from 'react';
import { authService } from '../services/api.jsx';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await authService.forgotPassword(email);
      setStatus('sent');
    } catch (err) {
      // Fetch-based errors carry details in err.message from handleResponse
      setError(err?.message || 'Failed to send reset email');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#e0f7fa] p-4 rounded-full">
            <KeyRound className="w-8 h-8 text-[#00BDB6]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1D2957] text-center mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          No worries! Enter your email and we will send you reset instructions.
        </p>

        {status === 'sent' ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 text-sm">
              If an account exists for <b>{email}</b>, we have sent a password reset link.
            </div>
            <Link 
              to="/login"
              className="inline-flex items-center text-[#00BDB6] hover:underline font-medium mt-4"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1D2957] mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00BDB6] focus:ring-2 focus:ring-[#00BDB6]/20 outline-none transition-all text-[#1D2957] placeholder-gray-400" 
                  placeholder="Enter your email" 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'sending'}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow-lg shadow-[#00BDB6]/20 ${
                status === 'sending' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#00BDB6] hover:bg-[#00a8a2] active:scale-[0.98]'
              }`}
            >
              {status === 'sending' ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-6">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1D2957] transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}