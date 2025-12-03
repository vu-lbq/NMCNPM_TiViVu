import { useEffect, useState } from 'react';
import { authService } from '../services/api.jsx';

export default function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search);
  const initEmail = params.get('email') || '';
  const token = params.get('token') || '';

  const [email] = useState(initEmail);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | verifying | ready | resetting | done | error
  const [error, setError] = useState('');

  useEffect(() => {
    async function verify() {
      setStatus('verifying');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error(await res.text());
        setStatus('ready');
      } catch (err) {
        setError('Invalid or expired reset link');
        setStatus('error');
      }
    }
    if (email && token) verify();
  }, [email, token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('resetting');
    setError('');
    try {
      await authService.resetPassword({ email, token, password });
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>
      {status === 'error' && <p className="text-red-600 mb-3">{error}</p>}
      {status === 'done' ? (
        <p className="text-green-600">Your password has been reset. You can close this page and log in.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input type="password" required minLength={8}
                   value={password} onChange={(e) => setPassword(e.target.value)}
                   className="border rounded px-3 py-2 w-full" placeholder="Enter a strong password" />
          </div>
          <button type="submit" disabled={status !== 'ready' && status !== 'resetting'}
                  className="bg-blue-600 text-white px-4 py-2 rounded">
            {status === 'resetting' ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
