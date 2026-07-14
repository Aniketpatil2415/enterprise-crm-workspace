import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';
import type { Lead } from './KanbanBoard';

interface AnalyticsOverviewProps {
  leads: Lead[];
}

const COLORS = {
  NEW: '#3b82f6', // blue-500
  CONTACTED: '#f59e0b', // amber-500
  QUALIFIED: '#6366f1', // indigo-500
  PROPOSAL: '#a855f7', // purple-500
  WON: '#10b981', // emerald-500
  LOST: '#ef4444', // red-500
};

export default function AnalyticsOverview({ leads }: AnalyticsOverviewProps) {
  
  // 100% REAL DATA PROCESSING (No Dummy Data)
  const { stats, pipelineData, dynamicTrend } = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === 'WON').length;
    const lost = leads.filter(l => l.status === 'LOST').length;
    const active = total - won - lost;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    // Pipeline Distribution (Real-time count)
    const pipelineData = [
      { name: 'New', count: leads.filter(l => l.status === 'NEW').length, color: COLORS.NEW },
      { name: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length, color: COLORS.CONTACTED },
      { name: 'Qualified', count: leads.filter(l => l.status === 'QUALIFIED').length, color: COLORS.QUALIFIED },
      { name: 'Proposal', count: leads.filter(l => l.status === 'PROPOSAL').length, color: COLORS.PROPOSAL },
      { name: 'Won', count: won, color: COLORS.WON },
      { name: 'Lost', count: lost, color: COLORS.LOST },
    ];

    // DYNAMIC TIME-SERIES ENGINE: Grouping real leads by exact creation date
    const trendMap = new Map<string, number>();
    
    // Sort leads chronologically
    const sortedLeads = [...leads].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedLeads.forEach(lead => {
      const date = new Date(lead.createdAt);
      // Formatting date as "Jul 14" for clean X-Axis labels
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap.set(label, (trendMap.get(label) || 0) + 1);
    });

    let dynamicTrend = Array.from(trendMap.entries()).map(([name, count]) => ({
      name,
      leads: count
    }));

    // UX Fallback: If there's only 1 day of data, add a 0-baseline so the AreaChart renders a curve, not a dot.
    if (dynamicTrend.length === 1) {
       dynamicTrend.unshift({ name: 'Start', leads: 0 });
    } else if (dynamicTrend.length === 0) {
       // If completely empty, show an empty state structure
       dynamicTrend = [{ name: 'No Data', leads: 0 }];
    }

    return { stats: { total, won, active, winRate }, pipelineData, dynamicTrend };
  }, [leads]);

  // Premium Dark Theme Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-900/95 border border-glass-border p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 font-semibold mb-1 text-xs uppercase tracking-wider">{label}</p>
          <p className="text-brand-400 font-bold text-xl">
            {payload[0].value} {payload[0].value === 1 ? 'Lead' : 'Leads'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Actionable Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border border-glass-border rounded-xl hover:border-brand-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Total Leads</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="glass-panel p-6 border border-glass-border rounded-xl hover:border-brand-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Active Pipeline</h3>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.active}</p>
        </div>

        <div className="glass-panel p-6 border border-glass-border rounded-xl hover:border-brand-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Closed Won</h3>
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-emerald-400">{stats.won}</p>
        </div>

        <div className="glass-panel p-6 border border-glass-border rounded-xl hover:border-brand-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Win Rate</h3>
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.winRate}%</p>
        </div>
      </div>

      {/* Deep Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-time Growth Area Chart */}
        <div className="glass-panel p-6 border border-glass-border rounded-xl flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-6">Actual Lead Generation Timeline</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5BC0BE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5BC0BE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#5BC0BE" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution Bar Chart */}
        <div className="glass-panel p-6 border border-glass-border rounded-xl flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-6">Pipeline Health Distribution</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1C2541', opacity: 0.4 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1000}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}