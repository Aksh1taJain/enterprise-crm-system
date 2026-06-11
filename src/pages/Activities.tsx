import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  Activity as ActivityIcon, 
  Calendar, 
  User, 
  Briefcase, 
  Building,
  Filter 
} from 'lucide-react';

interface Activity {
  _id: string;
  type: string;
  notes: string;
  lead: {
    _id: string;
    name: string;
    company: string;
  } | null;
  user: {
    name: string;
    role: string;
  };
  createdAt: string;
}

export const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter) params.type = typeFilter;

      const response = await api.get('/activities', { params });
      setActivities(response.data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'Call':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Email':
        return 'bg-amber-500/10 text-amber-440 border border-amber-500/20';
      case 'Meeting':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Follow-up':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'Demo':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Chronological history log of all CRM notes, meetings, and interactions</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none pr-8"
          >
            <option value="">All Interaction Types</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Meeting">Meeting</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Demo">Demo</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <Spinner size="lg" />
      ) : activities.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <ActivityIcon className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
          <h5 className="font-bold text-white text-lg">No activities logged</h5>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Interactions logged inside specific Lead Details profiles will display on this global timeline.</p>
        </div>
      ) : (
        <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
          {activities.map((act) => (
            <div key={act._id} className="relative">
              {/* Dot */}
              <span className="absolute -left-[31px] top-2.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-950 shadow-md ring-4 ring-indigo-500/10" />

              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${getActivityTypeColor(act.type)}`}>
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

                <p className="text-xs text-slate-300 font-normal leading-relaxed">{act.notes}</p>

                {act.lead ? (
                  <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                    <div className="flex items-center gap-2 text-xs">
                      <Building className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-white">{act.lead.company}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-400 font-medium">{act.lead.name}</span>
                    </div>
                    <Link
                      to={`/leads/${act.lead._id}`}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5"
                    >
                      View Lead Profile &rarr;
                    </Link>
                  </div>
                ) : (
                  <span className="text-[10px] text-rose-400 italic">Associated Lead has been removed.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Activities;
