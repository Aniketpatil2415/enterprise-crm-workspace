import { useState } from 'react';
import { Building2, Mail, User, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspaceName: '',
    fullName: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workspaceName || !formData.fullName || !formData.email || !formData.password) {
      toast.error('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create secure account in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUid = userCredential.user.uid;

      // 2. Register Tenant in our Node.js & MySQL Database
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        firebaseUid,
        email: formData.email,
        fullName: formData.fullName,
        workspaceName: formData.workspaceName,
      });

      if (response.data.success) {
        toast.success(`Welcome to Fusion Byte CRM! Workspace UID: ${response.data.data.workspace.tenantUid}`);
        // TODO: Next phase we will redirect user to their dashboard
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || error.message || 'Registration failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1C2541', color: '#fff' } }} />
      
      <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-brand-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-panel p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-800 border border-brand-500/50 mb-4 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Workspace</h2>
          <p className="text-sm text-gray-400 mt-2">Join Fusion Byte CRM to manage your leads</p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Workspace Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                name="workspaceName"
                value={formData.workspaceName}
                onChange={handleChange}
                type="text" 
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                placeholder="e.g. Fusion Byte HQ"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text" 
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                placeholder="founder@fusionbyte.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password" 
                className="w-full bg-brand-900/50 border border-glass-border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-400 hover:bg-white text-brand-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 mt-6 flex justify-center items-center shadow-lg hover:shadow-brand-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}