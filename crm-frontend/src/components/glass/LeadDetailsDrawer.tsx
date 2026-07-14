import { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Trash2, Clock, Briefcase, MessageSquare, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';
import type { Lead } from './KanbanBoard';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadDeleted: (leadId: string) => void;
}

interface Note {
  id: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  createdBy: { email: string; fullName: string };
}

export default function LeadDetailsDrawer({ lead, isOpen, onClose, onLeadDeleted }: LeadDetailsDrawerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen && lead) {
      fetchNotes();
    }
  }, [isOpen, lead]);

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const response = await axios.get(`${API_URL}/notes?leadId=${lead?.id}`, {
        headers: { 'x-user-id': currentUser.uid }
      });
      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsNoteSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.post(`${API_URL}/notes`, 
        { content: newNote, leadId: lead?.id },
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        setNotes([response.data.data, ...notes]);
        setNewNote('');
        toast.success('Note added to timeline.');
      }
    } catch (error) {
      toast.error('Failed to save note.');
    } finally {
      setIsNoteSubmitting(false);
    }
  };

  const handleSoftDelete = async () => {
    const confirmDelete = window.confirm(`Archive ${lead?.firstName}? This action can be undone later by an admin.`);
    if (!confirmDelete || !lead) return;

    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;
      const response = await axios.delete(`${API_URL}/leads/${lead.id}`, {
        headers: { 'x-user-id': currentUser?.uid }
      });

      if (response.data.success) {
        toast.success('Lead archived successfully.');
        onLeadDeleted(lead.id);
        onClose();
      }
    } catch (error: any) {
      toast.error('Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !lead) return null;

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
      <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm z-[9998] transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-brand-900/95 border-l border-glass-border shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            Lead Profile
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Main Info Card */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{lead.firstName} {lead.lastName || ''}</h1>
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

          {/* 📝 NEW: The Audit Timeline Engine */}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Activity & Notes
            </h3>
            
            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="mb-6 relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a call, meeting, or update..."
                className="w-full bg-brand-900/50 border border-glass-border rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-brand-400 resize-none custom-scrollbar min-h-[100px]"
              />
              <button 
                type="submit" 
                disabled={isNoteSubmitting || !newNote.trim()}
                className="absolute bottom-4 right-4 text-brand-400 hover:text-white disabled:text-gray-600 transition-colors"
              >
                {isNoteSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>

            {/* Timeline View */}
            <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-500/20 before:to-transparent">
              {isLoadingNotes ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 text-brand-400 animate-spin" /></div>
              ) : notes.length === 0 ? (
                <p className="text-center text-xs text-gray-500 italic mt-8">No activity recorded yet.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-glass-border bg-brand-900 text-brand-400 shadow shrink-0 z-10">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel border border-glass-border p-4 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{note.createdBy.fullName || note.createdBy.email.split('@')[0]}</span>
                        <span className="text-[10px] text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer / Danger Zone */}
        <div className="p-6 border-t border-glass-border bg-brand-900 shrink-0">
          <button onClick={handleSoftDelete} disabled={isDeleting} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all font-semibold">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Archive Lead</>}
          </button>
        </div>

      </div>
    </>
    );
}
