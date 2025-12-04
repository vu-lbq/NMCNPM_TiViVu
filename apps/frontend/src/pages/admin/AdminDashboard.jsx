import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.jsx';
import { useAuth } from '../../context/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (e) {
        setError('Failed to load stats');
      }
    })();
  }, []);

  if (!user || user.role !== 'admin') {
    return <div className="p-6">Forbidden</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-[#1D2957]">Admin Overview</h1>
        <a href="/" className="text-sm px-3 py-2 rounded border bg-white hover:bg-gray-100 border-gray-200 text-[#1D2957]" title="Back to TiviVu Chat">TiviVu</a>
      </div>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Users" value={stats.users} />
          <Card title="Active (7d)" value={stats.usersActive7d} />
          <Card title="Conversations" value={stats.conversations} />
          <Card title="Messages" value={stats.messages} />
          <Card title="Vocabulary" value={stats.vocabulary} />
          <Card title="Feedback" value={stats.feedbacks} />
        </div>
      ) : (
        <p>Loading…</p>
      )}

      <div className="mt-6 flex gap-3">
        <a href="/admin/users" className="px-3 py-2 rounded bg-[#00BDB6] text-white shadow-sm hover:bg-[#00a8a2]">Manage Users</a>
        <a href="/admin/feedback" className="px-3 py-2 rounded bg-white border border-gray-200 text-[#1D2957] hover:bg-gray-100">View Feedback</a>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-[#1D2957]">{value}</div>
    </div>
  );
}
