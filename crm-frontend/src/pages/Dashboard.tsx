import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import KanbanBoard from '../components/glass/KanbanBoard';
import AddLeadModal from '../components/glass/AddLeadModal';
import LeadDetailsDrawer from '../components/glass/LeadDetailsDrawer';
import AnalyticsOverview from '../components/glass/AnalyticsOverview';
import type { Lead } from '../components/glass/KanbanBoard';

export interface DealOverview {
  id: string;
  value: number;
  stage: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<DealOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // 🔥 FIX: Removed 'settings' from the state
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'table'>('overview'); 

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const [leadsRes, dealsRes] = await Promise.all([
        axios.get(`${API_URL}/leads`, { headers: { 'x-user-id': currentUser.uid } }),
        axios.get(`${API_URL}/deals`, { headers: { 'x-user-id': currentUser.uid } })
      ]);

      if (leadsRes.data.success) setLeads(leadsRes.data.data);
      if (dealsRes.data.success) setDeals(dealsRes.data.data);
      
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load analytics engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col fade-in max-w-[1600px] mx-auto w-full">
      <div className="flex items-center gap-2 mb-6 border-b border-glass-border pb-4 overflow-x-auto custom-scrollbar shrink-0">
        {/* 🔥 FIX: Removed 'settings' from the array map */}
        {['overview', 'pipeline', 'table'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2.5 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'table' ? 'Leads Table' : tab}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white capitalize">{activeTab === 'table' ? 'Leads Table' : activeTab}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'pipeline' && 'Drag and drop leads to update their current stage.'}
            {activeTab === 'overview' && 'Deep financial analytics and lead conversion metrics.'}
            {activeTab === 'table' && 'Detailed list view of all CRM records.'}
          </p>
        </div>
        
        {/* 🔥 FIX: Add button is now always visible on Dashboard tabs */}
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-400/20 transition-all">
          <Plus className="w-5 h-5" />
          Add New Lead
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'pipeline' && <KanbanBoard leads={leads} setLeads={setLeads} />}
          
          {activeTab === 'overview' && (
            <div className="overflow-y-auto h-full custom-scrollbar pb-10">
              <AnalyticsOverview leads={leads} deals={deals} />
            </div>
          )}

          {activeTab === 'table' && (
            <div className="glass-panel border border-glass-border rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-900/80 border-b border-glass-border text-xs uppercase text-gray-400">
                      <th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/50">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 font-bold text-white">{lead.firstName} {lead.lastName || ''}</td>
                        <td className="p-4 text-sm text-gray-300">{lead.email || 'N/A'}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-brand-500/10 text-brand-400 text-xs rounded border border-brand-500/20 font-bold">{lead.status}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={() => { setSelectedLead(lead); setIsDrawerOpen(true); }} className="text-brand-400 hover:text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onLeadAdded={fetchDashboardData} />
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setTimeout(() => setSelectedLead(null), 300); }}
        onLeadDeleted={(deletedId) => {
          setLeads(prev => prev.filter(l => l.id !== deletedId));
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}