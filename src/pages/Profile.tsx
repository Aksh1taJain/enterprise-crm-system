import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldAlert, LogOut, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <p className="text-sm text-slate-400">View and manage your CRM user credentials</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        {/* Profile Avatar Card */}
        <div className="flex items-center gap-4 border-b border-slate-800/80 pb-5">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-600/10">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{user?.name}</h3>
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>

        {/* User parameters */}
        <div className="space-y-4 text-xs font-semibold text-slate-400">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500" />
            <div className="min-w-0">
              <p className="uppercase text-[9px] tracking-wider text-slate-500">Email Address</p>
              <p className="text-sm text-white font-bold truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-slate-500" />
            <div className="min-w-0">
              <p className="uppercase text-[9px] tracking-wider text-slate-500">Unique Profile ID</p>
              <p className="text-sm text-slate-300 font-bold font-mono truncate mt-0.5">{user?._id}</p>
            </div>
          </div>

          {/* Auth Verification */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="uppercase text-[9px] tracking-wider text-slate-500">Access Tier Status</p>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded mt-0.5 inline-block text-[10px]">
                Active Session
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white font-bold py-2.5 rounded-xl text-sm transition-all mt-6 shadow-md shadow-rose-950/10"
        >
          <LogOut className="w-4.5 h-4.5" />
          Disconnect Session
        </button>
      </div>
    </div>
  );
};
export default Profile;
