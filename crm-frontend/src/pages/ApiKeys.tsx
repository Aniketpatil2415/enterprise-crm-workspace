import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Key, Plus, Trash2, Loader2, ShieldAlert, Copy, CheckCircle2, Code2 } from 'lucide-react';

interface ApiKeyRecord {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [freshlyGeneratedKey, setFreshlyGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // 🔥 FIX: Corrected template literals in axios call
      const response = await axios.get(`${API_URL}/apikeys`, {
        headers: { 'x-user-id': currentUser.uid }
      });

      if (response.data.success) {
        setApiKeys(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch API Keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setIsGenerating(true);
      const currentUser = auth.currentUser;
      
      const response = await axios.post(`${API_URL}/apikeys`, 
        { name: newKeyName },
        { headers: { 'x-user-id': currentUser?.uid } }
      );

      if (response.data.success) {
        toast.success('New API Key generated securely.');
        setFreshlyGeneratedKey(response.data.data.key);
        setNewKeyName('');
        fetchApiKeys(); // Refresh table
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently revoke the key for "${name}"? Any integrations using this key will immediately fail.`)) return;

    try {
      const currentUser = auth.currentUser;
      await axios.delete(`${API_URL}/apikeys/${id}`, {
        headers: { 'x-user-id': currentUser?.uid }
      });
      
      toast.success('API Key revoked.');
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (error: any) {
      toast.error('Failed to revoke API Key.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('API Key copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-8 h-full max-w-7xl mx-auto w-full fade-in flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Code2 className="w-6 h-6 text-brand-400" /> Developer API Hub
          </h1>
          <p className="text-gray-400 text-sm mt-1">Generate and manage secure API keys for external integrations (Webhooks, Zapier, Custom Forms).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GENERATOR SECTION */}
        <div className="col-span-1 space-y-6">
          <div className="glass-panel p-6 border border-glass-border rounded-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-400" /> Generate New Key
            </h2>
            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Integration Name</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Website Contact Form"
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating || !newKeyName.trim()}
                className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-400/20 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Generate Key</>}
              </button>
            </form>
          </div>

          {freshlyGeneratedKey && (
            <div className="glass-panel p-6 border border-emerald-500/30 rounded-xl bg-emerald-500/10 animate-in fade-in zoom-in duration-300">
              <div className="flex items-start gap-3 mb-4">
                <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400 font-medium">Please copy this key immediately. For security reasons, it will never be shown again.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={freshlyGeneratedKey}
                  className="w-full bg-brand-900 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(freshlyGeneratedKey)}
                  className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all shrink-0"
                  title="Copy Key"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KEYS DATA TABLE */}
        <div className="col-span-1 lg:col-span-2">
          <div className="glass-panel border border-glass-border rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-glass-border bg-brand-800/30">
              <h3 className="font-bold text-white">Active Integrations</h3>
            </div>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center p-10">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-white border-collapse">
                  <thead>
                    <tr className="bg-brand-900/50 border-b border-glass-border text-xs uppercase text-gray-400">
                      <th className="p-4">Name & Key</th>
                      <th className="p-4">Created On</th>
                      <th className="p-4">Last Used</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/50 text-sm">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-500">No active API keys found.</td>
                      </tr>
                    ) : (
                      apiKeys.map(k => (
                        <tr key={k.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-base">{k.name}</p>
                            <p className="text-xs text-brand-400 font-mono mt-1">{k.key}</p>
                          </td>
                          <td className="p-4 text-gray-400 text-xs">{new Date(k.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-gray-400 text-xs">
                            {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRevoke(k.id, k.name)}
                              className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Revoke Key"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}