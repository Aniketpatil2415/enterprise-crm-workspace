import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up for new users
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // ==========================================
        // 1. LOGIN FLOW
        // ==========================================
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Authentication successful. Initializing workspace...');
        navigate('/dashboard');
        
      } else {
        // ==========================================
        // 2. REGISTRATION FLOW (The Frontend to Backend Bridge)
        // ==========================================
        if (!name.trim()) throw new Error("Full name is required for enterprise setup.");

        // Step A: Create User in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step B: Update Firebase Profile with Name
        await updateProfile(user, { displayName: name });

        // Step C: 🚨 SYNCHRONIZE WITH MYSQL BACKEND 🚨
        await axios.post(`${API_URL}/auth/register`, {
          firebaseUid: user.uid,
          email: user.email,
          fullName: name
        });

        toast.success('Workspace provisioned successfully. Welcome to Fusion Byte CRM.');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('[AUTH EXCEPTION]', error);
      // Clean up Firebase error messages for the user
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed.';
      toast.error(errorMessage.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Glassmorphism Authentication Card */}
      <div className="w-full max-w-md glass-panel border border-glass-border rounded-2xl p-8 relative z-10 fade-in shadow-2xl bg-black/40 backdrop-blur-xl">
        
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 p-[1px] mb-4">
            <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            FUSION BYTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500">CRM</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            {isLogin ? 'Authenticate to access your workspace.' : 'Provision your enterprise workspace.'}
          </p>
        </div>

        {/* The Form */}
        <form onSubmit={handleAuthentication} className="space-y-4">
          
          {/* Full Name (Only for Sign Up) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                  placeholder="e.g. Elon Musk"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                placeholder="founder@fusionbyte.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed border border-brand-400/20 shadow-lg shadow-brand-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Initialize Engine' : 'Provision Workspace'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have a workspace? " : "Already have a workspace? "}
            <span className="text-brand-400 font-bold underline-offset-4 hover:underline">
              {isLogin ? 'Provision one' : 'Authenticate here'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}