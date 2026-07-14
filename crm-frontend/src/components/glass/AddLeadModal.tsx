import { useState } from 'react';
import { X, User, Mail, Phone, Loader2, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void; // 🔥 THE FIX: Now it properly accepts the refresh trigger
}

const PIPELINE_STAGES = [
  { id: 'NEW', title: 'New Lead' },
  { id: 'CONTACTED', title: 'Contacted' },
  { id: 'QUALIFIED', title: 'Qualified' },
  { id: 'PROPOSAL', title: 'Proposal Sent' },
  { id: 'WON', title: 'Closed Won' },
  { id: 'LOST', title: 'Closed Lost' }
];

export default function AddLeadModal({ isOpen, onClose, onLeadAdded }: AddLeadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'NEW'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.post(
        `${API_URL}/leads`,
        formData,
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        toast.success('Lead added successfully!');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', status: 'NEW' }); // Reset form
        onLeadAdded(); // 🔥 Triggers dashboard refresh instantly
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to add lead:', error);
      toast.error(error.response?.data?.message || 'Failed to add lead. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-brand-900 border border-glass-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-glass-border bg-brand-800/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            Add New Lead
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
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
                placeholder="John"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Pipeline Stage
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer custom-scrollbar"
            >
              {PIPELINE_STAGES.map(stage => (
                <option key={stage.id} value={stage.id} className="bg-brand-900 text-white">
                  {stage.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 rounded-lg mt-6 transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}