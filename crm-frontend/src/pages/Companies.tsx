import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, Plus, Globe, MapPin, Trash2, Loader2 } from 'lucide-react';
import AddCompanyModal from '../components/glass/AddCompanyModal';

interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  createdAt: string;
}

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      const response = await axios.get(`${API_URL}/companies`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load company directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (companyId: string, companyName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to archive ${companyName}?`);
    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const response = await axios.delete(`${API_URL}/companies/${companyId}`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        toast.success(`${companyName} archived successfully.`);
        setCompanies(prev => prev.filter(c => c.id !== companyId));
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen bg-brand-900 text-white overflow-hidden p-8 fade-in">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-brand-400" />
              Company Directory
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage your enterprise clients and business accounts.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-400 hover:bg-white text-brand-900 px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-brand-400/20"
          >
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>

        {/* Data Table Section */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="glass-panel border border-glass-border rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-900/80 border-b border-glass-border text-xs uppercase tracking-wider text-gray-400">
                    <th className="p-5 font-semibold">Company Name</th>
                    <th className="p-5 font-semibold">Industry</th>
                    <th className="p-5 font-semibold">Contact Info</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/50 text-sm">
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        No companies registered yet. Start building your client base!
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5">
                          <p className="font-bold text-white text-base">{company.name}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            Added: {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-5 text-gray-300">
                          {company.industry ? (
                            <span className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full border border-brand-500/20 text-xs font-medium">
                              {company.industry}
                            </span>
                          ) : (
                            <span className="text-gray-600 italic">Unspecified</span>
                          )}
                        </td>
                        <td className="p-5 space-y-1">
                          {company.website && (
                            <div className="flex items-center text-gray-400 text-xs hover:text-brand-400 transition-colors">
                              <Globe className="w-3.5 h-3.5 mr-2" />
                              <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
                            </div>
                          )}
                          {company.address && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                              <span className="truncate max-w-[200px]">{company.address}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(company.id, company.name)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Archive Company"
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

      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCompanyAdded={fetchCompanies}
      />
    </div>
  );
}