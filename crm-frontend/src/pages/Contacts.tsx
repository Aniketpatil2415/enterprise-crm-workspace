import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Plus, Mail, Phone, Building2, Trash2, Loader2, Briefcase } from 'lucide-react';
import AddContactModal from '../components/glass/AddContactModal';

interface CompanyData {
  name: string;
  industry: string | null;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  company: CompanyData | null;
  createdAt: string;
}

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      const response = await axios.get(`${API_URL}/contacts`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contact directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (contactId: string, contactName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to archive ${contactName}?`);
    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const response = await axios.delete(`${API_URL}/contacts/${contactId}`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        toast.success(`${contactName} archived successfully.`);
        setContacts(prev => prev.filter(c => c.id !== contactId));
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-brand-900 text-white overflow-hidden p-8 fade-in">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        
        {/* Enterprise Header Section */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-brand-400" />
              Contact Directory
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your key decision-makers and client relationships.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-brand-400/20"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>

        {/* Premium Data Table Section */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="glass-panel border border-glass-border rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-900/80 border-b border-glass-border text-xs uppercase tracking-wider text-gray-400">
                    <th className="p-5 font-semibold">Contact Name</th>
                    <th className="p-5 font-semibold">Role & Company</th>
                    <th className="p-5 font-semibold">Communication</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/50 text-sm">
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        No contacts found. Start building your network!
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5">
                          <p className="font-bold text-white text-base">{contact.firstName} {contact.lastName || ''}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Added: {new Date(contact.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-5">
                          {contact.title && (
                            <div className="flex items-center text-gray-300 text-sm mb-1">
                              <Briefcase className="w-3.5 h-3.5 mr-2 text-brand-400" />
                              {contact.title}
                            </div>
                          )}
                          {contact.company ? (
                            <div className="flex items-center text-xs text-gray-400">
                              <Building2 className="w-3.5 h-3.5 mr-2" />
                              <span className="font-medium">{contact.company.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600 italic">No Company Linked</span>
                          )}
                        </td>
                        <td className="p-5 space-y-1.5">
                          {contact.email && (
                            <div className="flex items-center text-gray-300 text-xs hover:text-white transition-colors">
                              <Mail className="w-3.5 h-3.5 mr-2 text-gray-500" />
                              <a href={`mailto:${contact.email}`}>{contact.email}</a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center text-gray-300 text-xs hover:text-white transition-colors">
                              <Phone className="w-3.5 h-3.5 mr-2 text-gray-500" />
                              <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(contact.id, contact.firstName)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Archive Contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactAdded={fetchContacts}
      />
    </div>
  );
}