import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  Briefcase, 
  Search, 
  Eye, 
  Building, 
  Mail, 
  Phone, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Customer {
  _id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  assignedTo: {
    name: string;
  } | null;
  createdAt: string;
}

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;

      const response = await api.get('/customers', { params });
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Directory of all successfully converted enterprise customer profiles</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, name, email..."
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Customers Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <Spinner />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h5 className="font-bold text-white text-lg">No customers listed</h5>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Customers are automatically created in the CRM directory when a sales deal stage is marked Won.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Assigned Representative</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <Building className="w-4.5 h-4.5 text-slate-500" />
                        {cust.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-200">
                      {cust.contactName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <Mail className="w-4 h-4 text-slate-500" />
                        {cust.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-4 h-4 text-slate-500" />
                        {cust.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {cust.assignedTo ? (
                        <span className="text-white bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-800 text-xs font-medium">
                          {cust.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/customers/${cust._id}`}
                        className="inline-flex items-center justify-center p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/10"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Customers;
