import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Users, List, CreditCard, ShieldAlert, FileText, Settings, Search, Bell, LogOut, ShieldCheck, ChevronRight, PlayCircle } from 'lucide-react';
import { authAPI, adminAPI } from './api/client';
import { AdminDashboard } from './screens/admin/AdminDashboard';
import { AdminComplaints } from './screens/admin/AdminComplaints';
import { AdminLiveAuctions } from './screens/admin/AdminLiveAuctions';

const AdminLogin = ({ onLogin }: { onLogin: (email: string, password: string, secret: string) => void }) => {
  const [email, setEmail] = useState('admin@kisanbid.com');
  const [password, setPassword] = useState('ADMIN_2026');
  const [secret, setSecret] = useState('ADMIN_2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try { await onLogin(email, password, secret); }
    catch (e: any) { setError(e.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-html min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="admin-card w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,217,255,0.1)] border-[#00D9FF]/20 admin-fade">
        <div className="text-center mb-8">
          <h1 className="text-[#00D9FF] text-xl font-bold tracking-[0.2em] mb-2">KISAN BID // ADMIN CONSOLE</h1>
          <div className="text-[#8B949E] text-xs">AUTHORIZED ACCESS ONLY <span className="inline-block w-2 h-4 bg-[#00D9FF] blink ml-1 align-middle"></span></div>
        </div>
        {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs">{error}</div>}
        <div className="space-y-5">
          <div><label className="block text-xs text-[#8B949E] mb-1">EMAIL</label><input type="email" className="admin-input w-full" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="block text-xs text-[#8B949E] mb-1">PASSWORD</label><input type="password" className="admin-input w-full" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div><label className="block text-xs text-[#8B949E] mb-1">SECRET CODE</label><input type="password" className="admin-input w-full" value={secret} onChange={e => setSecret(e.target.value)} /></div>
          <button onClick={handleSubmit} disabled={loading} className="admin-btn btn-cyan w-full mt-4 h-10 flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = ({ children, adminUser, onLogout, data }: { children: React.ReactNode; adminUser: any; onLogout: () => void; data: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = [
    { id: 'dashboard', icon: Activity, label: 'Overview' },
    { id: 'live', icon: PlayCircle, label: 'Live Auctions' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'complaints', icon: ShieldAlert, label: 'Complaints' },
    { id: 'transactions', icon: CreditCard, label: 'Transactions' },
    { id: 'logs', icon: FileText, label: 'Activity Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
  return (
    <div className="admin-html flex min-h-screen">
      <aside className="admin-sidebar z-50">
        <div className="flex items-center gap-3 mb-8 px-2"><ShieldCheck className="text-[#00D9FF]" size={24} /><span className="font-bold tracking-wider text-sm">KB ADMIN</span></div>
        <div className="px-2 mb-6 flex items-center gap-2 text-[10px] text-[#00E676] bg-[#00E676]/10 py-1.5 rounded border border-[#00E676]/20"><span className="green-dot ml-1"></span> ALL SYSTEMS NOMINAL</div>
        <nav className="space-y-1">
          {menu.map(m => (
            <div key={m.id} onClick={() => navigate(`/admin/${m.id}`)} className={`sidebar-nav-item ${location.pathname.includes(m.id) ? 'active' : ''}`}>
              <m.icon size={16} /> {m.label}
              {m.id === 'complaints' && data.complaints?.length > 0 && <span className="ml-auto bg-[#FF006E] text-white text-[9px] px-1.5 py-0.5 rounded">{data.complaints.filter((c: any) => c.status !== 'resolved').length}</span>}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <div className="border-t border-[#21262D] pt-4">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded bg-[#1C2430] flex items-center justify-center text-xs border border-[#30363D]">A1</div>
              <div className="text-xs"><div className="text-[#E6EDF3]">{adminUser?.name}</div><div className="text-[#8B949E] text-[10px]">Level 5 Access</div></div>
            </div>
            <button onClick={onLogout} className="sidebar-nav-item w-full text-[#FF3B3B] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10"><LogOut size={16} /> Terminate Session</button>
          </div>
        </div>
      </aside>
      <div className="admin-main flex-1 flex flex-col">
        <header className="admin-topbar">
          <div className="text-xs text-[#00D9FF] tracking-widest font-bold">ADMIN CONSOLE v2.1.4 <span className="inline-block w-1.5 h-3 bg-[#00D9FF] blink ml-1 align-middle"></span></div>
          <div className="flex-1 max-w-md ml-8 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" size={14} /><input type="text" placeholder="Search users, crops, bids..." className="admin-input w-full pl-9 h-8 rounded bg-[#0A0E13]" /></div>
          <div className="ml-auto flex items-center gap-6 text-xs text-[#8B949E]"><span>Last sync: just now</span><Bell size={16} className="cursor-pointer hover:text-[#E6EDF3]" /></div>
        </header>
        <main className="p-6 flex-1 overflow-auto admin-fade">{children}</main>
      </div>
    </div>
  );
};

export const AdminApp = () => {
  const [adminUser, setAdminUser] = useState<any>(() => {
    try { const s = localStorage.getItem('kisanbid_admin'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [data, setData] = useState<any>({ users: [], crops: [], bids: [], complaints: [], logs: [], dashboard: {} });

  const fetchAdminData = async () => {
    try {
      const [dashRes, usersRes, cropsRes, complaintsRes, logsRes] = await Promise.allSettled([
        adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getLiveAuctions(),
        adminAPI.getComplaints(), adminAPI.getActivityLogs(),
      ]);
      setData({
        dashboard: dashRes.status === 'fulfilled' ? dashRes.value.data.data : {},
        users: usersRes.status === 'fulfilled' ? usersRes.value.data.data : [],
        crops: cropsRes.status === 'fulfilled' ? cropsRes.value.data.data : [],
        complaints: complaintsRes.status === 'fulfilled' ? complaintsRes.value.data.data : [],
        logs: logsRes.status === 'fulfilled' ? logsRes.value.data.data : [],
      });
    } catch (e) { console.error('Admin fetch error:', e); }
  };

  useEffect(() => { if (adminUser) fetchAdminData(); }, [adminUser]);

  const handleLogin = async (email: string, password: string, secret: string) => {
    const res = await authAPI.adminLogin(email, password, secret);
    const { user, token } = res.data.data;
    localStorage.setItem('kisanbid_token', token);
    localStorage.setItem('kisanbid_admin', JSON.stringify(user));
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('kisanbid_token');
    localStorage.removeItem('kisanbid_admin');
    setAdminUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={adminUser ? <Navigate to="/admin/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={adminUser ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLogin={handleLogin} />} />
        <Route path="/admin/*" element={
          adminUser ? (
            <AdminLayout adminUser={adminUser} onLogout={handleLogout} data={data}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard data={data} />} />
                <Route path="live" element={<AdminLiveAuctions crops={data.crops} />} />
                <Route path="users" element={<AdminUsersPage users={data.users} />} />
                <Route path="complaints" element={<AdminComplaints complaints={data.complaints} />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="logs" element={<AdminLogsPage logs={data.logs} />} />
                <Route path="*" element={<div className="admin-card text-center p-12 text-[#8B949E]">Module initializing...</div>} />
              </Routes>
            </AdminLayout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Inline admin pages for users, transactions, logs
const AdminUsersPage = ({ users }: { users: any[] }) => (
  <div className="space-y-6 admin-fade">
    <h2 className="text-xl font-bold tracking-widest flex items-center gap-3"><Users className="text-[#00D9FF]" size={24} /> USER_REGISTRY</h2>
    <p className="text-xs text-gray-500 font-mono">TOTAL_REGISTERED: {users.length}</p>
    <div className="space-y-3">
      {(users || []).map((u: any) => (
        <div key={u._id} className="admin-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#1C2430] flex items-center justify-center text-sm font-bold border border-[#30363D]">{u.name?.charAt(0)}</div>
            <div><div className="font-bold text-sm">{u.name}</div><div className="text-[10px] text-gray-500 font-mono">{u.email}</div></div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] px-2 py-1 rounded font-bold ${u.role === 'admin' ? 'bg-[#FF006E]/20 text-[#FF006E]' : u.role === 'farmer' ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-[#00D9FF]/20 text-[#00D9FF]'}`}>{u.role?.toUpperCase()}</span>
            <span className={`text-[10px] px-2 py-1 rounded font-bold ${u.status === 'active' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'}`}>{u.status?.toUpperCase()}</span>
            <span className="text-xs text-gray-500">★ {u.rating || '-'}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminTransactionsPage = () => {
  const [txns, setTxns] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try { const r = await adminAPI.getUsers({ role: 'admin' }); /* fallback */ } catch {}
      try {
        const res = await fetch('http://localhost:5000/api/transactions/all', { headers: { Authorization: `Bearer ${localStorage.getItem('kisanbid_token')}` } });
        const d = await res.json(); if (d.data) setTxns(d.data);
      } catch { /* no admin txn endpoint - show from seed */ }
    })();
  }, []);
  return (
    <div className="space-y-6 admin-fade">
      <h2 className="text-xl font-bold tracking-widest flex items-center gap-3"><CreditCard className="text-[#00E676]" size={24} /> TRANSACTION_LEDGER</h2>
      {txns.length === 0 ? <div className="admin-card p-12 text-center text-gray-500 font-mono">Loading transaction data from database...</div> : txns.map((t: any) => (
        <div key={t._id} className="admin-card p-5 flex justify-between items-center border-l-2 border-l-[#00E676]">
          <div><div className="font-bold text-sm">{t.cropName}</div><div className="text-[10px] text-gray-500">{t.farmerName} → {t.buyerName}</div></div>
          <div className="text-right"><div className="font-bold text-[#00E676] font-mono">₹{t.totalAmount?.toLocaleString()}</div><div className="text-[10px] text-gray-500">{t.status}</div></div>
        </div>
      ))}
    </div>
  );
};

const AdminLogsPage = ({ logs }: { logs: any[] }) => (
  <div className="space-y-6 admin-fade">
    <h2 className="text-xl font-bold tracking-widest flex items-center gap-3"><FileText className="text-[#FFB800]" size={24} /> ACTIVITY_LOGS</h2>
    <div className="space-y-3">
      {(logs || []).map((l: any, i: number) => (
        <div key={i} className="admin-card p-5 flex items-center gap-6 border-l-2 border-l-[#FFB800]">
          <div className="text-[10px] text-gray-600 font-mono w-32">{new Date(l.createdAt || l.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</div>
          <div><div className="font-bold text-sm">{l.action}</div><div className="text-[10px] text-gray-500">{l.details || `${l.target} ${l.targetId}`}</div></div>
          <div className="ml-auto text-[10px] text-gray-500 font-mono">{l.adminName}</div>
        </div>
      ))}
      {(!logs || logs.length === 0) && <div className="admin-card p-12 text-center text-gray-500 font-mono">No activity logs found</div>}
    </div>
  </div>
);
