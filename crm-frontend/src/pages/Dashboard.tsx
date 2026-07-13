import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  LayoutDashboard, Settings, LogOut, Bell, Search,
  KanbanSquare, Plus, Loader2, Phone, Mail, Calendar, List
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddLeadModal from '../components/glass/AddLeadModal';
import KanbanBoard from '../components/glass/KanbanBoard'; // 🔥 Kanban Board Import

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [userInit, setUserInit] = useState(false);
  
  // 🔥 New State for View Toggle
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const response = await axios.get('http://localhost:5000/api/leads', {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads.');
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserInit(true);
      if (user) {
        fetchLeads();
      } else {
        setLeads([]);
        setLoadingLeads(false);
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const totalLeads = leads.length;
  const contactedLeads = leads.filter(lead => lead.status === 'CONTACTED').length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'QUALIFIED').length;

  return (
    <div className="min-h-screen flex bg-brand-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px]"></div>
      </div>

      <aside className="w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none relative z-10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-glass-border">
          <div className="w-8 h-8 rounded-lg bg-brand-800 border border-brand-500/50 flex items-center justify-center mr-3">
            <LayoutDashboard className="w-4 h-4 text-brand-400" />
          </div>
          <span className="font-bold text-lg tracking-wide">Fusion Byte</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-brand-400/10 text-brand-400 rounded-lg border border-brand-400/20 transition-all">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Overview</span>
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${viewMode === 'kanban' ? 'text-white bg-glass-light' : 'text-gray-400 hover:text-white hover:bg-glass-light'}`}
          >
            <KanbanSquare className="w-5 h-5 mr-3" />
            <span className="font-medium">Pipeline</span>
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${viewMode === 'table' ? 'text-white bg-glass-light' : 'text-gray-400 hover:text-white hover:bg-glass-light'}`}
          >
            <List className="w-5 h-5 mr-3" />
            <span className="font-medium">Leads Table</span>
          </button>
          <button className="w-full flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-glass-light rounded-lg transition-all">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-glass-border">
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <header className="h-16 glass-panel border-t-0 border-l-0 border-r-0 rounded-none flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center bg-brand-900/50 border border-glass-border rounded-lg px-3 py-1.5 w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search leads..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500" />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-400 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-brand-500 flex items-center justify-center text-brand-900 font-bold text-sm">
              FB
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Enterprise Operations</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time pipeline monitoring and resource status.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Toggle Switch */}
              <div className="flex bg-brand-900/50 border border-glass-border rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-brand-500/30 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-brand-500/30 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  title="Pipeline View"
                >
                  <KanbanSquare className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-brand-400 hover:bg-white text-brand-900 font-bold py-2.5 px-5 rounded-lg transition-all duration-300 shadow-lg shadow-brand-400/10"
              >
                <Plus className="w-4 h-4" />
                Add New Lead
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="glass-panel p-6">
              <p className="text-gray-400 text-sm font-medium mb-1">Total Active Leads</p>
              <h3 className="text-3xl font-bold text-white transition-all">{totalLeads}</h3>
            </div>
            <div className="glass-panel p-6">
              <p className="text-gray-400 text-sm font-medium mb-1">Leads Contacted</p>
              <h3 className="text-3xl font-bold text-brand-400 transition-all">{contactedLeads}</h3>
            </div>
            <div className="glass-panel p-6">
              <p className="text-gray-400 text-sm font-medium mb-1">Qualified Opportunities</p>
              <h3 className="text-3xl font-bold text-white transition-all">{qualifiedLeads}</h3>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            {loadingLeads && !userInit ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            ) : leads.length > 0 ? (
              
              /* 🔥 Conditional Rendering: Table OR Kanban */
              viewMode === 'table' ? (
                <div className="glass-panel overflow-hidden border border-glass-border shadow-xl h-full flex flex-col">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-glass-border bg-brand-800/40 text-xs font-semibold uppercase tracking-wider text-gray-400 sticky top-0 z-10 backdrop-blur-sm">
                          <th className="px-6 py-4 font-bold">Name</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Pipeline Stage</th>
                          <th className="px-6 py-4 font-bold">Source</th>
                          <th className="px-6 py-4 font-bold">Created On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass-border/40 text-sm text-gray-200">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-glass-light/50 transition-colors duration-150">
                            <td className="px-6 py-4 font-semibold text-white">
                              {lead.firstName} {lead.lastName || ''}
                            </td>
                            <td className="px-6 py-4 space-y-1">
                              {lead.email && (
                                <div className="flex items-center text-xs text-gray-300">
                                  <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                  {lead.email}
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center text-xs text-gray-300">
                                  <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                  {lead.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                                lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                lead.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">{lead.source}</td>
                            <td className="px-6 py-4 text-xs text-gray-400 flex items-center mt-1">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-full absolute inset-0">
                  <KanbanBoard leads={leads} setLeads={setLeads} onLeadsUpdated={fetchLeads} />
                </div>
              )
            ) : (
              <div className="glass-panel p-8 flex flex-col items-center justify-center h-64 border-dashed border-2 border-brand-500/30 transition-all">
                <KanbanSquare className="w-12 h-12 text-gray-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold text-gray-300">Your Pipeline is Empty</h2>
                <p className="text-gray-500 text-sm mt-2">Start adding leads to see them structured on the board.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchLeads} 
      />
    </div>
  );
}