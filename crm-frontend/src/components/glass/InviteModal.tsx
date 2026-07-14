import { useState } from 'react';
import { X, Link as LinkIcon, Loader2, Copy, CheckCircle2, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('MEMBER');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedLink('');
    setCopied(false);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthorized');

      const response = await axios.post(
        `${API_URL}/invites`,
        { role },
        { headers: { 'x-user-id': currentUser.uid } }
      );

      if (response.data.success) {
        setGeneratedLink(response.data.data.inviteLink);
        toast.success('Secure invite link generated!');
      }
    } catch (error: any) {
      console.error('Failed to generate invite:', error);
      toast.error(error.response?.data?.message || 'Failed to generate link.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 fade-in">
      <div className="absolute inset-0 bg-brand-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-brand-900 border border-glass-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-glass-border bg-brand-800/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-brand-400" />
            Generate Invite Link
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>Anyone with this link will be able to join your workspace. The link will automatically expire in 7 days for security.</p>
          </div>

          {!generatedLink ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Access Level</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-400 appearance-none cursor-pointer"
                >
                  <option value="MEMBER" className="bg-brand-900">MEMBER (Standard Access)</option>
                  <option value="ADMIN" className="bg-brand-900">ADMIN (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 rounded-lg mt-6 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-brand-400/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Secure Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Link Ready
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full bg-brand-900 border border-glass-border rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-400 hover:text-brand-900 transition-all shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button onClick={onClose} className="w-full py-3 text-gray-400 hover:text-white text-sm font-semibold transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}