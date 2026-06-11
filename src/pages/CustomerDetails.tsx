import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase,
  UserCheck
} from 'lucide-react';

interface Customer {
  _id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  lead: string | null;
  assignedTo: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch customer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (error) return <div className="text-center py-12 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">{error}</div>;
  if (!customer) return <div className="text-center py-12 text-slate-500">Customer profile not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customers"
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">{customer.company}</h2>
          <p className="text-xs text-slate-400">Converted customer profile reference card</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Building className="w-4.5 h-4.5 text-indigo-400" />
            Client Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Contact Name */}
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Contact Name</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <User className="w-4 h-4 text-slate-400" />
                {customer.contactName}
              </p>
            </div>

            {/* Company */}
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Company Name</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Building className="w-4 h-4 text-slate-400" />
                {customer.company}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Email Address</p>
              <a href={`mailto:${customer.email}`} className="text-sm text-indigo-400 hover:underline flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-4 h-4 text-indigo-400" />
                {customer.email}
              </a>
            </div>

            {/* Phone */}
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Phone Connection</p>
              <p className="text-sm text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                {customer.phone}
              </p>
            </div>

            {/* Conversion Date */}
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Conversion Date</p>
              <p className="text-sm text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Source Lead Link */}
            {customer.lead && (
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Source Lead Ref</p>
                <Link to={`/leads/${customer.lead}`} className="text-sm text-indigo-400 hover:underline flex items-center gap-1.5 mt-0.5 font-medium">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  View Original Lead
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Ownership Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <UserCheck className="w-4.5 h-4.5 text-slate-400" />
            Account Representative
          </h3>

          {customer.assignedTo ? (
            <div className="space-y-1">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold mb-2">
                {customer.assignedTo.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-bold text-white">{customer.assignedTo.name}</p>
              <p className="text-xs text-slate-400 truncate">{customer.assignedTo.email}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">This account is unassigned.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default CustomerDetails;
