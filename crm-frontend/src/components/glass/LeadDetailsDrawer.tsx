import { X, Mail, Phone, User, Trash2, Clock, Briefcase } from 'lucide-react';
import type { Lead } from './KanbanBoard';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadDeleted: (leadId: string) => void; // To update UI after soft delete
}

export default function LeadDetailsDrawer({ lead, isOpen, onClose, onLeadDeleted }: LeadDetailsDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!isOpen || !lead) return null;

  const handleSoftDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to archive ${lead.firstName}? This action can be undone later by an admin.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.delete(`${API_URL}/leads/${lead.id}`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Lead archived successfully.');
        onLeadDeleted(lead.id); // Remove from local state
        onClose(); // Close the drawer
      }
    } catch (error: any) {
      console.error('Delete Error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CONTACTED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    QUALIFIED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    PROPOSAL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    WON: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    LOST: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <>
      {/* Background Overlay for Glass Effect */}
      <div 
        className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* The Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-brand-900/95 border-l border-glass-border shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            Lead Profile
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Main Info Card */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {lead.firstName} {lead.lastName || ''}
              </h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {lead.status}
              </span>
            </div>

            <div className="bg-brand-800/50 rounded-xl p-4 border border-glass-border space-y-4">
              {lead.email && (
                <div className="flex items-center text-sm text-gray-300">
                  <Mail className="w-4 h-4 mr-3 text-brand-400" />
                  <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors">{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center text-sm text-gray-300">
                  <Phone className="w-4 h-4 mr-3 text-brand-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-white transition-colors">{lead.phone}</a>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-400 border-t border-glass-border/50 pt-4 mt-2">
                <Clock className="w-4 h-4 mr-3" />
                Added: {new Date(lead.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Activity Placeholder (Phase 9) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Recent Activity
            </h3>
            <div className="bg-brand-800/30 rounded-xl p-6 border border-dashed border-glass-border text-center">
              <p className="text-sm text-gray-500">Activity tracking and notes will be available in the upcoming analytics module.</p>
            </div>
          </div>

        </div>

        {/* Footer / Danger Zone */}
        <div className="p-6 border-t border-glass-border bg-brand-900">
          <button 
            onClick={handleSoftDelete}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all font-semibold"
          >
            {isDeleting ? (
              <span className="animate-pulse">Archiving Lead...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Archive Lead
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Archived leads can be restored from the settings menu.
          </p>
        </div>

      </div>
    </>
  );
}