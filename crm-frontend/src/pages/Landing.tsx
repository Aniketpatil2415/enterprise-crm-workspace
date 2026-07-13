import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="glass-panel p-10 max-w-lg w-full relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-brand-800 border border-brand-500/50 flex items-center justify-center mb-6 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-brand-400" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
          Fusion Byte CRM
        </h1>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          The environment is configured. The architecture is locked. Welcome to the ultimate enterprise workspace.
        </p>

        {/* 👇 यहाँ हमने onClick इवेंट और Navigate लॉजिक लगाया है */}
        <button 
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 bg-brand-400 hover:bg-white text-brand-900 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-brand-400/20"
        >
          Initialize Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}