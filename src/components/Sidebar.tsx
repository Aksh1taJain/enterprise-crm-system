import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  DollarSign, 
  Briefcase, 
  Activity, 
  FileSpreadsheet, 
  User, 
  Users,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: UserCheck },
    { to: '/deals', label: 'Deals', icon: DollarSign },
    { to: '/customers', label: 'Customers', icon: Briefcase },
    { to: '/activities', label: 'Activities', icon: Activity },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  // Admin-only Link
  if (isAdmin) {
    links.push({ to: '/users', label: 'Manage Users', icon: Users });
  }

  const activeClass = 'flex items-center gap-3 px-4 py-3 text-white bg-indigo-600 rounded-lg transition-all shadow-md shadow-indigo-600/20';
  const inactiveClass = 'flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-800 bg-slate-900/50">
          <Compass className="w-8 h-8 text-indigo-500 animate-pulse" />
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white">LEADSPHERE</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block -mt-1">Enterprise CRM</span>
          </div>
        </div>

        {/* User Mini Panel */}
        <div className="p-4 mx-4 my-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-indigo-400 font-medium truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 text-center border-t border-slate-800">
          <p className="text-[10px] text-slate-500 font-medium">LeadSphere v1.0.0</p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
