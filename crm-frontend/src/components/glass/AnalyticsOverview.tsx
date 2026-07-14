import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import type { Lead } from './KanbanBoard';
import type { DealOverview } from '../../pages/Dashboard';

interface AnalyticsOverviewProps {
  leads: Lead[];
  deals: DealOverview[];
}

const COLORS = {
  DISCOVERY: '#3b82f6', // blue
  PROPOSAL: '#a855f7', // purple
  NEGOTIATION: '#f59e0b', // amber
  CLOSED_WON: '#10b981', // emerald
  CLOSED_LOST: '#ef4444', // red
};

export default function AnalyticsOverview({ leads, deals }: AnalyticsOverviewProps) {
  
  const { stats, leadTrend, revenueData } = useMemo(() => {
    // Lead Stats
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'WON').length;
    const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Revenue Stats (From Deals)
    const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const wonRevenue = deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, deal) => sum + deal.value, 0);

    // 1. Lead Generation Timeline (Dynamic Area Chart)
    const trendMap = new Map<string, number>();
    const sortedLeads = [...leads].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    sortedLeads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap.set(label, (trendMap.get(label) || 0) + 1);
    });
    
    let leadTrend = Array.from(trendMap.entries()).map(([name, count]) => ({ name, leads: count }));
    if (leadTrend.length === 1) leadTrend.unshift({ name: 'Start', leads: 0 });
    else if (leadTrend.length === 0) leadTrend = [{ name: 'No Data', leads: 0 }];

    // 2. Revenue Distribution by Stage (Dynamic Bar Chart)
    const revenueData = [
      { name: 'Discovery', value: deals.filter(d => d.stage === 'DISCOVERY').reduce((s, d) => s + d.value, 0), color: COLORS.DISCOVERY },
      { name: 'Proposal', value: deals.filter(d => d.stage === 'PROPOSAL').reduce((s, d) => s + d.value, 0), color: COLORS.PROPOSAL },
      { name: 'Negotiation', value: deals.filter(d => d.stage === 'NEGOTIATION').reduce((s, d) => s + d.value, 0), color: COLORS.NEGOTIATION },
      { name: 'Won', value: wonRevenue, color: COLORS.CLOSED_WON },
    ];

    return { 
      stats: { totalLeads, winRate, totalPipelineValue, wonRevenue }, 
      leadTrend, 
      revenueData 
    };
  }, [leads, deals]);

  // Format currency for beautiful display
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Custom Tooltips for Charts
  const CustomLeadTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-900/95 border border-glass-border p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 font-semibold mb-1 text-xs uppercase tracking-wider">{label}</p>
          <p className="text-brand-400 font-bold text-xl">{payload[0].value} Leads</p>
        </div>
      );
    }
    return null;
  };

  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-900/95 border border-glass-border p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 font-semibold mb-1 text-xs uppercase tracking-wider">{label} Stage</p>
          <p className="text-emerald-400 font-bold text-xl">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border border-glass-border rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Total Leads</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalLeads}</p>
        </div>
        <div className="glass-panel p-6 border border-glass-border rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Win Rate</h3>
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.winRate}%</p>
        </div>
        <div className="glass-panel p-6 border border-glass-border rounded-xl bg-brand-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Pipeline Value</h3>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-amber-400">{formatCurrency(stats.totalPipelineValue)}</p>
        </div>
        <div className="glass-panel p-6 border border-emerald-500/20 rounded-xl bg-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium tracking-wide">Revenue Won</h3>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-emerald-400">{formatCurrency(stats.wonRevenue)}</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEAD TIMELINE CHART */}
        <div className="glass-panel p-6 border border-glass-border rounded-xl flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Lead Generation Growth</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5BC0BE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5BC0BE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <RechartsTooltip content={<CustomLeadTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#5BC0BE" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE PIPELINE CHART */}
        <div className="glass-panel p-6 border border-glass-border rounded-xl flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Forecast by Stage</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2541" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                />
                <RechartsTooltip content={<CustomRevenueTooltip />} cursor={{ fill: '#1C2541', opacity: 0.4 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} animationDuration={1000}>
                  {revenueData.map((entry, index) => (
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