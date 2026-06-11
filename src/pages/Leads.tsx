import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Eye, 
  Building,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  assignedTo: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface UserSummary {
  _id: string;
  name: string;
}

export const Leads: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [representatives, setRepresentatives] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filtering & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [repFilter, setRepFilter] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (repFilter) params.assignedTo = repFilter;

      const response = await api.get('/leads', { params });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, repFilter]);

  // Fetch representatives for filtering dropdown if Admin
  useEffect(() => {
    if (isAdmin) {
      const fetchReps = async () => {
        try {
          const response = await api.get('/users');
          // filter to only display Sales Representative roles or just show all user choices
          setRepresentatives(response.data);
        } catch (error) {
          console.error('Error fetching reps:', error);
        }
      };
      fetchReps();
    }
  }, [isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Qualified':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'Proposal Sent':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Won':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Lost':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Manage, capture, and convert inbound CRM inquiries</p>
        </div>
        <Link
          to="/leads/new"
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" />
          Add New Lead
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="relative">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Reach">Cold Reach</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Rep Filter (Admin Only) */}
        {isAdmin ? (
          <div className="relative">
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="">All Assigned Reps</option>
              {representatives.map((rep) => (
                <option key={rep._id} value={rep._id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center justify-center text-xs font-semibold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 rounded-xl py-2 px-4">
            Filtering Assigned Leads Only
          </div>
        )}
      </div>

      {/* Table grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <Spinner />
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h5 className="font-bold text-white text-lg">No leads found</h5>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">There are no leads matching your search criteria or assigned in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Lead Contact</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building className="w-4 h-4 text-slate-500" />
                        {lead.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium">
                      {lead.assignedTo ? (
                        <span className="text-white bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-800 text-xs">
                          {lead.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/leads/${lead._id}`}
                        className="inline-flex items-center justify-center p-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/10"
                        title="View details"
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
export default Leads;
