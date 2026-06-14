import React, { useState, useEffect, useReducer, ReactNode, Dispatch } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Activity, Sprout, PlusCircle, 
  BarChart2, Inbox, MessageCircle, User, Settings, LogOut, Bell, Search,
  Heart, Package, Columns, Star, CheckCircle2, AlertTriangle, Globe, Wallet
} from 'lucide-react';
import type { Bid, Toast, AppState, Crop, Transaction } from './types';
import type { User as SeedUser } from './types';
import { seedData } from './seed';
import { cropsAPI, bidsAPI, transactionsAPI, notificationsAPI, authAPI } from './api/client';

import { AuthScreen } from './screens/common/AuthScreen';
import { LandingPage } from './screens/common/LandingPage';
import { LanguageSelection } from './screens/common/LanguageSelection';
import { FarmerDashboard } from './screens/farmer/FarmerDashboard';
import { FarmerAddCrop } from './screens/farmer/FarmerAddCrop';
import { BuyerBrowse } from './screens/buyer/BuyerBrowse';
import { BuyerDashboard } from './screens/buyer/BuyerDashboard';
import { ProfileScreen } from './screens/common/ProfileScreen';

// Translation Logic
const translations: Record<string, any> = {
  en: { dashboard: 'Dashboard', myCrops: 'My Crops', addCrop: 'Add Crop', liveBids: 'Live Bids', analytics: 'Analytics', logout: 'Logout', welcome: 'Welcome back', language: 'Language', profile: 'Profile', browse: 'Marketplace', wallet: 'Wallet' },
  hi: { dashboard: 'डैशबोर्ड', myCrops: 'मेरी फसलें', addCrop: 'फसल जोड़ें', liveBids: 'लाइव बोलियां', analytics: 'विश्लेषण', logout: 'लॉग आउट', welcome: 'वापसी पर स्वागत है', language: 'भाषा', profile: 'प्रोफाइल', browse: 'बाज़ार', wallet: 'बटुआ' },
  mr: { dashboard: 'डॅशबोर्ड', myCrops: 'माझ्या पिकांचे', addCrop: 'पीक जोडा', liveBids: 'थेट बोली', analytics: 'विश्लेषण', logout: 'लॉग आउट', welcome: 'स्वागत आहे', language: 'भाषा', profile: 'प्रोफाइल', browse: 'बाजारपेठ', wallet: 'पाकीट' }
};

// Helper to map MongoDB _id to id
const mapDoc = (doc: any) => ({ ...doc, id: doc._id || doc.id, location: doc.location || doc.state || '' });
const mapDocs = (docs: any[]) => (docs || []).map(mapDoc);

// Reducer
type App1Action = 
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'LOGIN'; payload: SeedUser }
  | { type: 'LOGOUT' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'PLACE_BID'; payload: Bid }
  | { type: 'LOAD_CROPS'; payload: Crop[] }
  | { type: 'LOAD_BIDS'; payload: Bid[] }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: number };

