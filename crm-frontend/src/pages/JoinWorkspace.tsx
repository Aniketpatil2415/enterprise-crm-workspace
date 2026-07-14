import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Key, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinWorkspace() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return toast.error('Please enter an invite code.');
    
    setIsLoading(true);
    // Future API integration will go here
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Workspace feature is syncing. Please check back later!');
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden fade-in">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 border border-glass-border rounded-2xl shadow-2xl relative z-10">
        <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-500/30 shadow-inner">
          <Building2 className="w-8 h-8 text-brand-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join Workspace</h1>
        <p className="text-gray-400 mb-8 text-sm">Enter the secure invite code provided by your CRM administrator to access the enterprise dashboard.</p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4" /> Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. FB-8A9X2B"
              className="w-full bg-brand-900/50 border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all font-mono tracking-widest uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3.5 rounded-lg transition-colors shadow-lg hover:shadow-brand-400/20 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Join Enterprise Network <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}