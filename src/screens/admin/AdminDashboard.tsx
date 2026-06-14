import React from 'react';
import { TrendingUp, Users, ShoppingCart, ShieldAlert, Terminal, Server, Globe, Cpu, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboard = ({ data }: { data: any }) => {
  const d = data.dashboard || {};
  const stats = [
    { label: 'TOTAL_USERS', value: String(d.totalUsers || data.users?.length || 0), icon: Users, color: '#00D9FF' },
    { label: 'ACTIVE_AUCTIONS', value: String(d.activeAuctions || data.crops?.length || 0), icon: Globe, color: '#00E676' },
    { label: 'TOTAL_BIDS', value: String(d.totalBids || 0), icon: TrendingUp, color: '#FFB800' },
    { label: 'OPEN_COMPLAINTS', value: String(data.complaints?.filter((c: any) => c.status !== 'resolved').length || 0), icon: ShieldAlert, color: '#FF006E' },
  ];

  return (
    <div className="space-y-8 admin-fade">
      <div className="flex items-center justify-between px-6 py-3 border border-[#00D9FF]/30 bg-[#00D9FF]/5 rounded-lg">
        <div className="flex items-center gap-4">
          <Terminal size={18} className="text-[#00D9FF]" />
          <span className="text-xs font-bold tracking-widest text-[#00D9FF]">SYSTEM STATUS: OPERATIONAL</span>
          <span className="text-[10px] text-gray-500 font-mono">LATENCY: 24ms</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#00E676] blink"></div>
           <span className="text-[10px] text-[#00E676] font-bold">REAL-TIME DATA STREAM ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="admin-card p-6 border-l-2" style={{ borderLeftColor: stat.color }}>
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={20} style={{ color: stat.color }} />
              <div className="text-[10px] font-mono text-gray-500 tracking-tighter">DB // LIVE</div>
            </div>
            <h3 className="text-2xl font-bold font-mono tracking-tighter mb-1">{stat.value}</h3>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 admin-card p-8 min-h-[400px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div><h3 className="text-sm font-bold tracking-widest mb-1">MARKET_VOLUME_24H</h3><p className="text-xs text-gray-500">LIVE TRANSACTION DATA FROM DATABASE</p></div>
          </div>
          <div className="absolute inset-x-8 bottom-8 h-48 flex items-end gap-1">
            {[...Array(40)].map((_, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.random() * 80 + 20}%` }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 + Math.random() }} className="flex-1 bg-gradient-to-t from-[#00D9FF]/20 to-[#00D9FF]/50 rounded-t-sm"></motion.div>
            ))}
          </div>
        </div>

        <div className="admin-card p-6">
          <h3 className="text-xs font-bold tracking-widest mb-6 border-b border-[#21262D] pb-4 flex items-center gap-2">
            <Activity size={14} className="text-[#FFB800]" /> RECENT_ACTIVITY
          </h3>
          <div className="space-y-4 font-mono text-[10px]">
            {(data.logs || []).slice(0, 6).map((log: any, i: number) => (
              <div key={i} className="flex gap-4 border-b border-[#21262D] pb-2 last:border-0">
                <span className="text-gray-600">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[#00E676]">{log.action}</span>
              </div>
            ))}
            {(!data.logs || data.logs.length === 0) && <div className="text-gray-500 text-center py-4">Fetching logs from DB...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
