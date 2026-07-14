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
  // Complex calculations handled smoothly via useMemo to prevent re-renders
  const { stats, pipelineData, revenueTrend } = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === 'WON').length;
    const lost = leads.filter(l => l.status === 'LOST').length;
    const active = total - won - lost;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    // Pipeline Distribution for Bar Chart
    const pipelineData = [
      { name: 'New', count: leads.filter(l => l.status === 'NEW').length, color: COLORS.NEW },
      { name: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length, color: COLORS.CONTACTED },
      { name: 'Qualified', count: leads.filter(l => l.status === 'QUALIFIED').length, color: COLORS.QUALIFIED },
      { name: 'Proposal', count: leads.filter(l => l.status === 'PROPOSAL').length, color: COLORS.PROPOSAL },
      { name: 'Won', count: won, color: COLORS.WON },
      { name: 'Lost', count: lost, color: COLORS.LOST },
    ];

    // Simulating Revenue/Lead Trend for Area Chart based on actual data length
    // In a real app, this groups by createdAt dates. Here we mock a steady growth curve scaling with your data.
    const baseMultiplier = total > 0 ? total : 1;
    const revenueTrend = [
      { name: 'Jan', leads: Math.max(1, Math.floor(baseMultiplier * 0.2)) },
      { name: 'Feb', leads: Math.max(2, Math.floor(baseMultiplier * 0.4)) },
      { name: 'Mar', leads: Math.max(3, Math.floor(baseMultiplier * 0.5)) },
      { name: 'Apr', leads: Math.max(5, Math.floor(baseMultiplier * 0.8)) },
      { name: 'May', leads: Math.max(6, Math.floor(baseMultiplier * 1.2)) },
      { name: 'Jun', leads: total },
    ];

    return { stats: { total, won, active, winRate }, pipelineData, revenueTrend };
  }, [leads]);

  // Custom Tooltip for Premium Dark Theme Look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-900/90 border border-glass-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gray-300 font-semibold mb-1">{label}</p>
          <p className="text-brand-400 font-bold text-lg">
            {payload[0].value} Leads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Stats Cards */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Growth Trend Area Chart */}
        <div className="glass-panel p-6 border border-glass-border rounded-xl flex flex-col h-96">
          <h3 className="text-lg font-bold text-white mb-6">Lead Generation Trend</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5BC0BE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5BC0BE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#5BC0BE" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
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
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1C2541', opacity: 0.4 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
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