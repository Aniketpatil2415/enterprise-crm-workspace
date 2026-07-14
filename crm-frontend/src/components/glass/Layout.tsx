import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { LayoutDashboard, Building2, Users, Target, LogOut, Search, Bell } from 'lucide-react'; // 🔥 FIX: Changed Logout to LogOut

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Deals & Revenue', path: '/deals', icon: Target }, // 🔥 FIX: Added Deals Navigation Button
  ];

  return (
    <div className="flex h-screen bg-brand-900 text-white overflow-hidden">
      
      {/* GLOBAL SIDEBAR */}
      {/* 🔥 FIX: Resolved CSS conflict by removing standalone 'flex' and keeping 'hidden md:flex flex-col' */}
      <aside className="w-64 glass-panel border-y-0 border-l-0 rounded-none flex-col z-30 hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-glass-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center font-bold text-brand-900">
            FB
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Fusion Byte</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-brand-500/20 text-white border border-brand-500/30 shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> {/* 🔥 FIX: Updated component name */}
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* GLOBAL HEADER */}
        <header className="h-16 glass-panel border-t-0 border-l-0 border-r-0 rounded-none flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center bg-brand-900/50 border border-glass-border rounded-lg px-3 py-1.5 w-64 lg:w-96 transition-all focus-within:border-brand-400">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Global Search..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500" />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end justify-center">
              <span className="text-xs text-gray-400 font-medium tracking-wide">Workspace ID</span>
              <span className="text-sm font-mono text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded border border-brand-400/20 mt-0.5">
                {auth.currentUser?.uid ? `FB-${auth.currentUser.uid.substring(0, 6).toUpperCase()}` : 'Connecting...'}
              </span>
            </div>

            <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-glass-border pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">Admin</p>
                <p className="text-xs text-brand-400 leading-tight">Owner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center text-brand-900 font-bold text-lg shadow-lg shadow-brand-400/20">
                {auth.currentUser?.email ? auth.currentUser.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGES RENDER HERE */}
        <div className="flex-1 overflow-y-auto bg-brand-900 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}