const app1Reducer = (state: AppState, action: App1Action): AppState => {
  switch (action.type) {
    case 'SET_STATE': return action.payload;
    case 'LOGIN': return { ...state, currentUser: action.payload };
    case 'LOGOUT': return { ...state, currentUser: null, transactions: [], walletBalance: 0 };
    case 'SET_LANGUAGE': return { ...state, language: action.payload };
    case 'ADD_TOAST': return { ...state, toasts: [...state.toasts, { ...action.payload, id: Math.random().toString() }] };
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'PLACE_BID': {
      const updatedCrops = state.crops.map(c => c.id === action.payload.cropId ? { ...c, currentHighestBid: action.payload.bidAmount } : c);
      return { ...state, crops: updatedCrops, bids: [action.payload, ...state.bids] };
    }
    case 'LOAD_CROPS': return { ...state, crops: action.payload };
    case 'LOAD_BIDS': return { ...state, bids: action.payload };
    case 'LOAD_TRANSACTIONS': return { ...state, transactions: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_WALLET': return { ...state, walletBalance: action.payload };
    default: return state;
  }
};

const initialState: AppState = { 
  ...seedData, 
  currentUser: null, 
  toasts: [], 
  messages: [], 
  reviews: [], 
  notifications: [], 
  watchlist: [], 
  language: '',
  transactions: [],
  walletBalance: 0,
  loading: false,
} as AppState;

export const FarmerBuyerApp = () => {
  const [state, dispatch] = useReducer(app1Reducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem('kisanBidAppState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed, crops: initial.crops, users: initial.users, bids: initial.bids };
      }
    } catch (e) { console.error(e); }
    return initial;
  });

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  // Fetch real data from API
  const fetchData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [cropsRes, bidsRes] = await Promise.allSettled([
        cropsAPI.getAll(),
        bidsAPI.getMyBids(),
      ]);
      
      if (cropsRes.status === 'fulfilled') {
        dispatch({ type: 'LOAD_CROPS', payload: mapDocs(cropsRes.value.data.data) });
      }
      if (bidsRes.status === 'fulfilled') {
        dispatch({ type: 'LOAD_BIDS', payload: mapDocs(bidsRes.value.data.data) });
      }

      // Fetch transactions if logged in
      const token = localStorage.getItem('kisanbid_token');
      if (token) {
        try {
          const txRes = await transactionsAPI.getMy();
          const txns = mapDocs(txRes.data.data);
          dispatch({ type: 'LOAD_TRANSACTIONS', payload: txns });
          // Calculate wallet balance (for farmers: sum of farmerReceives where payoutStatus='paid')
          const user = JSON.parse(localStorage.getItem('kisanbid_user') || '{}');
          if (user.role === 'farmer') {
            const paid = txns.filter((t: any) => t.farmerId === user._id && t.payoutStatus === 'paid');
            const balance = paid.reduce((sum: number, t: any) => sum + (t.farmerReceives || 0), 0);
            dispatch({ type: 'SET_WALLET', payload: balance });
          }
        } catch (e) { /* No transactions yet */ }
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  useEffect(() => {
    fetchData();
  }, [state.currentUser?.id]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const { loading, ...saveable } = state;
    localStorage.setItem('kisanBidAppState', JSON.stringify(saveable));
  }, [state]);

  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: state.toasts[0].id }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const handleLogin = (name: string, role: 'farmer' | 'buyer', token?: string) => {
    const user = state.users.find(u => u.name === name && u.role === role) || {
      id: Math.random().toString(36).substr(2, 9), name, role, joinedAt: new Date().toISOString()
    };
    dispatch({ type: 'LOGIN', payload: user as SeedUser });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `Welcome back, ${name}!` }});
    // Re-fetch data after login
    setTimeout(() => fetchData(), 500);
  };

  const t = (key: string) => {
    return translations[state.language || 'en']?.[key] || translations['en'][key] || key;
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${state.currentUser?.role === 'farmer' ? 'farmer-theme' : state.currentUser?.role === 'buyer' ? 'buyer-theme' : 'language-selection'}`}>
        
        {/* Custom Cursor */}
        <div className="custom-cursor-dot" style={{ left: cursorPos.x, top: cursorPos.y }}></div>
        <div className="custom-cursor-ring" style={{ 
          left: cursorPos.x, 
          top: cursorPos.y,
          transform: `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`,
          borderColor: isPointer ? '#C65D3B' : 'rgba(255,255,255,0.7)'
        }}></div>

        <Routes>
          <Route path="/" element={
            !state.language ? <LanguageSelection onSelect={(lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang })} /> : <LandingPage />
          } />
          
          <Route path="/signin" element={<AuthScreen onLogin={handleLogin} mode="signin" />} />
          <Route path="/signup" element={<AuthScreen onLogin={handleLogin} mode="signup" />} />
          
          {/* Protected Farmer Routes */}
          <Route path="/farmer/*" element={
            state.currentUser?.role === 'farmer' ? (
              <FarmerLayout state={state} dispatch={dispatch} t={t} fetchData={fetchData}>
                <Routes>
                  <Route path="dashboard" element={<FarmerDashboard state={state} dispatch={dispatch} fetchData={fetchData} setCurrentPage={() => {}} />} />
                  <Route path="add-crop" element={<FarmerAddCrop state={state} dispatch={dispatch} />} />
                  <Route path="wallet" element={<FarmerWallet state={state} />} />
                  <Route path="profile" element={<ProfileScreen state={state} onLogout={() => { localStorage.removeItem('kisanbid_token'); localStorage.removeItem('kisanbid_user'); dispatch({ type: 'LOGOUT' }); }} />} />
                  <Route path="*" element={<div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Sector under construction // Syncing...</div>} />
                </Routes>
              </FarmerLayout>
            ) : <Navigate to="/signin" />
          } />

          {/* Protected Buyer Routes */}
          <Route path="/buyer/*" element={
            state.currentUser?.role === 'buyer' ? (
              <BuyerLayout state={state} dispatch={dispatch} t={t}>
                <Routes>
                  <Route path="dashboard" element={<BuyerDashboard state={state} />} />
                  <Route path="browse" element={<BuyerBrowse state={state} dispatch={dispatch} />} />
                  <Route path="profile" element={<ProfileScreen state={state} onLogout={() => { localStorage.removeItem('kisanbid_token'); localStorage.removeItem('kisanbid_user'); dispatch({ type: 'LOGOUT' }); }} />} />
                  <Route path="*" element={<div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Market sector under construction...</div>} />
                </Routes>
              </BuyerLayout>
            ) : <Navigate to="/signin" />
          } />
        </Routes>

        {/* Global Toasts */}
        <div className="fixed top-5 right-5 z-[9999] space-y-2 flex flex-col items-end pointer-events-none">
          {state.toasts.map(t => (
            <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : t.type === 'error' ? 'toast-error' : 'toast-info'}`}>
              {t.type === 'success' && <CheckCircle2 size={18} />}
              {t.type === 'error' && <AlertTriangle size={18} />}
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </BrowserRouter>
  );
};

