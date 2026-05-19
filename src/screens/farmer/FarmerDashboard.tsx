import React, { useEffect, useState } from 'react';
import { Sprout, Activity, ArrowUp, BarChart2, PlusCircle, Clock, CheckCircle, TrendingUp, Leaf, Wallet, DollarSign } from 'lucide-react';
import type { AppState, Crop, Bid } from '../../types';
import { TiltCard } from '../../components/TiltCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cropsAPI, bidsAPI } from '../../api/client';

interface FarmerDashboardProps {
  state: AppState;
  dispatch?: any;
  fetchData?: () => void;
  setCurrentPage: (p: string) => void;
}

export const FarmerDashboard = ({ state, dispatch, fetchData }: FarmerDashboardProps) => {
  const navigate = useNavigate();
  const [farmerBids, setFarmerBids] = useState<any[]>([]);
  
  const myCrops = state.crops.filter((c: Crop) => 
    c.farmerId === state.currentUser?.id || 
    (c as any).farmerName === state.currentUser?.name
  );
  const activeCount = myCrops.filter((c: Crop) => c.status === 'active').length;
  const soldCrops = myCrops.filter((c: Crop) => c.status === 'sold');
  
  // Calculate estimated revenue from active bids
  const estimatedRevenue = myCrops.reduce((sum, c) => sum + (c.currentHighestBid * c.quantity), 0);
  
  // Fetch bids for farmer's crops
  useEffect(() => {
    const loadBids = async () => {
      const allBids: any[] = [];
      for (const crop of myCrops.slice(0, 5)) {
        try {
          const res = await cropsAPI.getBids(crop.id);
          if (res.data.data) {
            allBids.push(...res.data.data.map((b: any) => ({ ...b, id: b._id || b.id })));
          }
        } catch (e) { /* ignore */ }
      }
      setFarmerBids(allBids.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    if (myCrops.length > 0) loadBids();
  }, [myCrops.length]);

  const getTimeLeft = (expiresAt?: string) => {
    if (!expiresAt) return 'N/A';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m left`;
  };
  
  return (
    <div className="space-y-10 animate-fadeIn font-sans">
      {/* Bento Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <TiltCard className="md:col-span-1">
          <div className="glass p-8 rounded-[2rem] border-2 border-orange-500/20 h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/40">
                <Sprout size={28} />
              </div>
              <span className="text-sm font-extrabold text-green-600 bg-green-100 px-3 py-1 rounded-full">+{myCrops.length > 0 ? '12%' : '0%'}</span>
            </div>
            <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Total Listings</p>
            <h3 className="text-5xl font-extrabold mt-2 text-gray-900">{myCrops.length}</h3>
          </div>
        </TiltCard>

        <TiltCard className="md:col-span-1">
          <div className="glass p-8 rounded-[2rem] border-2 border-amber-500/20 h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/40">
                <Activity size={28} />
              </div>
              <span className="text-sm font-extrabold text-amber-600 bg-amber-100 px-3 py-1 rounded-full tracking-widest">LIVE</span>
            </div>
            <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Active Bids</p>
            <h3 className="text-5xl font-extrabold mt-2 text-gray-900">{activeCount}</h3>
          </div>
        </TiltCard>

        <TiltCard className="md:col-span-1">
          <div className="glass p-8 rounded-[2rem] border-2 border-green-500/20 h-full relative overflow-hidden bg-gradient-to-br from-white to-green-50 cursor-pointer" onClick={() => navigate('/farmer/wallet')}>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/40">
                  <Wallet size={28} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Wallet Balance</p>
              <h3 className="text-4xl font-extrabold mt-2 text-green-700">₹{(state.walletBalance || 0).toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="md:col-span-1">
          <div className="glass p-8 rounded-[2rem] border-2 border-emerald-500/20 h-full relative overflow-hidden bg-gradient-to-br from-white to-emerald-50">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/40">
                  <TrendingUp size={28} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Est. Revenue</p>
              <h3 className="text-4xl font-extrabold mt-2 text-emerald-700">₹{estimatedRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-gray-400 font-bold mt-1 italic">From active listings</p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] text-emerald-900">
               <TrendingUp size={120} />
            </div>
          </div>
        </TiltCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Active Auctions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Auctions</h2>
            <button onClick={() => navigate('/farmer/add-crop')} className="flex items-center gap-3 px-8 py-4 bg-[#C65D3B] text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-orange-900/30 hover:scale-105 transition-all">
              <PlusCircle size={24} /> Add Crop
            </button>
          </div>
          
          {myCrops.filter(c => c.status === 'active').length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-gray-100">
              <Sprout className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400 font-bold text-lg">No active auctions</p>
              <p className="text-sm text-gray-300 mt-1">Add a crop to start receiving bids</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myCrops.filter(c => c.status === 'active').map(crop => (
                <TiltCard key={crop.id}>
                  <div className="bg-white rounded-[2.5rem] overflow-hidden border-2 border-gray-100 group shadow-xl">
                    <div className="h-56 relative">
                      <img src={crop.photoUrl} alt={crop.cropName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-6 left-6">
                        <h4 className="text-3xl font-extrabold text-white">{crop.cropName}</h4>
                        <p className="text-sm text-white/80 font-bold uppercase tracking-widest">{crop.variety} • {crop.quantity} {crop.quantityUnit}</p>
                      </div>
                      {crop.totalBids > 0 && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {crop.totalBids} bids
                        </div>
                      )}
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Highest Bid</span>
                        <span className="text-[#00C853] font-black text-3xl">₹{crop.currentHighestBid.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((crop.currentHighestBid / (crop.basePrice * 2)) * 100, 100)}%` }}
                          className="bg-[#C65D3B] h-full"
                         />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                          <Clock size={18} className="text-amber-600" /> {getTimeLeft(crop.expiresAt)}
                        </div>
                        <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-extrabold hover:bg-black transition-all">View Bids</button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}

          {/* Sold History */}
          {soldCrops.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-extrabold text-gray-900">Sold History</h3>
              {soldCrops.map(crop => (
                <div key={crop.id} className="bg-white rounded-2xl p-6 border-2 border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={crop.photoUrl} alt={crop.cropName} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="font-extrabold text-gray-900">{crop.cropName}</p>
                      <p className="text-xs text-gray-400">Sold to {crop.soldToName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-green-600">₹{(crop.soldPrice || crop.currentHighestBid).toLocaleString()}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✓ Sold</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Recent Bids */}
        <div className="space-y-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recent Bids</h2>
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 shadow-xl space-y-6">
            {farmerBids.length === 0 && state.bids.length === 0 ? (
              <p className="text-gray-400 text-center py-8 font-bold">No bids yet</p>
            ) : (
              (farmerBids.length > 0 ? farmerBids : state.bids).slice(0, 5).map((bid: any) => (
                <div key={bid.id || bid._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-orange-500/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-[#0087FF] font-black text-xl shadow-sm">
                      {bid.buyerName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-gray-900 leading-tight">{bid.buyerName}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{bid.cropName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#00C853]">₹{bid.bidAmount?.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase ${bid.status === 'winning' ? 'text-green-500' : 'text-gray-400'}`}>{bid.status}</p>
                  </div>
                </div>
              ))
            )}
            <button className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest">View All Activity</button>
          </div>

          <div className="bg-[#2D2016] p-8 rounded-[2.5rem] text-white glow-terracotta relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-2xl font-extrabold mb-2">Need help?</h3>
               <p className="text-white/60 font-medium text-sm mb-6">Talk to our agricultural experts about market trends.</p>
               <button className="w-full py-4 bg-white text-[#2D2016] rounded-2xl font-black text-lg shadow-xl">Contact Support</button>
             </div>
             <Leaf className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};
