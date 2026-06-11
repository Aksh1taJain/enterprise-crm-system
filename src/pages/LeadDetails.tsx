import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  PlusCircle, 
  MessageSquare, 
  Calendar,
  Building,
  Mail,
  Phone,
  Tag,
  User,
  Activity as ActivityIcon,
  Briefcase
} from 'lucide-react';

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
    email: string;
  } | null;
  createdAt: string;
}

interface Activity {
  _id: string;
  type: string;
  notes: string;
  user: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface UserSummary {
  _id: string;
  name: string;
}

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [representatives, setRepresentatives] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Log activity form states
  const [actType, setActType] = useState('Call');
  const [actNotes, setActNotes] = useState('');
  const [logError, setLogError] = useState('');
  const [logging, setLogging] = useState(false);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const [leadRes, actRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/activities?lead=${id}`),
      ]);
      
      const leadData = leadRes.data;
      setLead(leadData);
      setActivities(actRes.data);

      // Initialize form values
      setName(leadData.name);
      setEmail(leadData.email);
      setPhone(leadData.phone);
      setCompany(leadData.company);
      setSource(leadData.source);
      setStatus(leadData.status);
      setAssignedTo(leadData.assignedTo?._id || '');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch lead profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();

    if (isAdmin) {
      const fetchReps = async () => {
        try {
          const response = await api.get('/users');
          setRepresentatives(response.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchReps();
    }
  }, [id, isAdmin]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name, email, phone, company, source, status };
      if (isAdmin) {
        payload.assignedTo = assignedTo || null;
      }
      
      const response = await api.put(`/leads/${id}`, payload);
      setLead(response.data);
      alert('Lead details updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update lead details.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this lead? All associated records will remain in database.')) {
      try {
        await api.delete(`/leads/${id}`);
        navigate('/leads');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete lead.');
      }
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actNotes.trim()) {
      setLogError('Notes cannot be blank');
      return;
    }

    setLogError('');
    setLogging(true);
    try {
      const response = await api.post('/activities', {
        lead: id,
        type: actType,
        notes: actNotes,
      });

      setActivities([response.data, ...activities]);
      setActNotes('');
      setActType('Call');
    } catch (err: any) {
      setLogError(err.response?.data?.message || 'Failed to log activity.');
    } finally {
      setLogging(false);
    }
  };

  const handleConvertToCustomer = async () => {
    try {
      await api.post('/customers/convert', { leadId: id });
      alert('Lead successfully converted to Customer!');
      fetchLeadData(); // refresh status to 'Won'
    } catch (err: any) {
      alert(err.response?.data?.message || 'Conversion failed.');
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (error) return <div className="text-center py-12 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>;
  if (!lead) return <div className="text-center py-12 text-slate-500">Lead profile not found.</div>;

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/leads"
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white">{lead.name}</h2>
            <p className="text-xs text-indigo-400 font-semibold">{lead.company}</p>
          </div>
        </div>

        {/* Lead conversion option */}
        {lead.status !== 'Won' ? (
          <button
            onClick={handleConvertToCustomer}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Briefcase className="w-4 h-4" />
            Convert to Customer
          </button>
        ) : (
          <span className="px-4 py-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            Converted Customer
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Lead Properties Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-md font-bold text-white border-b border-slate-800 pb-3">Lead Properties</h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Lead Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Reach">Cold Reach</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {isAdmin && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assigned Representative</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Leave Unassigned</option>
                    {representatives.map((rep) => (
                      <option key={rep._id} value={rep._id}>
                        {rep.name} ({rep._id === user?._id ? 'You' : 'Rep'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-600 rounded-xl transition-all border border-rose-500/10 hover:border-transparent"
              >
                <Trash2 className="w-4 h-4" />
                Delete Lead
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                Update Lead
              </button>
            </div>
          </form>
        </div>

        {/* Quick Details Sidebar Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Representative info</h4>
            {lead.assignedTo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
                    {lead.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{lead.assignedTo.name}</p>
                    <p className="text-xs text-slate-400 truncate">{lead.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">This lead is unassigned. Admin assignment required to log sales reps.</p>
            )}
          </div>

          {/* Add Activity Form console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Log Interaction</h4>
            {logError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg p-2.5 text-center">
                {logError}
              </div>
            )}
            <form onSubmit={handleLogActivity} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Type</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Demo">Demo</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Notes</label>
                <textarea
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes about discussion..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={logging}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                <PlusCircle className="w-4 h-4" />
                {logging ? 'Logging...' : 'Log Activity'}
              </button>
            </form>
          </div>
        </div>

        {/* Lead Activity Timeline Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ActivityIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-md font-bold text-white">Interaction History Timeline</h3>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center italic">No interactions logged yet for this lead. Log a call or email above.</p>
          ) : (
            <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5">
              {activities.map((act) => (
                <div key={act._id} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-900 shadow-md ring-4 ring-indigo-500/10" />

                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 rounded-md uppercase">
                          {act.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          Logged by {act.user.name} ({act.user.role})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{act.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LeadDetails;
