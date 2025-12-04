import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.jsx';
import { useAuth } from '../../context/useAuth';

export default function AdminFeedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await adminService.listFeedback();
      setItems(data.feedback || []);
    } catch (e) {
      setError('Failed to load feedback');
    }
  };

  useEffect(() => { load(); }, []);

  if (!user || user.role !== 'admin') return <div className="p-6">Forbidden</div>;

  const del = async (id) => { await adminService.deleteFeedback(id); await load(); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Feedback</h1>
        <a href="/" className="text-sm px-3 py-2 rounded border bg-white hover:bg-gray-100" title="Back to TiviVu Chat">TiviVu</a>
      </div>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <div className="space-y-3">
        {items.map(f => (
          <div key={f.id} className="p-4 rounded-xl border bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">{new Date(f.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-700">{f.email || 'Anonymous'}</div>
              </div>
              <button onClick={()=>del(f.id)} className="px-2 py-1 rounded border text-red-600">Delete</button>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{f.message}</p>
          </div>
        ))}
        {items.length === 0 && <p>No feedback yet.</p>}
      </div>
    </div>
  );
}
