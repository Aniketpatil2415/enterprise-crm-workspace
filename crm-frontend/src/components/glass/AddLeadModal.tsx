import { useState } from 'react';
import { X, Loader2, User, Mail, Phone, Target } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Triggered to refresh the leads list after adding
}

export default function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'NEW',
    source: 'MANUAL',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName) {
      toast.error('First name is required to create a lead.');
      return;
    }

    try {
      setLoading(true);
      // Ensure we have the secure Firebase UID to pass the backend Bouncer (requireAuth)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('Authentication error. Please log in again.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/leads',
        formData,
        {
          headers: {
            'x-user-id': currentUser.uid, // The crucial security token
          },
        }
      );

      toast.success('Lead added successfully!');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', status: 'NEW', source: 'MANUAL' });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to add lead.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Blur Overlay */}
      <div 
        className="absolute inset-0 bg-brand-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Glassmorphism Modal Panel */}
      <div className="glass-panel w-full max-w-md relative z-10 p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-400" />
            Add New Lead
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-brand-800/50 hover:bg-brand-500/50 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">First Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text"
                  placeholder="John"
                  disabled={loading}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Doe"
                disabled={loading}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="john@company.com"
                disabled={loading}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-500" />
              </div>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="text"
                placeholder="+91 98765 43210"
                disabled={loading}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Pipeline Stage</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-brand-900/80 border border-glass-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-400 transition-colors appearance-none"
            >
              <option value="NEW">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}