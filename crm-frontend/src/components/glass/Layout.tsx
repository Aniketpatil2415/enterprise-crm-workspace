import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import axios from 'axios';
import { 
  LayoutDashboard, Building2, Users, Target, LogOut, 
  Search, Bell, CheckSquare, Loader2, X 
} from 'lucide-react';

interface SearchResults {
  leads: any[];
  companies: any[];
  contacts: any[];
  deals: any[];
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Omnisearch State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({ leads: [], companies: [], contacts: [], deals: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Deals & Revenue', path: '/deals', icon: Target },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // The Debounced Omnisearch Engine
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults({ leads: [], companies: [], contacts: [], deals: [] });
      setIsDropdownOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
          headers: { 'x-user-id': currentUser.uid }
        });

        if (res.data.success) {
          setSearchResults(res.data.data);
          setIsDropdownOpen(true);
        }
      } catch (error) {
        console.error('Omnisearch failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms delay to protect database

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const hasResults = searchResults.leads.length > 0 || 
                     searchResults.companies.length > 0 || 
                     searchResults.contacts.length > 0 || 
                     searchResults.deals.length > 0;

  const clearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex h-screen bg-brand-900 text-white overflow-hidden">
      
      {/* GLOBAL SIDEBAR */}
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
                onClick={() => { clearSearch(); navigate(item.path); }}
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
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* GLOBAL HEADER */}
        <header className="h-16 glass-panel border-t-0 border-l-0 border-r-0 rounded-none flex items-center justify-between px-8 sticky top-0 z-40">
          
          {/* 🔍 THE OMNISEARCH BAR */}
          <div className="relative w-64 lg:w-[28rem]" ref={searchRef}>
            <div className={`flex items-center bg-brand-900/80 border transition-all rounded-lg px-3 py-2 w-full ${isDropdownOpen ? 'border-brand-400 rounded-b-none' : 'border-glass-border focus-within:border-brand-400'}`}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-brand-400 mr-2 animate-spin shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              )}
              
              <input 
                type="text" 
                placeholder="Search leads, companies, contacts, deals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim().length >= 2) setIsDropdownOpen(true); }}
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500" 
              />
              
              {searchQuery && (
                <button onClick={clearSearch} className="text-gray-500 hover:text-white transition-colors ml-2 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🔍 THE SEARCH DROPDOWN */}
            {isDropdownOpen && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 bg-brand-900/95 backdrop-blur-xl border border-t-0 border-brand-400/50 rounded-b-xl shadow-2xl shadow-brand-400/10 max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col z-50">
                
                {!hasResults && !isSearching && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No matching records found in your workspace.
                  </div>
                )}

                {searchResults.leads.length > 0 && (
                  <div className="p-2 border-b border-glass-border/50">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2"><LayoutDashboard className="w-3 h-3"/> Leads</h4>
                    {searchResults.leads.map(lead => (
                      <button key={lead.id} onClick={() => { clearSearch(); navigate('/dashboard'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <p className="text-sm font-semibold text-white group-hover:text-brand-400">{lead.firstName} {lead.lastName || ''}</p>
                        <p className="text-xs text-gray-500">{lead.status} • {lead.email || 'No email'}</p>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.companies.length > 0 && (
                  <div className="p-2 border-b border-glass-border/50">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2"><Building2 className="w-3 h-3"/> Companies</h4>
                    {searchResults.companies.map(company => (
                      <button key={company.id} onClick={() => { clearSearch(); navigate('/companies'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <p className="text-sm font-semibold text-white group-hover:text-brand-400">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.industry || 'No industry listed'}</p>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.contacts.length > 0 && (
                  <div className="p-2 border-b border-glass-border/50">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2"><Users className="w-3 h-3"/> Contacts</h4>
                    {searchResults.contacts.map(contact => (
                      <button key={contact.id} onClick={() => { clearSearch(); navigate('/contacts'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <p className="text-sm font-semibold text-white group-hover:text-brand-400">{contact.firstName} {contact.lastName || ''}</p>
                        <p className="text-xs text-gray-500">{contact.title || 'Contact'}</p>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.deals.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 flex items-center gap-2"><Target className="w-3 h-3"/> Deals</h4>
                    {searchResults.deals.map(deal => (
                      <button key={deal.id} onClick={() => { clearSearch(); navigate('/deals'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors group">
                        <p className="text-sm font-semibold text-emerald-400">${deal.value.toLocaleString()} - <span className="text-white group-hover:text-brand-400">{deal.title}</span></p>
                        <p className="text-xs text-gray-500">{deal.stage.replace('_', ' ')}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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