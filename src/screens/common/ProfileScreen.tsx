import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar, ShieldCheck, Mail, Phone, Settings, Camera, LogOut } from 'lucide-react';
import type { AppState } from '../../types';

export const ProfileScreen = ({ state, onLogout }: { state: AppState, onLogout: () => void }) => {
  const user = state.currentUser;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn font-sans">
      <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-[#112A3D] to-[#2D2016] relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* Profile Info */}
        <div className="px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-20">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-5xl font-black text-white overflow-hidden relative">
                  {user?.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Camera className="text-white" size={32} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-2 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                <ShieldCheck className="text-blue-500" size={28} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><MapPin size={16} /> {user?.location || 'New Delhi, India'}</span>
                <span className="flex items-center gap-1"><Calendar size={16} /> Joined Jan 2024</span>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
               <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">Edit Profile</button>
               <button className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all"><Settings size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-tighter">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Email Address</p>
                    <p className="text-lg font-bold text-gray-800 flex items-center gap-2"><Mail size={18} className="text-gray-400" /> {user?.email || 'ram.niwas@demo.in'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Phone Number</p>
                    <p className="text-lg font-bold text-gray-800 flex items-center gap-2"><Phone size={18} className="text-gray-400" /> +91 98765-43210</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-orange-50 rounded-3xl p-6 border-2 border-orange-100">
                  <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-1">Account Role</p>
                  <p className="text-2xl font-black text-orange-900 capitalize">{user?.role}</p>
                </div>
                <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-100">
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Trust Score</p>
                  <p className="text-2xl font-black text-blue-900">4.9 / 5.0</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-xl font-black mb-2">Platform Verification</h3>
                    <p className="text-white/60 text-sm font-medium mb-6">Your identity is fully verified. You can participate in high-value auctions.</p>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[100%] shadow-[0_0_10px_#3B82F6]"></div>
                    </div>
                  </div>
               </div>
               
               <button 
                onClick={onLogout}
                className="w-full py-4 bg-red-50 text-red-600 border-2 border-red-100 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all group"
               >
                 <LogOut className="group-hover:translate-x-1 transition-transform" /> Sign Out
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
