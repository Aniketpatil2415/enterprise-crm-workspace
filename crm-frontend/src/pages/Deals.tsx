import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';
import { Target, Plus, Loader2, Building2, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import AddDealModal from '../components/glass/AddDealModal';

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  expectedCloseDate: string | null;
  company: { name: string } | null;
  contact: { firstName: string, lastName: string | null } | null;
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      const res = await axios.get(`${API_URL}/deals`, {
        headers: { 'x-user-id': currentUser?.uid }
      });
      setDeals(res.data.data);
    } catch (e) {
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'DISCOVERY': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'PROPOSAL': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'NEGOTIATION': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CLOSED_WON': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLOSED_LOST': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-8 h-full max-w-7xl mx-auto w-full fade-in flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Target className="w-6 h-6 text-brand-400" /> Revenue Pipeline
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track and manage high-value enterprise contracts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-400/20"
        >
          <Plus className="w-5 h-5" /> New Deal
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-brand-400 w-8 h-8" /> 
        </div>
      ) : (
        <div className="glass-panel border border-glass-border rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left text-white border-collapse">
              <thead>
                <tr className="bg-brand-900/80 border-b border-glass-border text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Deal Title</th>
                  <th className="p-5 font-semibold">Client / Contact</th>
                  <th className="p-5 font-semibold">Value</th>
                  <th className="p-5 font-semibold">Stage</th>
                  <th className="p-5 font-semibold">Target Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/50 text-sm">
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No revenue deals active. Click 'New Deal' to initialize your pipeline.
                    </td>
                  </tr>
                ) : (
                  deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5 font-bold text-base">{deal.title}</td>
                      <td className="p-5">
                        <div className="space-y-1">
                          {deal.company ? (
                            <span className="flex items-center gap-1.5 text-gray-300">
                              <Building2 className="w-3.5 h-3.5 text-gray-500" /> {deal.company.name}
                            </span>
                          ) : (
                            <span className="text-gray-600 italic text-xs">No Company</span>
                          )}
                          {deal.contact && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                              <User className="w-3 h-3 text-brand-400" /> {deal.contact.firstName} {deal.contact.lastName || ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 text-emerald-400 font-mono font-semibold tracking-wide">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-md text-xs border font-bold tracking-wide ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-5 text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'TBD'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddDealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDealAdded={fetchDeals} 
      />
    </div>
  );
}