// --- FARMER WALLET ---
const FarmerWallet = ({ state }: { state: AppState }) => {
  const txns = state.transactions || [];
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-10 rounded-[2.5rem] text-white shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-widest opacity-80">Wallet Balance</p>
        <h2 className="text-6xl font-black mt-3">₹{(state.walletBalance || 0).toLocaleString('en-IN')}</h2>
        <p className="mt-3 text-green-200 text-sm">From {txns.filter(t => t.payoutStatus === 'paid').length} completed payouts</p>
      </div>

      <h3 className="text-2xl font-extrabold text-gray-900">Transaction History</h3>
      {txns.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-gray-100">
          <Wallet className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 font-bold">No transactions yet</p>
          <p className="text-sm text-gray-300 mt-1">Payments will appear here after auctions close</p>
        </div>
      ) : (
        <div className="space-y-4">
          {txns.map((tx: Transaction) => (
            <div key={tx.id} className="bg-white rounded-2xl p-6 border-2 border-gray-100 flex justify-between items-center hover:shadow-lg transition-all">
              <div>
                <p className="font-extrabold text-lg text-gray-900">{tx.cropName}</p>
                <p className="text-sm text-gray-400">Buyer: {tx.buyerName}</p>
                <p className="text-xs text-gray-300 mt-1">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-600">₹{(tx.farmerReceives || 0).toLocaleString('en-IN')}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tx.payoutStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {tx.payoutStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- FARMER LAYOUT ---
const FarmerLayout = ({ children, state, dispatch, t, fetchData }: { children: ReactNode; state: AppState; dispatch: Dispatch<any>; t: (k: string) => string; fetchData: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { id: 'dashboard', icon: Activity, label: t('dashboard') },
    { id: 'crops', icon: Sprout, label: t('myCrops') },
    { id: 'add-crop', icon: PlusCircle, label: t('addCrop') },
    { id: 'wallet', icon: Wallet, label: t('wallet') },
    { id: 'analytics', icon: BarChart2, label: t('analytics') },
    { id: 'profile', icon: User, label: t('profile') },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#FAF7F2]">
      <aside className="sidebar-farmer flex flex-col text-white">
        <div className="sidebar-user-info mb-12">
          <div className="flex items-center gap-4 px-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C65D3B] to-[#D4A574] flex items-center justify-center font-bold text-xl text-white shadow-xl">
              {state.currentUser?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">{state.currentUser?.name}</h3>
              <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest mt-1">Prime Farmer</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1">
          {menu.map(m => (
            <div key={m.id} 
                className={`sidebar-nav-item cursor-pointer ${location.pathname.includes(m.id) ? 'active' : ''}`}
                onClick={() => navigate(`/farmer/${m.id}`)}>
              <m.icon className="icon-main" size={22} />
              <span className="ml-4">{m.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="sidebar-footer mt-auto pt-6 border-t border-white/5">
          <div onClick={() => { localStorage.removeItem('kisanbid_token'); localStorage.removeItem('kisanbid_user'); dispatch({ type: 'LOGOUT' }); navigate('/'); }} className="sidebar-nav-item text-red-400 hover:bg-red-500/10 cursor-pointer">
            <LogOut size={22} /> <span className="ml-4">{t('logout')}</span>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden bg-[#FAF7F2]">
        <header className="h-20 bg-white border-b-2 border-gray-100 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight capitalize">{location.pathname.split('/').pop()}</h2>
          <div className="flex items-center gap-6">
            {/* Wallet quick view */}
            <div className="bg-green-50 px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-green-100 transition-all" onClick={() => navigate('/farmer/wallet')}>
              <Wallet size={18} className="text-green-600" />
              <span className="font-extrabold text-green-700">₹{(state.walletBalance || 0).toLocaleString('en-IN')}</span>
            </div>
             <div className="text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('welcome')}</p>
              <p className="text-lg font-extrabold text-gray-900">{state.currentUser?.name?.split(' ')[0]}!</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 font-bold border-2 border-gray-100">
              {state.currentUser?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- BUYER LAYOUT ---
const BuyerLayout = ({ children, state, dispatch, t }: { children: ReactNode; state: AppState; dispatch: Dispatch<any>; t: (k: string) => string; }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { id: 'dashboard', icon: Activity, label: t('dashboard') },
    { id: 'browse', icon: ShoppingBag, label: t('browse') },
    { id: 'watchlist', icon: Heart, label: 'Watchlist' },
    { id: 'profile', icon: User, label: t('profile') },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#F4F7F9]">
      <aside className="sidebar-buyer flex flex-col text-white">
        <div className="sidebar-user-info mb-12">
          <div className="flex items-center gap-4 px-2 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0087FF] flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-blue-500/30">
              {state.currentUser?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">{state.currentUser?.name}</h3>
              <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1">Verified Buyer</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1">
          {menu.map(m => (
            <div key={m.id} 
                className={`sidebar-nav-item cursor-pointer ${location.pathname.includes(m.id) ? 'active' : ''}`}
                style={location.pathname.includes(m.id) ? { backgroundColor: '#0087FF' } : {}}
                onClick={() => navigate(`/buyer/${m.id}`)}>
              <m.icon className="icon-main" size={22} />
              <span className="ml-4">{m.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="sidebar-footer mt-auto pt-6 border-t border-white/5">
          <div onClick={() => { localStorage.removeItem('kisanbid_token'); localStorage.removeItem('kisanbid_user'); dispatch({ type: 'LOGOUT' }); navigate('/'); }} className="sidebar-nav-item text-red-400 hover:bg-red-500/10 cursor-pointer">
            <LogOut size={22} /> <span className="ml-4">{t('logout')}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b-2 border-gray-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input type="text" placeholder="Search crops, farmers..." className="w-full h-12 pl-12 pr-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0087FF]/30 font-bold" />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-6">
            <button className="relative p-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-2xl">
              <Bell size={24} />
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0087FF] to-[#005AB3] flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {state.currentUser?.name?.charAt(0)}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
