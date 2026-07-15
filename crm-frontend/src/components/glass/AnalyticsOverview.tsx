import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

// Props imported from your existing Dashboard types
interface Lead {
  id: string;
  status: string;
  createdAt: string;
}

interface Deal {
  id: string;
  value: number;
  stage: string;
  createdAt: string;
}

interface AnalyticsOverviewProps {
  leads: Lead[];
  deals: Deal[];
}

export default function AnalyticsOverview({ leads = [], deals = [] }: AnalyticsOverviewProps) {
  
  // 1. Process Key Metrics
  const totalRevenue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const activeLeads = leads.filter(l => l.status !== 'WON' && l.status !== 'LOST').length;
  const wonDeals = deals.filter(d => d.stage === 'WON').length;
  const conversionRate = leads.length > 0 ? ((wonDeals / leads.length) * 100).toFixed(1) : '0.0';

  // 2. Process Data for Area Chart (Revenue Trend)
  const revenueData = useMemo(() => {
    // In a real app, group by actual dates. Here we mock a trend based on deal values for visual impact.
    const data = [
      { name: 'Jan', revenue: 0 },
      { name: 'Feb', revenue: Math.floor(totalRevenue * 0.1) },
      { name: 'Mar', revenue: Math.floor(totalRevenue * 0.25) },
      { name: 'Apr', revenue: Math.floor(totalRevenue * 0.4) },
      { name: 'May', revenue: Math.floor(totalRevenue * 0.7) },
      { name: 'Jun', revenue: totalRevenue },
    ];
    return data;
  }, [totalRevenue]);

  // 3. Process Data for Bar Chart (Leads by Status)
  const leadsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    return Object.keys(statusCounts).map(key => ({
      name: key,
      count: statusCounts[key]
    }));
  }, [leads]);

  // 4. Process Data for Donut Chart (Deal Distribution)
  const dealsByStage = useMemo(() => {
    const stageCounts: Record<string, number> = {};
    deals.forEach(deal => {
      stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
    });
    return Object.keys(stageCounts).map(key => ({
      name: key,
      value: stageCounts[key]
    }));
  }, [deals]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Custom Glassmorphism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-900/90 backdrop-blur-md border border-glass-border p-4 rounded-lg shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}: {entry.name === 'revenue' ? '₹' : ''}{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <DollarSign className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Total Revenue</p>
            <h3 className="text-2xl font-black text-white tracking-tight">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Active Leads</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{activeLeads}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Conversion Rate</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{conversionRate}%</h3>
          </div>
        </div>

        <div className="glass-panel p-6 border border-glass-border rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-semibold">Total Deals</p>
            <h3 className="text-2xl font-black text-white tracking-tight">{deals.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 border border-glass-border rounded-2xl h-[400px] flex flex-col">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" /> Revenue Forecast
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Bar Chart */}
        <div className="glass-panel p-6 border border-glass-border rounded-2xl h-[400px] flex flex-col">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" /> Lead Pipeline
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStatus} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Deal Stage Distribution Donut Chart */}
        <div className="glass-panel p-6 border border-glass-border rounded-2xl h-[350px] flex flex-col items-center justify-center relative">
          <h3 className="text-white font-bold mb-2 w-full text-left">Deal Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dealsByStage}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              >
                {dealsByStage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Inner Text for Donut */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
            <p className="text-3xl font-black text-white">{deals.length}</p>
            <p className="text-xs text-gray-500 font-semibold uppercase">Deals</p>
          </div>
        </div>

        {/* Placeholder for future module (e.g., Recent Activities) */}
        <div className="glass-panel p-6 border border-glass-border rounded-2xl flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 mb-4">
              <Activity className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automations & Activities</h3>
            <p className="text-gray-400 text-sm max-w-sm">Connect Stripe or WhatsApp webhooks to see live activity streams here in the next phase.</p>
        </div>
      </div>

    </div>
  );
}