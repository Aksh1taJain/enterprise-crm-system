import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadNew from './pages/LeadNew';
import LeadDetails from './pages/LeadDetails';
import Deals from './pages/Deals';
import DealDetails from './pages/DealDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Activities from './pages/Activities';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Users from './pages/Users';

// Admin route protector wrapper
import { useAuth } from './context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role !== 'Admin') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center max-w-md mx-auto space-y-4 my-12 shadow-xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h4 className="font-extrabold text-white text-lg">Access Denied</h4>
        <p className="text-slate-400 text-sm">You do not have Administrator permissions to access the user configuration directory.</p>
        <Link to="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
};

// Helper link import for the AdminRoute fallback
import { Link } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Dashboard Shell */}
          <Route path="/" element={<DashboardLayout />}>
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/new" element={<LeadNew />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            
            <Route path="deals" element={<Deals />} />
            <Route path="deals/:id" element={<DealDetails />} />
            
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            
            <Route path="activities" element={<Activities />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Admin Only Route */}
            <Route 
              path="users" 
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } 
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
