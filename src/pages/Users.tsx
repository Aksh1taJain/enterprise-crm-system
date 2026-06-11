import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Mail, 
  Lock, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal configuration
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales Representative');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Sales Representative');
    setModalError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank if no change
    setRole(user.role);
    setModalError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (!editingUser && !password)) {
      setModalError('Please fill out all required fields.');
      return;
    }

    setModalError('');
    setSaving(true);
    try {
      if (editingUser) {
        // Edit User
        const payload: any = { name, email, role };
        if (password) payload.password = password;

        const response = await api.put(`/users/${editingUser._id}`, payload);
        setUsers(users.map(u => (u._id === editingUser._id ? response.data : u)));
        alert('User updated successfully!');
      } else {
        // Create User
        const response = await api.post('/users', { name, email, password, role });
        setUsers([response.data, ...users]);
        alert('User created successfully!');
      }
      setModalOpen(false);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?._id) {
      alert('You cannot delete your own admin account.');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this user? All leads assigned to them will remain in database.')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        alert('User removed successfully.');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Configure CRM access privileges and manage representative roles</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Create User Account
        </button>
      </div>

      {/* Users List Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role Access Tier</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {u.name}
                        {u._id === currentUser?._id && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-950 text-indigo-400 border border-slate-800 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        {u.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        u.role === 'Admin' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {u._id !== currentUser?._id && (
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Editing Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/20">
              <h3 className="font-bold text-white text-md flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-indigo-400" />
                {editingUser ? 'Edit CRM Account' : 'Initialize CRM Account'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Error alerts */}
            {modalError && (
              <div className="mx-6 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg p-2.5 text-center">
                {modalError}
              </div>
            )}

            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.r@leadsphere.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password {editingUser && '(Leave blank to keep current)'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingUser}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Access Authorization Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-950/40 border border-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 rounded-xl shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Users;
