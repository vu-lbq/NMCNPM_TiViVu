import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.jsx';
import { useAuth } from '../../context/useAuth';

export default function AdminUsers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', displayName: '', role: 'user' });

  const load = async () => {
    try {
      const data = await adminService.listUsers();
      setItems(data.users || []);
    } catch (e) {
      setError('Failed to load users');
    }
  };

  useEffect(() => { load(); }, []);

  if (!user || user.role !== 'admin') return <div className="p-6">Forbidden</div>;

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(form);
      setForm({ username: '', password: '', displayName: '', role: 'user' });
      await load();
    } catch (e) {
      setError('Failed to create user');
    }
  };

  const del = async (id) => { await adminService.deleteUser(id); await load(); };
  const toggle = async (id) => { await adminService.toggleRole(id); await load(); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Users</h1>
        <a href="/" className="text-sm px-3 py-2 rounded border bg-white hover:bg-gray-100" title="Back to TiviVu Chat">TiviVu</a>
      </div>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <input className="border rounded px-3 py-2" placeholder="Email (username)" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
        <input className="border rounded px-3 py-2" placeholder="Display Name" value={form.displayName} onChange={e=>setForm({...form, displayName:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <select className="border rounded px-3 py-2" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button className="px-3 py-2 rounded bg-[#00BDB6] text-white">Create</button>
      </form>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Display Name</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
          {items.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.displayName || '-'}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="p-2 space-x-2">
                <button onClick={()=>toggle(u.id)} className="px-2 py-1 rounded border">Toggle Role</button>
                <button onClick={()=>del(u.id)} className="px-2 py-1 rounded border text-red-600">Delete</button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
