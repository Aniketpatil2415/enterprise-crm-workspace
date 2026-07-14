import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Shield, Mail, Calendar, Loader2, UserCog, Users, UserPlus } from 'lucide-react';
import InviteModal from '../components/glass/InviteModal';

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
}

export default function Settings() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Role Access & Modal State
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const response = await axios.get(`${API_URL}/team`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        const fetchedTeam = response.data.data;
        setTeam(fetchedTeam);
        
        // Find the current user's role from the fetched list
        const me = fetchedTeam.find((member: TeamMember) => member.email === currentUser.email);
        if (me) setCurrentUserRole(me.role);
      }
    } catch (error) {
      console.error('Failed to load team:', error);
      toast.error('Failed to load workspace settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setUpdatingId(memberId);
      const currentUser = auth.currentUser;
      
      const response = await axios.patch(`${API_URL}/team/${memberId}/role`, 
        { newRole },
        { headers: { 'x-user-id': currentUser?.uid } }
      );

      if (response.data.success) {
        setTeam(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole as any } : m));
        toast.success('Team member role updated.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role.');
      fetchTeam(); // Revert UI on failure
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ADMIN': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const canEditRoles = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="p-8 h-full max-w-7xl mx-auto w-full fade-in flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <SettingsIcon className="w-6 h-6 text-brand-400" /> Workspace Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your enterprise environment and team access.</p>
        </div>
        
        {/* The Invite Button */}
        {canEditRoles && (
          <button 
            onClick={() => setIsInviteModalOpen(true)} 
            className="bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-brand-400/20"
          >
            <UserPlus className="w-5 h-5" /> Invite Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 overflow-hidden">
        
        {/* Settings Navigation (Sidebar within Settings) */}
        <div className="col-span-1 glass-panel border border-glass-border rounded-xl p-4 h-fit">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-sm transition-all font-bold">
              <Users className="w-5 h-5" /> Team & Access
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-not-allowed opacity-50">
              <Shield className="w-5 h-5" /> Security (Coming Soon)
            </button>
          </nav>
        </div>

        {/* Main Settings Content */}
        <div className="col-span-1 lg:col-span-3 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center glass-panel border border-glass-border rounded-xl">
              <Loader2 className="animate-spin text-brand-400 w-8 h-8" />
            </div>
          ) : (
            <div className="glass-panel border border-glass-border rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="p-6 border-b border-glass-border bg-brand-800/30">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-brand-400" /> Directory & Roles
                </h2>
                <p className="text-xs text-gray-400 mt-1">Only Owners and Admins can modify team privileges.</p>
              </div>

              <div className="overflow-auto custom-scrollbar">
                <table className="w-full text-left text-white border-collapse">
                  <thead>
                    <tr className="bg-brand-900/50 border-b border-glass-border text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-5 font-semibold">User</th>
                      <th className="p-5 font-semibold">Joined Date</th>
                      <th className="p-5 font-semibold text-right">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/50 text-sm">
                    {team.map(member => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5">
                          <p className="font-bold text-base">{member.fullName}</p>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                            <Mail className="w-3.5 h-3.5" /> {member.email}
                          </div>
                        </td>
                        <td className="p-5 text-gray-400 flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {updatingId === member.id && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
                            
                            {/* Role Selection Logic */}
                            {canEditRoles && member.role !== 'OWNER' ? (
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                disabled={updatingId === member.id}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide outline-none cursor-pointer appearance-none ${getRoleBadge(member.role)} hover:brightness-110 transition-all`}
                              >
                                <option value="ADMIN" className="bg-brand-900 text-emerald-400">ADMIN</option>
                                <option value="MEMBER" className="bg-brand-900 text-gray-300">MEMBER</option>
                              </select>
                            ) : (
                              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide ${getRoleBadge(member.role)}`}>
                                {member.role}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Render the Invite Modal */}
      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
}