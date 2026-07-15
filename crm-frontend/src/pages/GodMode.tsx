import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { ShieldAlert, Database, Users, Building2, Activity, Power, Eye, Loader2, X } from 'lucide-react';

interface PlatformStats {
  metrics: { totalWorkspaces: number; totalUsers: number; totalLeads: number };
  workspaces: any[];
}

export default function GodMode() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deepDiveData, setDeepDiveData] = useState<any | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchGodModeData();
  }, []);

  const fetchGodModeData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return navigate('/');

      const response = await axios.get(`${API_URL}/admin/platform-stats`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      // 🔥 MILITARY SECURITY TRIGGER: If not admin, kick them out immediately
      if (error.response?.status === 403) {
        toast.error('CLASSIFIED: Unauthorized Access Detected. Logging event.');
        navigate('/dashboard');
      } else {
        toast.error('Failed to connect to God Mode engine.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (workspaceId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'SUSPEND' : 'ACTIVATE';
    if (!window.confirm(`Are you sure you want to ${action} this workspace?`)) return;

    try {
      const currentUser = auth.currentUser;
      await axios.patch(`${API_URL}/admin/workspace/${workspaceId}/status`, 
        { isActive: !currentStatus },
        { headers: { 'x-user-id': currentUser?.uid } }
      );
      toast.success(`Workspace ${action}D successfully.`);
      fetchGodModeData(); // Refresh list
    } catch (error) {
      toast.error('Failed to change workspace status.');
    }
  };

  const fetchDeepDive = async (workspaceId: string) => {
    try {
      setIsDeepDiveLoading(true);
      const currentUser = auth.currentUser;
      const response = await axios.get(`${API_URL}/admin/workspace/${workspaceId}/deep-dive`, {
        headers: { 'x-user-id': currentUser?.uid }
      });

      if (response.data.success) {
        setDeepDiveData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to extract deep dive data.');
    } finally {
      setIsDeepDiveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
        <p className="text-red-500 font-mono tracking-widest text-sm uppercase">Authenticating Super Admin...</p>
      </div>
    );
  }

  return (
    <div className="p-8 h-full max-w-7xl mx-auto w-full fade-in flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0 border-b border-red-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <ShieldAlert className="w-8 h-8 text-red-500" /> GOD MODE: COMMAND CENTER
          </h1>
          <p className="text-red-400/70 text-sm mt-1 font-mono uppercase tracking-wider">Absolute Platform Control & Telemetry</p>
        </div>
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          <span className="text-red-400 font-bold text-xs uppercase tracking-widest">Live Monitoring</span>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="glass-panel p-6 border border-red-500/20 rounded-xl bg-black/50">
          <div className="flex items-center gap-4 mb-2">
            <Building2 className="w-6 h-6 text-red-400" />
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Total Tenants</h3>
          </div>
          <p className="text-4xl font-black text-white">{stats?.metrics.totalWorkspaces}</p>
        </div>
        <div className="glass-panel p-6 border border-red-500/20 rounded-xl bg-black/50">
          <div className="flex items-center gap-4 mb-2">
            <Users className="w-6 h-6 text-red-400" />
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Total Users</h3>
          </div>
          <p className="text-4xl font-black text-white">{stats?.metrics.totalUsers}</p>
        </div>
        <div className="glass-panel p-6 border border-red-500/20 rounded-xl bg-black/50">
          <div className="flex items-center gap-4 mb-2">
            <Database className="w-6 h-6 text-red-400" />
            <h3 className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Global Leads</h3>
          </div>
          <p className="text-4xl font-black text-white">{stats?.metrics.totalLeads}</p>
        </div>
      </div>

      {/* Workspace Directory Table */}
      <div className="glass-panel border border-red-500/20 rounded-xl overflow-hidden flex-1 flex flex-col bg-black/40">
        <div className="p-5 border-b border-red-500/20 bg-red-950/20">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400" /> Active Infrastructure
          </h3>
        </div>
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left text-white border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-red-500/10 text-xs uppercase text-gray-400 font-mono tracking-wider">
                <th className="p-4">Workspace / Owner</th>
                <th className="p-4">Resources Used</th>
                <th className="p-4">Created On</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/10 text-sm">
              {stats?.workspaces.map(ws => (
                <tr key={ws.id} className="hover:bg-red-500/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-base text-white">{ws.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{ws.users[0]?.email || 'No Owner'}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 text-xs font-mono text-gray-400">
                      <span>Users: {ws._count.users}</span>
                      <span>Leads: {ws._count.leads}</span>
                      <span>Deals: {ws._count.deals}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{new Date(ws.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${ws.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {ws.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => fetchDeepDive(ws.id)}
                      className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                      title="Deep Dive (View All Data)"
                    >
                      {isDeepDiveLoading && deepDiveData?.id === ws.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(ws.id, ws.isActive)}
                      className={`p-2 border rounded-lg transition-colors ${ws.isActive ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'}`}
                      title={ws.isActive ? 'Suspend Workspace' : 'Activate Workspace'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* THE DEEP DIVE MODAL */}
      {deepDiveData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 fade-in">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setDeepDiveData(null)}></div>
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-6 border-b border-red-500/20 bg-red-950/20">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-400" /> DEEP DIVE: {deepDiveData.name}
              </h2>
              <button onClick={() => setDeepDiveData(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto custom-scrollbar space-y-6 flex-1">
              {/* Raw JSON Dump for absolute visibility */}
              <div className="bg-black border border-gray-800 rounded-lg p-4">
                 <h3 className="text-red-400 font-mono text-xs uppercase mb-3">Raw Database Extraction</h3>
                 <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                   {JSON.stringify(deepDiveData, null, 2)}
                 </pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}