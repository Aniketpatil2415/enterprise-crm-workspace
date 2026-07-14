import { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnalyticsOverview from '../components/glass/AnalyticsOverview';
import { 
  LogOut, 
  Search, 
  Bell, 
  LayoutDashboard, 
  KanbanSquare, 
  List, 
  Settings,
  Plus,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import KanbanBoard from '../components/glass/KanbanBoard';
import AddLeadModal from '../components/glass/AddLeadModal';
import LeadDetailsDrawer from '../components/glass/LeadDetailsDrawer';
import type { Lead } from '../components/glass/KanbanBoard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'table' | 'settings'>('pipeline');
  
  // Drawer State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      const response = await axios.get(`${API_URL}/leads`, {
        headers: { 'x-user-id': currentUser.uid }
      });
      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to connect to database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Filter leads based on Search Query
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const lowerQuery = searchQuery.toLowerCase();
    return leads.filter(lead => 
      lead.firstName.toLowerCase().includes(lowerQuery) || 
      (lead.lastName && lead.lastName.toLowerCase().includes(lowerQuery)) ||
      (lead.email && lead.email.toLowerCase().includes(lowerQuery)) ||
      (lead.phone && lead.phone.includes(lowerQuery))
    );
  }, [leads, searchQuery]);

  // Analytics Calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === 'WON').length;
    const lost = leads.filter(l => l.status === 'LOST').length;
    const active = total - won - lost;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { total, won, lost, active, winRate };
  }, [leads]);

  return (
    <div className="flex h-screen bg-brand-900 text-white overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex-col z-30 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-glass-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center font-bold text-brand-900">
            FB
          </div>
          <span className="font-bold text-xl tracking-tight">Fusion Byte</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button onClick={() => setActiveTab('pipeline')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'pipeline' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <KanbanSquare className="w-5 h-5" />
            <span className="font-medium">Pipeline</span>
          </button>
          <button onClick={() => setActiveTab('table')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'table' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <List className="w-5 h-5" />
            <span className="font-medium">Leads Table</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-glass-border mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glass-panel border-t-0 border-l-0 border-r-0 rounded-none flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center bg-brand-900/50 border border-glass-border rounded-lg px-3 py-1.5 w-64 lg:w-96 transition-all focus-within:border-brand-400">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500" 
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end justify-center">
              <span className="text-xs text-gray-400 font-medium tracking-wide">Workspace ID</span>
              <span className="text-sm font-mono text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded border border-brand-400/20 mt-0.5">
                {auth.currentUser?.uid ? `FB-${auth.currentUser.uid.substring(0, 6).toUpperCase()}` : 'Connecting...'}
              </span>
            </div>

            <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
              <Bell className="w-5 h-5" />
              {leads.filter(l => l.status === 'NEW').length > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
              )}
            </button>
            
            <div className="flex items-center gap-3 border-l border-glass-border pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">Admin</p>
                <p className="text-xs text-brand-400 leading-tight">Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-brand-900 font-bold text-lg shadow-lg shadow-brand-400/20">
                {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Header Action Bar */}
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white capitalize">{activeTab}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === 'pipeline' && 'Drag and drop leads to update their current stage.'}
                {activeTab === 'overview' && 'High-level business analytics and lead conversion metrics.'}
                {activeTab === 'table' && 'Detailed list view of all CRM records.'}
                {activeTab === 'settings' && 'Manage your enterprise workspace preferences.'}
              </p>
            </div>
            {activeTab !== 'settings' && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-brand-400 hover:bg-white text-brand-900 px-4 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-brand-400/20"
              >
                <Plus className="w-5 h-5" />
                Add New Lead
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* TAB 1: PIPELINE (Kanban) */}
              {activeTab === 'pipeline' && (
                <div className="h-[calc(100vh-220px)]">
                  <KanbanBoard leads={filteredLeads} setLeads={setLeads} />
                </div>
              )}

              {/* TAB 2: OVERVIEW (Analytics) */}
{activeTab === 'overview' && (
  <AnalyticsOverview leads={filteredLeads} />
)}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 border border-glass-border rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Total Leads</h3>
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-4xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="glass-panel p-6 border border-glass-border rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Active Pipeline</h3>
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-4xl font-bold text-white">{stats.active}</p>
                    </div>
                    <div className="glass-panel p-6 border border-glass-border rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Closed Won</h3>
                        <Target className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-4xl font-bold text-emerald-400">{stats.won}</p>
                    </div>
                    <div className="glass-panel p-6 border border-glass-border rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Win Rate</h3>
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                      </div>
                      <p className="text-4xl font-bold text-white">{stats.winRate}%</p>
                    </div>
                  </div>
                  
                  {/* Premium CSS Chart Representation */}
                  <div className="glass-panel p-6 border border-glass-border rounded-xl h-80 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Pipeline Health Distribution</h3>
                    <div className="flex-1 flex items-end gap-4 pb-4">
                      {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'].map(status => {
                        const count = leads.filter(l => l.status === status).length;
                        const height = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                          <div key={status} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                            <span className="text-xs font-bold text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                            <div 
                              className="w-full bg-brand-500/80 rounded-t-md hover:bg-brand-400 transition-all duration-500 relative overflow-hidden" 
                              style={{ height: `${Math.max(height, 2)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold tracking-wider text-center">{status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEADS TABLE */}
              {activeTab === 'table' && (
                <div className="glass-panel border border-glass-border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-900/80 border-b border-glass-border text-xs uppercase tracking-wider text-gray-400">
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Contact</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Date Added</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border/50">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <p className="font-bold text-white">{lead.firstName} {lead.lastName || ''}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-300">{lead.email || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{lead.phone || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-brand-500/10 text-brand-400 text-xs rounded border border-brand-500/20 font-bold">{lead.status}</span>
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsDrawerOpen(true);
                              }}
                              className="text-brand-400 hover:text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">No leads found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                  <div className="glass-panel p-6 border border-glass-border rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-glass-border pb-4">Workspace Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Dark Mode Enforced</p>
                          <p className="text-sm text-gray-400">Fusion Byte premium theme is locked.</p>
                        </div>
                        <div className="w-10 h-6 bg-brand-400 rounded-full relative cursor-not-allowed opacity-80">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-brand-900 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-glass-border/50">
                        <div>
                          <p className="text-white font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-400">Alerts for new leads and stage changes.</p>
                        </div>
                        <div className="w-10 h-6 bg-brand-800 rounded-full relative cursor-pointer hover:bg-brand-700 transition-colors">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-6 border border-red-500/20 rounded-xl bg-red-500/5">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-400 mb-4">Archived leads can be viewed in the database, but deleting the workspace is permanent.</p>
                    <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors font-semibold text-sm">
                      Request Workspace Deletion
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onLeadAdded={fetchLeads} 
      />

      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setTimeout(() => setSelectedLead(null), 300); // Wait for exit animation
        }}
        onLeadDeleted={(deletedId) => {
          setLeads(prev => prev.filter(l => l.id !== deletedId));
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}