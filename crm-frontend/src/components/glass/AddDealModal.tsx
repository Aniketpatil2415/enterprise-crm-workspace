import { useState, useEffect } from 'react';
import { X, Target, Building2, Users, DollarSign, Calendar, Loader2, Briefcase } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDealAdded: () => void;
}

const DEAL_STAGES = [
  { id: 'DISCOVERY', title: 'Discovery / Pitch' },
  { id: 'PROPOSAL', title: 'Proposal Sent' },
  { id: 'NEGOTIATION', title: 'Negotiation' },
  { id: 'CLOSED_WON', title: 'Closed Won' },
  { id: 'CLOSED_LOST', title: 'Closed Lost' }
];

export default function AddDealModal({ isOpen, onClose, onDealAdded }: AddDealModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'DISCOVERY',
    companyId: '',
    contactId: '',
    expectedCloseDate: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch relational data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRelationalData();
    }
  }, [isOpen]);

  const fetchRelationalData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const [compRes, contRes] = await Promise.all([
        axios.get(`${API_URL}/companies`, { headers: { 'x-user-id': currentUser.uid } }),
        axios.get(`${API_URL}/contacts`, { headers: { 'x-user-id': currentUser.uid } })
      ]);

      if (compRes.data.success) setCompanies(compRes.data.data);
      if (contRes.data.success) setContacts(contRes.data.data);
    } catch (error) {
      console.error('Failed to load relational data', error);
      toast.error('Failed to load Companies & Contacts.');
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
        `${API_URL}/deals`,
        formData,
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        toast.success('Revenue Deal created successfully!');
        setFormData({ title: '', value: '', stage: 'DISCOVERY', companyId: '', contactId: '', expectedCloseDate: '' });
        onDealAdded();
        onClose();
      }
    } catch (error: any) {
      console.error('Failed to create deal:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-brand-900 border border-glass-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border bg-brand-800/30 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-400" />
            Create Revenue Deal
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto custom-scrollbar p-6">
          <form id="deal-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                Deal Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="e.g. $10k Software Implementation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Deal Value
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="50000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Expected Close
                </label>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
              >
                {DEAL_STAGES.map(stage => (
                  <option key={stage.id} value={stage.id} className="bg-brand-900 text-white">
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-glass-border/50 pt-5 mt-2 space-y-4">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">Relational Web (Linking)</p>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Link to Company
                </label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-900 text-gray-500">-- Select Client Company --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id} className="bg-brand-900 text-white">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Point of Contact
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData({...formData, contactId: e.target.value})}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-900 text-gray-500">-- Select Key Contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id} className="bg-brand-900 text-white">
                      {c.firstName} {c.lastName || ''} {c.company ? `(${c.company.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-glass-border bg-brand-900 shrink-0">
          <button
            type="submit"
            form="deal-form"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3.5 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-400/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Deal'}
          </button>
        </div>

      </div>
    </div>
  );
}