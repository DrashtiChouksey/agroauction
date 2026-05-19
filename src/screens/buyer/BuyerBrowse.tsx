import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Clock, ShoppingBag, Heart, BarChart3, X, CheckCircle } from 'lucide-react';
import type { AppState, Crop } from '../../types';
import { TiltCard } from '../../components/TiltCard';
import { motion, AnimatePresence } from 'framer-motion';
import { bidsAPI } from '../../api/client';

interface BuyerBrowseProps {
  state: AppState;
  dispatch: React.Dispatch<any>;
}

export const BuyerBrowse = ({ state, dispatch }: BuyerBrowseProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [bidModal, setBidModal] = useState<Crop | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  const filteredCrops = state.crops.filter(c => 
    c.status === 'active' && 
    (c.cropName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (c.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (c as any).farmerName?.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(c => {
    if (filter === 'organic') return c.isOrganic;
    if (filter === 'premium') return c.grade === 'A+' || c.grade === 'A';
    return true;
  });

  const getTimeLeft = (expiresAt?: string) => {
    if (!expiresAt) return '04:20h';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const handlePlaceBid = async () => {
    if (!bidModal || !bidAmount) return;
    setBidLoading(true);
    try {
      const res = await bidsAPI.place({ cropId: bidModal.id, bidAmount: Number(bidAmount) });
      if (res.data.success) {
        setBidSuccess(true);
        dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `Bid of ₹${Number(bidAmount).toLocaleString()} placed!` } });
        // Update crop in state
        dispatch({ type: 'PLACE_BID', payload: {
          id: res.data.data._id || Date.now().toString(),
          cropId: bidModal.id,
          cropName: bidModal.cropName,
          farmerId: bidModal.farmerId,
          farmerName: (bidModal as any).farmerName || '',
          buyerId: state.currentUser?.id || '',
          buyerName: state.currentUser?.name || '',
          bidAmount: Number(bidAmount),
          timestamp: new Date().toISOString(),
          status: 'winning',
        }});
        setTimeout(() => { setBidModal(null); setBidSuccess(false); setBidAmount(''); }, 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Bid failed';
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: msg } });
    } finally {
      setBidLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search and Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 py-4 glass-dark rounded-3xl px-6 border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by crop, variety, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#0087FF]/50 transition-all text-white"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Filter size={18} /> Filters
          </button>
          <select 
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none transition-all appearance-none text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Crops</option>
            <option value="organic">Organic</option>
            <option value="premium">Premium Grade</option>
          </select>
        </div>
      </div>

      {/* Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredCrops.map((crop, index) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TiltCard>
                <div className="glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 group hover:border-[#0087FF]/50 transition-colors shadow-2xl">
                  <div className="h-56 relative overflow-hidden">
                    <img src={crop.photoUrl} alt={crop.cropName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1F0F] via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      {crop.isOrganic && (
                        <span className="glass px-3 py-1 rounded-full text-[10px] font-bold text-[#00E676] border-[#00E676]/30 uppercase tracking-widest">Organic</span>
                      )}
                      <span className="glass px-3 py-1 rounded-full text-[10px] font-bold text-amber-400 border-amber-400/30 uppercase tracking-widest">Grade {crop.grade}</span>
                    </div>
                    <button className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center text-white/50 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold font-playfair">{crop.cropName}</h3>
                        <span className="text-xs text-gray-400 font-mono">{crop.variety}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={14} className="text-[#0087FF]" />
                        {crop.location || 'India'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-3 rounded-2xl border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Current Bid</p>
                        <p className="text-xl font-bold text-[#00E676]">₹{crop.currentHighestBid.toLocaleString()}</p>
                      </div>
                      <div className="glass p-3 rounded-2xl border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Ends In</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          <Clock size={16} className="text-amber-400" /> {getTimeLeft(crop.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20">
                          {(crop as any).farmerName?.charAt(0) || 'F'}
                        </div>
                        <span className="text-sm font-medium text-gray-300">{(crop as any).farmerName || 'Farmer'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0087FF]">
                         <Star size={14} fill="currentColor" />
                         <span className="text-sm font-bold">{(crop as any).farmerRating || '4.5'}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setBidModal(crop); setBidAmount(String(crop.currentHighestBid + 100)); }}
                        className="flex-[2] py-4 bg-[#0087FF] text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(0,135,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        Place Bid <ShoppingBag size={18} />
                      </button>
                      <button className="flex-1 py-4 glass border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                        <BarChart3 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCrops.length === 0 && (
        <div className="py-32 text-center space-y-4">
          <div className="w-20 h-20 glass mx-auto rounded-full flex items-center justify-center text-gray-500">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold">No crops found</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Bid Modal */}
      <AnimatePresence>
        {bidModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setBidModal(null); setBidSuccess(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {bidSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                  <h3 className="text-2xl font-extrabold text-gray-900">Bid Placed!</h3>
                  <p className="text-gray-500 mt-2">₹{Number(bidAmount).toLocaleString()} on {bidModal.cropName}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900">Place Bid</h3>
                      <p className="text-gray-500 text-sm">{bidModal.cropName} - {bidModal.variety}</p>
                    </div>
                    <button onClick={() => setBidModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Current Highest</p>
                      <p className="text-2xl font-black text-green-600">₹{bidModal.currentHighestBid.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold">Base Price</p>
                      <p className="text-lg font-bold text-gray-600">₹{bidModal.basePrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-bold text-gray-600 mb-2 block">Your Bid Amount (₹)</label>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      min={bidModal.currentHighestBid + 100}
                      className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0087FF]/50 text-2xl font-bold text-center"
                      placeholder={String(bidModal.currentHighestBid + 100)}
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center">Minimum bid: ₹{(bidModal.currentHighestBid + 100).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setBidModal(null)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePlaceBid}
                      disabled={bidLoading || Number(bidAmount) <= bidModal.currentHighestBid}
                      className="flex-1 py-4 bg-[#0087FF] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {bidLoading ? 'Placing...' : 'Confirm Bid'} <ShoppingBag size={18} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
