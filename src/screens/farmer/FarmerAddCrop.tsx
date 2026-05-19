import React, { useState, Dispatch } from 'react';
import { PlusCircle, Image as ImageIcon, ChevronRight, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AppState } from '../../types';
import { cropsAPI } from '../../api/client';

export const FarmerAddCrop = ({ state, dispatch }: { state: AppState, dispatch: Dispatch<any> }) => { 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    quantity: '',
    unit: 'quintal',
    basePrice: '',
    isOrganic: false,
    grade: 'A',
    season: 'Kharif',
    photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        cropName: formData.cropName,
        variety: formData.variety,
        quantity: Number(formData.quantity),
        quantityUnit: formData.unit,
        basePrice: Number(formData.basePrice),
        isOrganic: formData.isOrganic,
        grade: formData.grade,
        season: formData.season,
        photoUrl: formData.photoUrl,
        harvestDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      };
      await cropsAPI.create(payload);
      dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: 'Auction launched successfully!' }});
      navigate('/farmer/dashboard');
    } catch (err: any) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: err.response?.data?.message || 'Failed to create auction' }});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn font-sans">
      <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none text-[#2D2016]">
           <Leaf size={240} />
        </div>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl">
            <PlusCircle size={36} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Create New Auction</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Listing ID: #KB-{Math.floor(Math.random()*10000)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Crop Type</label>
              <input type="text" className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] focus:ring-4 focus:ring-[#C65D3B]/10 transition-all text-gray-900 font-bold text-lg" placeholder="e.g. Basmati Rice" value={formData.cropName} onChange={e => setFormData({...formData, cropName: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Variety / Specification</label>
              <input type="text" className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] focus:ring-4 focus:ring-[#C65D3B]/10 transition-all text-gray-900 font-bold text-lg" placeholder="e.g. Grade A+ Long Grain" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Total Quantity</label>
              <div className="flex gap-4">
                <input type="number" className="flex-1 h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] focus:ring-4 focus:ring-[#C65D3B]/10 transition-all text-gray-900 font-bold text-lg" placeholder="0.00" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                <select className="w-40 h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] transition-all text-gray-900 font-bold appearance-none cursor-pointer" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option value="quintal">Quintal</option>
                  <option value="kg">KG</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Starting Bid Price (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₹</span>
                <input type="number" className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-14 pr-6 focus:outline-none focus:border-[#C65D3B] focus:ring-4 focus:ring-[#C65D3B]/10 transition-all text-gray-900 font-bold text-xl" placeholder="0" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Grade</label>
              <select className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] transition-all text-gray-900 font-bold appearance-none cursor-pointer" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                <option value="A+">Grade A+</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Season</label>
              <select className="w-full h-16 bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 focus:outline-none focus:border-[#C65D3B] transition-all text-gray-900 font-bold appearance-none cursor-pointer" value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})}>
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Summer">Summer</option>
                <option value="Zaid">Zaid</option>
              </select>
            </div>
          </div>

          <div className="p-16 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-gray-400 gap-6 hover:border-[#C65D3B]/30 hover:bg-orange-50/30 transition-all cursor-pointer group">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform shadow-inner">
               <ImageIcon size={40} />
            </div>
            <div className="text-center">
              <span className="block font-black text-gray-900 text-lg mb-1">Upload Product Photos</span>
              <span className="text-xs font-bold uppercase tracking-widest">Supports JPG, PNG (Max 10MB)</span>
            </div>
          </div>

          <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-[2rem] border-2 border-gray-100">
            <input type="checkbox" id="organic" className="w-8 h-8 rounded-xl border-2 border-gray-200 text-[#C65D3B] focus:ring-[#C65D3B] transition-all cursor-pointer" checked={formData.isOrganic} onChange={e => setFormData({...formData, isOrganic: e.target.checked})} />
            <label htmlFor="organic" className="text-lg font-bold text-gray-700 cursor-pointer select-none">
              Verify as <span className="text-green-600 font-black underline decoration-2 underline-offset-4">100% Organic Yield</span>
            </label>
          </div>

          <div className="flex gap-6 pt-4">
            <button type="button" onClick={() => navigate('/farmer/dashboard')} className="flex-1 h-18 py-5 border-2 border-gray-100 text-gray-500 rounded-[2rem] font-black text-lg hover:bg-gray-50 transition-all">
              Discard Draft
            </button>
            <button type="submit" disabled={loading} className="flex-[2] h-18 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? 'Creating...' : 'Launch Live Auction'} <ChevronRight size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
