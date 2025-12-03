import { useState } from 'react';
import { authService } from '../services/api.jsx';

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
      setError(err.message || 'Failed to send email');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
      {status === 'sent' ? (
        <p className="text-green-600">If the email exists, a reset link has been sent.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                   className="border rounded px-3 py-2 w-full" placeholder="you@example.com" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={status === 'sending'}
                  className="bg-blue-600 text-white px-4 py-2 rounded">
            {status === 'sending' ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
}
