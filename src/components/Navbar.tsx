import React from 'react';
import { Menu, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Compute page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/leads/new')) return 'Create Lead';
    if (path.startsWith('/leads/')) return 'Lead Details';
    if (path.startsWith('/leads')) return 'Leads Directory';
    if (path.startsWith('/deals/')) return 'Deal Details';
    if (path.startsWith('/deals')) return 'Sales Deals';
    if (path.startsWith('/customers/')) return 'Customer Profile';
    if (path.startsWith('/customers')) return 'Customers';
    if (path.startsWith('/activities')) return 'Activity Streams';
    if (path.startsWith('/reports')) return 'Analytics Reports';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/users')) return 'User Management';
    return 'CRM Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white transition-colors md:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Dynamic page title */}
        <h2 className="text-xl font-bold tracking-tight text-white">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'Admin' && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin Security Mode
          </div>
        )}

        <div className="h-6 w-px bg-slate-800 hidden sm:block" />

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;
