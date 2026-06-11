import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  Users, 
  Handshake, 
  TrendingUp, 
  Coins, 
  ArrowUpRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPIStats {
  totalLeads: number;
  totalCustomers: number;
  activeDeals: number;
  revenueGenerated: number;
}

interface ChartData {
  leadsByMonth: Array<{ _id: string; count: number }>;
  dealStatus: Array<{ _id: string; count: number }>;
  revenueTrend: Array<{ _id: string; revenue: number }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<KPIStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts'),
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (error) return <div className="text-center py-12 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>;

  // Format Helper for Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Line Chart Data: Leads by Month
  const lineChartData = {
    labels: charts?.leadsByMonth.map((d) => d._id) || [],
    datasets: [
      {
        label: 'New Leads',
        data: charts?.leadsByMonth.map((d) => d.count) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#818cf8',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 2. Doughnut Chart Data: Deal Status
  const doughnutChartData = {
    labels: charts?.dealStatus.map((d) => d._id) || [],
    datasets: [
      {
        data: charts?.dealStatus.map((d) => d.count) || [],
        backgroundColor: [
          '#6366f1', // Qualified - Indigo
          '#f59e0b', // Negotiation - Amber
          '#10b981', // Won - Emerald
          '#ef4444', // Lost - Rose
          '#3b82f6', // Proposal - Blue
        ],
        borderWidth: 2,
        borderColor: '#0f172a', // Matches slate-900 card background
      },
    ],
  };

  // 3. Bar Chart Data: Revenue Trend
  const barChartData = {
    labels: charts?.revenueTrend.map((d) => d._id) || [],
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: charts?.revenueTrend.map((d) => d.revenue) || [],
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#34d399',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(71, 85, 105, 0.2)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          boxWidth: 12,
          padding: 15,
          font: { family: 'Inter', size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Leads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</p>
            <h3 className="text-2xl font-black text-white">{stats?.totalLeads}</h3>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% this month
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Converted Customers</p>
            <h3 className="text-2xl font-black text-white">{stats?.totalCustomers}</h3>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +8.3% this month
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Deals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Deals</p>
            <h3 className="text-2xl font-black text-white">{stats?.activeDeals}</h3>
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-0.5 mt-2">
              Pipeline Health: Excellent
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue Generated</p>
            <h3 className="text-2xl font-black text-white">{formatCurrency(stats?.revenueGenerated || 0)}</h3>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +18.9% target
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Trend Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-bold text-white">Lead Acquisition Trend</h4>
              <p className="text-xs text-slate-400">New leads captured over the past 6 months</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 rounded-full">Monthly</span>
          </div>
          <div className="h-72">
            {charts && charts.leadsByMonth.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No acquisition history available.</div>
            )}
          </div>
        </div>

        {/* Deals Stages Doughnut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h4 className="text-md font-bold text-white">Deal Stage Distribution</h4>
          <p className="text-xs text-slate-400">Active deals volume by status category</p>
          <div className="h-72 flex items-center justify-center">
            {charts && charts.dealStatus.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No active deals found.</div>
            )}
          </div>
        </div>

        {/* Revenue Performance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-bold text-white">Revenue Performance (Won Deals)</h4>
              <p className="text-xs text-slate-400">Historic sales revenue booked from successfully closed contracts</p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full">Monthly</span>
          </div>
          <div className="h-80">
            {charts && charts.revenueTrend.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No closed contract revenue recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
