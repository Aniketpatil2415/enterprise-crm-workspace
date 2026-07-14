import { useState } from 'react';
import { X, Building2, Briefcase, Globe, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyAdded: () => void;
}

export default function AddCompanyModal({ isOpen, onClose, onCompanyAdded }: AddCompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    address: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      // 🔥 STRICT FIX: Explicitly targeting /companies API
      const response = await axios.post(
        `${API_URL}/companies`,
        formData,
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        toast.success('Enterprise Client added successfully!');
        setFormData({ name: '', industry: '', website: '', address: '' });
        onCompanyAdded();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to add company', error);
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
            <Building2 className="w-5 h-5 text-brand-400" />
            Add New Company
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
              placeholder="e.g. Google India"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
              placeholder="e.g. Technology, Finance"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 resize-none custom-scrollbar"
              placeholder="Office Location..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 rounded-lg mt-6 transition-colors flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Company'}
          </button>
        </form>
      </div>
    </div>
  );
}