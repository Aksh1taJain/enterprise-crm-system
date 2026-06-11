import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Download, Calendar, Filter } from 'lucide-react';

interface UserSummary {
  _id: string;
  name: string;
}

export const Reports: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [representatives, setRepresentatives] = useState<UserSummary[]>([]);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [dealStage, setDealStage] = useState('');

  useEffect(() => {
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
  }, [isAdmin]);

  // Construct query string based on filters
  const buildQueryParams = (extraParams: any = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (assignedTo) params.append('assignedTo', assignedTo);
    
    Object.keys(extraParams).forEach(key => {
      if (extraParams[key]) params.append(key, extraParams[key]);
    });

    return params.toString();
  };

  const downloadCSV = (endpoint: string, queryStr: string, defaultFilename: string) => {
    const token = localStorage.getItem('leadsphere_token');
    const downloadUrl = `/api/reports/${endpoint}?${queryStr}`;
    
    // To download with authorization header in standard browser flow:
    // We can fetch the raw blob using axios, then trigger a download link in memory!
    // This is secure and supports the Authorization JWT token header!
    api.get(`/reports/${endpoint}?${queryStr}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', defaultFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error('CSV export failed:', error);
        alert('Failed to generate CSV export.');
      });
  };

  const handleExportLeads = () => {
    const query = buildQueryParams({ status: leadStatus });
    downloadCSV('export-leads', query, 'leads_report.csv');
  };

  const handleExportDeals = () => {
    const query = buildQueryParams({ stage: dealStage });
    downloadCSV('export-deals', query, 'deals_report.csv');
  };

  const handleExportCustomers = () => {
    const query = buildQueryParams();
    downloadCSV('export-customers', query, 'customers_report.csv');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div>
        <p className="text-sm text-slate-400 font-medium">Export custom CSV reports filtered by dates, status values, or account owner</p>
      </div>

      {/* Control panel filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
          <Filter className="w-4.5 h-4.5 text-indigo-400" />
          Filter Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          {/* Representative Filter (Admin only) */}
          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assigned Representative</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">All Representatives</option>
                {representatives.map(rep => (
                  <option key={rep._id} value={rep._id}>
                    {rep.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Filter Scope</label>
              <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 rounded-xl py-2 px-3 select-none">
                Exporting My Assigned Data Only
              </div>
            </div>
          )}

          {/* Lead status filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Leads Status Filter</label>
            <select
              value={leadStatus}
              onChange={(e) => setLeadStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Lead Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Deal Stage filter */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Deals Stage Filter</label>
            <select
              value={dealStage}
              onChange={(e) => setDealStage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Deal Stages</option>
              <option value="Qualified">Qualified</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Export Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leads CSV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-md font-bold text-white">Leads Directory Report</h4>
            <p className="text-xs text-slate-400">Export active inquiries, status timelines, and contact email logs.</p>
          </div>
          <button
            onClick={handleExportLeads}
            className="flex items-center justify-center gap-1.5 w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 text-white font-bold py-2 rounded-xl text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Leads CSV
          </button>
        </div>

        {/* Deals CSV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-md font-bold text-white">Sales Pipelines Report</h4>
            <p className="text-xs text-slate-400">Export pipeline values, deal categories, and close expectations.</p>
          </div>
          <button
            onClick={handleExportDeals}
            className="flex items-center justify-center gap-1.5 w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 text-white font-bold py-2 rounded-xl text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Deals CSV
          </button>
        </div>

        {/* Customers CSV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-md font-bold text-white">Accounts Registry Report</h4>
            <p className="text-xs text-slate-400">Export completed contracts, customer contact list, and representative owners.</p>
          </div>
          <button
            onClick={handleExportCustomers}
            className="flex items-center justify-center gap-1.5 w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 text-white font-bold py-2 rounded-xl text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Customers CSV
          </button>
        </div>
      </div>
    </div>
  );
};
export default Reports;
