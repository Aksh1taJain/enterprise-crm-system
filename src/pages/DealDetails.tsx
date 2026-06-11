import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  Briefcase, 
  FileText,
  Mail,
  Phone
} from 'lucide-react';

interface Deal {
  _id: string;
  lead: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
    assignedTo: {
      name: string;
      email: string;
    } | null;
  } | null;
  value: number;
  stage: string;
  expectedCloseDate: string;
  createdAt: string;
}

export const DealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form states
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/deals/${id}`);
      setDeal(response.data);

      // Initialize form values
      setValue(response.data.value.toString());
      setStage(response.data.stage);
      
      // Format date to YYYY-MM-DD
      const dateStr = response.data.expectedCloseDate.split('T')[0];
      setExpectedCloseDate(dateStr);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch deal details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/deals/${id}`, {
        value: parseFloat(value),
        stage,
        expectedCloseDate,
      });
      setDeal(response.data);
      alert('Deal updated successfully!');
      if (stage === 'Won') {
        alert('Deal marked as Won. The associated Lead has been converted to a Customer!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update deal.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this deal from the pipeline?')) {
      try {
        await api.delete(`/deals/${id}`);
        navigate('/deals');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete deal.');
      }
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (error) return <div className="text-center py-12 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>;
  if (!deal) return <div className="text-center py-12 text-slate-500">Deal details not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/deals"
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">Deal Details</h2>
          <p className="text-xs text-slate-400">Manage pipeline stage parameters and contract metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Update Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Deal properties
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Deal Value */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Contract Value ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deal Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Qualified">Qualified</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Expected Close */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Expected Close Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-600 rounded-xl border border-rose-500/10 hover:border-transparent transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Remove Deal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                Update Parameters
              </button>
            </div>
          </form>
        </div>

        {/* Lead Context sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            Lead Reference
          </h3>

          {deal.lead ? (
            <div className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Contact Person</p>
                <Link to={`/leads/${deal.lead._id}`} className="text-sm font-bold text-white hover:text-indigo-400 flex items-center gap-1 mt-0.5">
                  <User className="w-4 h-4 text-slate-400" />
                  {deal.lead.name}
                </Link>
              </div>

              {/* Company */}
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Company Name</p>
                <p className="text-sm text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                  <Building className="w-4 h-4 text-slate-400" />
                  {deal.lead.company}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Email Address</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium truncate">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {deal.lead.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Phone Connection</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {deal.lead.phone}
                </p>
              </div>

              {/* Assignee */}
              <div className="pt-2 border-t border-slate-800/80">
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Lead Assigned To</p>
                <div className="text-slate-300 font-semibold bg-slate-950/40 p-2 rounded-lg border border-slate-850 truncate">
                  {deal.lead.assignedTo ? deal.lead.assignedTo.name : 'Unassigned'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-400 italic">Associated lead details have been deleted.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default DealDetails;
