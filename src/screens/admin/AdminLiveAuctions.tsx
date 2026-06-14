import React from 'react';
import { PlayCircle, Eye, StopCircle, RefreshCw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLiveAuctions = ({ crops }: { crops: any[] }) => {
  const getTimeLeft = (exp: string) => {
    const diff = new Date(exp).getTime() - Date.now();
    if (diff <= 0) return 'EXPIRED';
    return `${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`;
  };

  return (
    <div className="space-y-8 admin-fade">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-3"><Activity className="text-[#00E676]" size={24} /> LIVE_MARKET_STREAM</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">TOTAL_ACTIVE_AUCTIONS: {crops?.length || 0} // FROM_DATABASE</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {(crops || []).map((crop: any, i: number) => (
          <motion.div key={crop._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="admin-card p-6 border-l-2 border-l-[#00E676]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded overflow-hidden border border-[#30363D]">
                    <img src={crop.photoUrl} alt={crop.cropName} className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00E676] rounded-full border-2 border-[#0A0E13] blink"></div>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#00E676]">{crop.status?.toUpperCase()} // {getTimeLeft(crop.expiresAt)}</span>
                  <h3 className="text-lg font-bold tracking-tighter mt-1">{crop.cropName?.toUpperCase()} // {crop.variety?.toUpperCase()}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-[10px] text-gray-400 font-mono"><span className="text-gray-600">FARMER:</span> {crop.farmerName}</div>
                    <div className="text-[10px] text-gray-400 font-mono"><span className="text-gray-600">VOLUME:</span> {crop.quantity} {crop.quantityUnit}</div>
                    <div className="text-[10px] text-gray-400 font-mono"><span className="text-gray-600">VIEWS:</span> {crop.views || 0}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-12">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">CURRENT_BID</p>
                  <p className="text-xl font-bold font-mono text-[#00E676]">₹{crop.currentHighestBid?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">TOTAL_BIDS</p>
                  <p className="text-xl font-bold font-mono text-[#00D9FF]">{crop.totalBids || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 h-1 w-full bg-[#21262D] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((crop.currentHighestBid / (crop.basePrice * 2)) * 100, 100)}%` }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[#00E676] to-[#00D9FF]" />
            </div>
          </motion.div>
        ))}
        {(!crops || crops.length === 0) && <div className="admin-card p-12 text-center text-gray-500 font-mono">No live auctions in database</div>}
      </div>
    </div>
  );
};
