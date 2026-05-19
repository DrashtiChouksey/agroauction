import React from 'react';
import { ShieldAlert, User, Clock, AlertTriangle, ChevronRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminComplaints = ({ complaints }: { complaints: any[] }) => {
  const getSeverityStyle = (s: string) => {
    if (s === 'urgent') return 'bg-[#FF006E]/10 text-[#FF006E]';
    if (s === 'high') return 'bg-[#FF3B3B]/10 text-[#FF3B3B]';
    if (s === 'medium') return 'bg-[#FFB800]/10 text-[#FFB800]';
    return 'bg-[#00D9FF]/10 text-[#00D9FF]';
  };
  const getStatusStyle = (s: string) => {
    if (s === 'open') return 'bg-[#FF3B3B]/20 text-[#FF3B3B]';
    if (s === 'under_review') return 'bg-[#FFB800]/20 text-[#FFB800]';
    return 'bg-[#00E676]/20 text-[#00E676]';
  };

  return (
    <div className="space-y-8 admin-fade">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-3"><ShieldAlert className="text-[#FF006E]" size={24} /> RESOLUTION_CENTER</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">TOTAL_TICKETS: {complaints?.length || 0} // FROM_DATABASE</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {(complaints || []).map((cmp: any, i: number) => (
          <motion.div key={cmp._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="admin-card p-6 flex items-center justify-between group hover:border-[#00D9FF]/30 transition-all">
            <div className="flex items-center gap-6">
              <div className={`p-3 rounded-lg ${getSeverityStyle(cmp.severity)}`}><AlertTriangle size={20} /></div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500">ID: {(cmp._id || '').slice(-6).toUpperCase()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-widest ${getStatusStyle(cmp.status)}`}>{cmp.status?.toUpperCase().replace('_', ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getSeverityStyle(cmp.severity)}`}>{cmp.severity?.toUpperCase()}</span>
                </div>
                <h3 className="text-sm font-bold tracking-widest mt-1">{cmp.type?.toUpperCase().replace('_', ' ')}</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-lg truncate">{cmp.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400"><User size={12} /> {cmp.complainantName} vs {cmp.accusedName}</div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400"><Clock size={12} /> {new Date(cmp.createdAt).toLocaleDateString('en-IN')}</div>
                  {cmp.amount && <div className="text-[10px] text-[#FFB800] font-bold">₹{cmp.amount?.toLocaleString()}</div>}
                </div>
              </div>
            </div>
            <button className="px-6 py-2 bg-transparent border border-[#00D9FF] text-[#00D9FF] rounded text-[10px] font-bold hover:bg-[#00D9FF]/10 transition-all flex items-center gap-2">
              RESOLVE <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
        {(!complaints || complaints.length === 0) && <div className="admin-card p-12 text-center text-gray-500 font-mono">No complaints in database</div>}
      </div>
    </div>
  );
};
