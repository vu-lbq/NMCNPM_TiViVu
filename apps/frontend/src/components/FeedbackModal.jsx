import { useState } from 'react';
import { XCircle } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const stored = localStorage.getItem('tivivu_user');
      const token = stored ? (JSON.parse(stored)?.token || null) : null;
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, email: token ? undefined : email })
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('sent');
      setMessage('');
    } catch (err) {
      setError(typeof err === 'string' ? err : (err?.message || 'Failed'));
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-[#1D2957]">Send Feedback</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          {!localStorage.getItem('tivivu_user') && (
            <div>
              <label className="block text-sm mb-1">Email (optional)</label>
              <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea className="w-full border rounded px-3 py-2 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you think..." required minLength={10} />
            <p className="text-xs text-gray-500 mt-1">At least 10 characters.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {status === 'sent' ? (
            <p className="text-green-600">Thanks! Your feedback was sent.</p>
          ) : (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Close</button>
              <button type="submit" disabled={status==='sending'} className="px-3 py-2 rounded bg-[#00BDB6] text-white">
                {status==='sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
