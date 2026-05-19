import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Clock, Star, MapPin, Search, Filter, ArrowUpRight } from 'lucide-react';
import type { AppState, Crop, Bid } from '../../types';
import { TiltCard } from '../../components/TiltCard';
import { useNavigate } from 'react-router-dom';

export const BuyerDashboard = ({ state }: { state: AppState }) => {
  const navigate = useNavigate();
  const myBids = state.bids.filter(b => b.buyerId === state.currentUser?.id || b.buyerName === state.currentUser?.name);
  const recommendations = state.crops.filter(c => c.status === 'active').slice(0, 3);
  const completedTxns = (state.transactions || []).filter(t => t.status === 'completed');

  return (
    <div className="space-y-10 animate-fadeIn font-sans">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0087FF] to-[#005AB3] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">Expand Your Inventory</h2>
                <p className="text-white/80 text-lg font-medium max-w-md">Discover high-quality yields from certified farmers across India. Start bidding today.</p>
                <button 
                  onClick={() => navigate('/buyer/browse')}
                  className="px-8 py-4 bg-white text-[#0087FF] rounded-2xl font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 transition-all"
                >
                  Browse Market <Search size={24} />
                </button>
             </div>
             <ShoppingBag className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white" size={240} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TiltCard>
                <div className="glass p-8 rounded-[2rem] border-2 border-blue-500/10 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/40">
                      <TrendingUp size={28} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Active Bids</p>
                  <h3 className="text-5xl font-extrabold mt-2 text-gray-900">{myBids.length}</h3>
                </div>
              </TiltCard>

              <TiltCard>
                <div className="glass p-8 rounded-[2rem] border-2 border-green-500/10 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/40">
                      <ShoppingBag size={28} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-extrabold uppercase tracking-widest">Successful Procurements</p>
                  <h3 className="text-5xl font-extrabold mt-2 text-gray-900">{completedTxns.length}</h3>
                </div>
              </TiltCard>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 shadow-xl">
              <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={24} /> Market Trends
              </h3>
              <div className="space-y-6">
                 {[
                   { crop: 'Basmati Rice', change: '+5.2%', up: true },
                   { crop: 'Organic Wheat', change: '+2.1%', up: true },
                   { crop: 'Cotton (Pusa)', change: '-1.4%', up: false },
                 ].map((trend, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                      <span className="font-bold text-gray-900">{trend.crop}</span>
                      <span className={`font-black ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.change}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-[#112A3D] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-extrabold mb-4">Quality Guaranteed</h3>
              <p className="text-white/60 text-sm font-medium mb-6">Every farmer on Kisan Bid is verified with a minimum 4.5 rating.</p>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-sm transition-all">Learn About Verification</button>
           </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recommended for You</h2>
          <button onClick={() => navigate('/buyer/browse')} className="text-blue-600 font-extrabold flex items-center gap-1 hover:underline">
            View All <ArrowUpRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map(crop => (
            <TiltCard key={crop.id}>
              <div className="bg-white rounded-[2.5rem] overflow-hidden border-2 border-gray-100 group shadow-xl transition-all hover:border-blue-500/30">
                <div className="h-48 relative">
                  <img src={crop.photoUrl} alt={crop.cropName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <h4 className="text-2xl font-extrabold text-white">{crop.cropName}</h4>
                    <p className="text-xs text-white/60 font-bold uppercase tracking-widest">{crop.variety}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase">
                       <MapPin size={14} className="text-blue-500" /> {crop.location || 'Punjab'}
                     </div>
                     <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                       <Star size={14} fill="currentColor" /> {crop.farmerRating}
                     </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Current Bid</p>
                      <p className="text-2xl font-black text-blue-600">₹{crop.currentHighestBid.toLocaleString()}</p>
                    </div>
                    <button className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-extrabold text-xs hover:bg-blue-600 hover:text-white transition-all">Bid Now</button>
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};
