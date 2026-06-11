import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  Handshake, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Eye, 
  Building, 
  FolderLock,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Deal {
  _id: string;
  lead: {
    _id: string;
    name: string;
    company: string;
    assignedTo: {
      name: string;
    } | null;
  } | null;
  value: number;
  stage: string;
  expectedCloseDate: string;
  createdAt: string;
}

interface LeadSummary {
  _id: string;
  name: string;
  company: string;
}

export const Deals: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Creation modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [stage, setStage] = useState('Qualified');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDealsAndLeads = async () => {
    try {
      setLoading(true);
      const [dealsRes, leadsRes] = await Promise.all([
        api.get('/deals'),
        api.get('/leads'), // To populate the dropdown in the creation modal
      ]);
      setDeals(dealsRes.data);
      // Filter out leads that aren't Won/Lost yet, or just display all leads that representative has access to.
      setLeads(leadsRes.data);
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndLeads();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !dealValue || !expectedCloseDate) {
      setModalError('Please fill out all fields.');
      return;
    }

    setModalError('');
    setSaving(true);
    try {
      const response = await api.post('/deals', {
        lead: selectedLead,
        value: parseFloat(dealValue),
        stage,
        expectedCloseDate,
      });

      setDeals([response.data, ...deals]);
      setModalOpen(false);
      // Reset form
      setSelectedLead('');
      setDealValue('');
      setStage('Qualified');
      setExpectedCloseDate('');
      alert('Deal created successfully!');
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create deal.');
    } finally {
      setSaving(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Qualified':
        return 'bg-blue-500/10 text-blue-455 border border-blue-500/20';
      case 'Negotiation':
        return 'bg-amber-500/10 text-amber-440 border border-amber-500/20';
      case 'Proposal':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Won':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Lost':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Track contract values, negotiate details, and close pipeline contracts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
        >
          <Plus className="w-4.5 h-4.5" />
          Create New Deal
        </button>
      </div>

      {/* Deals Pipeline table grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <Spinner />
        ) : deals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Handshake className="w-12 h-12 text-slate-600 mx-auto" />
            <h5 className="font-bold text-white text-lg">No active deals</h5>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Create a deal linking to a prospective lead in your pipeline to begin tracking values.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Lead Context</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Deal Value</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4">Expected Close</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deals.map((deal) => (
                  <tr key={deal._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {deal.lead ? (
                        <div>
                          <div className="font-semibold text-white">{deal.lead.name}</div>
                          <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 border border-indigo-500/10 rounded mt-1 inline-block">
                            Rep: {deal.lead.assignedTo ? deal.lead.assignedTo.name : 'Unassigned'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-rose-400 text-xs italic">Deleted Lead Context</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building className="w-4 h-4 text-slate-500" />
                        {deal.lead ? deal.lead.company : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-sm">
                      <div className="flex items-center text-emerald-400">
                        <DollarSign className="w-4 h-4 -mr-0.5" />
                        {formatCurrency(deal.value)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStageColor(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/deals/${deal._id}`}
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

      {/* Creation Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/20">
              <h3 className="font-bold text-white text-md flex items-center gap-2">
                <Handshake className="w-5 h-5 text-indigo-400" />
                Initialize Pipeline Deal
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="mx-6 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg p-2.5 text-center">
                {modalError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              {/* Select Lead */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Link to Lead *</label>
                <select
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select a qualified Lead</option>
                  {leads.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.company})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal Value */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contract Value ($) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="15000"
                    required
                    min={0}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Stage select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Deal Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Qualified">Qualified</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Close Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Expected Close Date *</label>
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
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
                  className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 rounded-xl transition-all shadow-lg"
                >
                  {saving ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Deals;
