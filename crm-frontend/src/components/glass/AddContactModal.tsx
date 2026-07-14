import { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Phone, Building2, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

interface CompanyOption {
  id: string;
  name: string;
}

export default function AddContactModal({ isOpen, onClose, onContactAdded }: AddContactModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    companyId: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch existing companies to populate the dropdown
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const response = await axios.get(`${API_URL}/companies`, {
        headers: { 'x-user-id': currentUser.uid }
      });
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load companies for dropdown', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.post(
        `${API_URL}/contacts`,
        formData,
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        toast.success('Contact added and linked successfully!');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', title: '', companyId: '' });
        onContactAdded();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to add contact', error);
      toast.error(error.response?.data?.message || 'Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-brand-900 border border-glass-border rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-glass-border bg-brand-800/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-400" />
            Add New Contact
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Link to Company
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
            >
              <option value="" className="bg-brand-900">-- Select Company (Optional) --</option>
              {companies.map(company => (
                <option key={company.id} value={company.id} className="bg-brand-900">
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
              placeholder="e.g. CTO, Marketing Head"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 rounded-lg mt-6 transition-colors shadow-lg hover:shadow-brand-400/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Contact'}
          </button>
        </form>
      </div>
    </div>
  );
}