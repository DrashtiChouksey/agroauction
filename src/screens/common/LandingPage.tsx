import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, Link2Off, EyeOff, Unplug, ArrowRight, CheckCircle, Activity, Heart, MessageCircle, Star } from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1F0F] text-white overflow-hidden mesh-bg preserve-3d landing-page">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-12 py-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <Leaf className="text-[#C65D3B]" size={32} />
          <span className="font-playfair font-black text-2xl tracking-tighter text-[#1A1A1A]">KISAN BID</span>
        </div>
        <div className="hidden md:flex gap-12 text-sm font-black uppercase tracking-widest text-gray-500">
          <a href="#home" className="hover:text-[#C65D3B] transition-colors">Home</a>
          <a href="#problem" className="hover:text-[#C65D3B] transition-colors">Problem</a>
          <a href="#how" className="hover:text-[#C65D3B] transition-colors">How It Works</a>
          <a href="#features" className="hover:text-[#C65D3B] transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/signin')} className="text-sm font-black uppercase tracking-widest text-[#1A1A1A] hover:text-[#C65D3B] transition-all">Sign In</button>
          <button onClick={() => navigate('/signup')} className="px-8 py-3 rounded-2xl bg-[#C65D3B] text-white font-black text-sm hover:scale-105 shadow-xl shadow-orange-900/20 transition-all flex items-center gap-2">
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen pt-32 px-8 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto relative preserve-3d">
        <div className="md:w-1/2 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full border border-[#C65D3B]/50 text-[#D4A574] text-sm mb-6 bg-[#C65D3B]/10 backdrop-blur-md"
          >
            🌾 India's #1 Agricultural Marketplace
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold font-playfair leading-tight mb-6"
          >
            Sell Your Crops <br/>
            <span className="bg-gradient-to-r from-[#C65D3B] to-[#D4A574] text-transparent bg-clip-text">At The Best Price</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-10 max-w-lg leading-relaxed"
          >
            Direct farm-to-buyer live auctions. Zero middlemen. Maximum profit for farmers. Best quality for buyers.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button onClick={() => navigate('/signup')} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#C65D3B] to-[#A84D2F] font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(198,93,59,0.5)] transition-all flex items-center gap-2">
              🌾 Start as Farmer
            </button>
            <button onClick={() => navigate('/signup')} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#0087FF] to-[#006FD6] font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(0,135,255,0.5)] transition-all flex items-center gap-2">
              🛒 Browse as Buyer
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 flex gap-8 border-t border-white/10 pt-8"
          >
            <div><div className="text-3xl font-bold text-[#D4A574]">2,450+</div><div className="text-sm text-gray-400">Farmers</div></div>
            <div><div className="text-3xl font-bold text-[#0087FF]">8,900+</div><div className="text-sm text-gray-400">Auctions</div></div>
            <div><div className="text-3xl font-bold text-[#00E676]">₹45Cr+</div><div className="text-sm text-gray-400">GMV</div></div>
          </motion.div>
        </div>

        <div className="md:w-1/2 relative h-[600px] hidden md:block preserve-3d">
          <TiltCard className="absolute top-20 right-10 w-80 z-20">
            <div className="glass-dark p-4 rounded-2xl glow-terracotta relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" alt="Rice" className="w-full h-48 object-cover rounded-xl mb-4" />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">Premium Basmati</h3>
                  <p className="text-sm text-gray-400">Ram Niwas Singh • MP</p>
                </div>
                <span className="bg-[#C65D3B]/20 text-[#C65D3B] px-2 py-1 rounded text-xs font-bold border border-[#C65D3B]/30">Grade A+</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Current Bid</p>
                  <p className="text-xl font-bold text-[#00E676]">₹3,100<span className="text-sm text-gray-400 font-normal">/q</span></p>
                </div>
                <button className="px-4 py-2 bg-[#0087FF] rounded-lg text-sm font-bold">Bid Now</button>
              </div>
            </div>
          </TiltCard>

          {/* Floating Toasts */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-80 glass p-3 rounded-xl flex items-center gap-3 z-30"
          >
            <div className="w-8 h-8 rounded-full bg-[#C65D3B]/20 flex items-center justify-center text-[#C65D3B]"><Activity size={16}/></div>
            <div className="text-sm">🔥 New bid: <b>₹3,100</b> on Basmati</div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 right-20 glass p-3 rounded-xl flex items-center gap-3 z-30"
          >
            <div className="w-8 h-8 rounded-full bg-[#00E676]/20 flex items-center justify-center text-[#00E676]"><CheckCircle size={16}/></div>
            <div className="text-sm">✅ Sold! Wheat for <b>₹3,900</b></div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-32 px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-4">Why We Built KISAN BID</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">140 million Indian farmers. 40-60% income lost to middlemen. We're changing that.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 preserve-3d">
          <TiltCard>
            <div className="glass-dark p-8 rounded-2xl h-full border-t border-t-[#FF3B3B]/50 glow-terracotta group hover:bg-[#FF3B3B]/5 transition-colors">
              <Link2Off className="text-[#FF3B3B] mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">The Middleman Crisis</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Farmers lose ₹2.3 Lakh Crore annually to commission agents. A crop sold for ₹10,000 yields only ₹4,000–6,000 after cuts.</p>
              <div className="inline-block px-3 py-1 bg-[#FF3B3B]/20 text-[#FF3B3B] rounded-full text-sm font-bold border border-[#FF3B3B]/30">Up to 60% income stolen</div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-dark p-8 rounded-2xl h-full border-t border-t-[#FFB800]/50 glow-amber group hover:bg-[#FFB800]/5 transition-colors">
              <EyeOff className="text-[#FFB800] mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">Zero Price Visibility</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">68% of Indian farmers have no idea what their crop is worth in the real market. They accept whatever price is offered.</p>
              <div className="inline-block px-3 py-1 bg-[#FFB800]/20 text-[#FFB800] rounded-full text-sm font-bold border border-[#FFB800]/30">68% farmers price-blind</div>
            </div>
          </TiltCard>

          <TiltCard>
            <div className="glass-dark p-8 rounded-2xl h-full border-t border-t-[#0087FF]/50 glow-blue group hover:bg-[#0087FF]/5 transition-colors">
              <Unplug className="text-[#0087FF] mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4">No Direct Market Access</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">Exporters and food companies want to buy directly but can't reach farmers at scale. 3–5 middlemen sit between farm and table.</p>
              <div className="inline-block px-3 py-1 bg-[#0087FF]/20 text-[#0087FF] rounded-full text-sm font-bold border border-[#0087FF]/30">3–5 intermediaries per sale</div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 glass mt-32">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Leaf className="text-[#C65D3B]" size={24} />
          <span className="font-playfair font-bold text-xl text-white">KISAN BID</span>
        </div>
        <p className="mb-4">Made with ❤️ for India's Farmers by Final Year Project 2026</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};
