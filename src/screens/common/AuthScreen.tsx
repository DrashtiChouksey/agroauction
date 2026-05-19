import React, { useState } from 'react';
import { Leaf, CheckCircle2, Tractor, ShoppingBag, ChevronRight, Eye, EyeOff, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/client';

interface AuthScreenProps {
  onLogin: (name: string, role: 'farmer' | 'buyer', token?: string) => void;
  mode: 'signin' | 'signup';
}

export const AuthScreen = ({ onLogin, mode }: AuthScreenProps) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [devOtp, setDevOtp] = useState(''); // For dev mode convenience

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!otpSent) {
          // Step 1: Send OTP
          const otpPayload = otpMethod === 'email' ? { email } : { phone };
          const otpRes = await authAPI.sendOTP(otpPayload);
          setOtpSent(true);
          setOtpStep(true);
          if (otpRes.data.data?.otp) {
            setDevOtp(otpRes.data.data.otp); // Dev mode auto-fill
          }
          setLoading(false);
          return;
        }

        if (otpStep && !otp) {
          setError('Please enter the OTP');
          setLoading(false);
          return;
        }

        // Step 2: Verify OTP
        if (otpStep) {
          const verifyPayload = otpMethod === 'email' ? { email, otp } : { phone, otp };
          const verifyRes = await authAPI.verifyOTP(verifyPayload);
          if (!verifyRes.data.data?.verified) {
            setError('OTP verification failed');
            setLoading(false);
            return;
          }
        }

        // Step 3: Register
        const regRes = await authAPI.register({ name, email, password, role });
        const { user, token } = regRes.data.data;
        localStorage.setItem('kisanbid_token', token);
        localStorage.setItem('kisanbid_user', JSON.stringify(user));
        onLogin(user.name, user.role, token);
        navigate(`/${user.role}/dashboard`);
      } else {
        // Login
        const loginRes = await authAPI.login(email, password);
        const { user, token } = loginRes.data.data;
        localStorage.setItem('kisanbid_token', token);
        localStorage.setItem('kisanbid_user', JSON.stringify(user));
        onLogin(user.name, user.role, token);
        navigate(`/${user.role}/dashboard`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole: 'farmer' | 'buyer') => {
    setLoading(true);
    setError('');
    try {
      const demoEmail = demoRole === 'farmer' ? 'farmer@kisanbid.com' : 'buyer@kisanbid.com';
      const loginRes = await authAPI.login(demoEmail, 'password123');
      const { user, token } = loginRes.data.data;
      localStorage.setItem('kisanbid_token', token);
      localStorage.setItem('kisanbid_user', JSON.stringify(user));
      onLogin(user.name, user.role, token);
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-inter preserve-3d">
      {/* Left Panel */}
      <div className="w-[55%] hidden lg:flex flex-col justify-center px-16 relative overflow-hidden mesh-bg preserve-3d">
        <div className="relative z-10 text-white animate-slideInRight">
          <div className="glass-dark p-6 rounded-2xl glow-terracotta relative overflow-hidden max-w-sm transform rotate-y-[-10deg] rotate-x-[5deg] translate-z-[50px] shadow-2xl">
            <h3 className="font-bold text-xl mb-4 italic">"KISAN BID got me 40% more than the local mandi."</h3>
            <p className="text-sm text-gray-300">— Ram Niwas Singh, Farmer</p>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-gray-50 p-8 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-10 relative z-10">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <Leaf className="text-[#C65D3B]" size={32} />
            <span className="text-2xl font-bold font-playfair tracking-wide">KISAN BID</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {otpStep ? 'Verify OTP' : mode === 'signin' ? 'Welcome back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {otpStep ? `Enter the 6-digit code sent to your ${otpMethod}` : mode === 'signin' ? 'Enter your details to sign in' : 'Start your journey with us'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {otpStep ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D3B]/50 transition-all text-center text-2xl tracking-[0.5em] font-bold" 
                  placeholder="------" 
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              {devOtp && (
                <div className="text-xs text-blue-500 bg-blue-50 p-2 rounded-lg text-center">
                  🔧 Dev Mode: OTP is <b>{devOtp}</b> 
                  <button type="button" onClick={() => setOtp(devOtp)} className="ml-2 underline">Auto-fill</button>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full h-12 mt-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all bg-gradient-to-r from-[#C65D3B] to-[#D4A574] hover:shadow-[0_0_20px_rgba(198,93,59,0.4)] active:scale-95 disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Create Account'} <CheckCircle2 size={18} />
              </button>

              <button type="button" onClick={() => { setOtpStep(false); setOtpSent(false); setOtp(''); }} className="w-full text-sm text-gray-500 hover:text-[#C65D3B] flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Go back
              </button>
            </form>
          ) : (
            <>
              <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">{mode === 'signin' ? 'sign in' : 'sign up'} with email</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div 
                        onClick={() => setRole('farmer')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'farmer' ? 'border-[#C65D3B] bg-[#C65D3B]/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${role === 'farmer' ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-400'}`}><Tractor size={16} /></div>
                        <h3 className="font-bold text-sm text-gray-900">Farmer</h3>
                      </div>
                      
                      <div 
                        onClick={() => setRole('buyer')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'buyer' ? 'border-[#0087FF] bg-[#0087FF]/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${role === 'buyer' ? 'bg-[#0087FF] text-white' : 'bg-gray-100 text-gray-400'}`}><ShoppingBag size={16} /></div>
                        <h3 className="font-bold text-sm text-gray-900">Buyer</h3>
                      </div>
                    </div>

                    <div className="relative">
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D3B]/50 transition-all" placeholder="Full Name" required />
                    </div>

                    {/* OTP method selector */}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setOtpMethod('email')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${otpMethod === 'email' ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Mail size={14} /> Email OTP
                      </button>
                      <button type="button" onClick={() => setOtpMethod('phone')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${otpMethod === 'phone' ? 'bg-[#C65D3B] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Phone size={14} /> Phone OTP
                      </button>
                    </div>
                  </>
                )}

                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D3B]/50 transition-all" placeholder="Email Address" required />
                </div>

                {mode === 'signup' && otpMethod === 'phone' && (
                  <div className="relative">
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D3B]/50 transition-all" placeholder="Phone Number (+91)" />
                  </div>
                )}

                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C65D3B]/50 transition-all" placeholder="Password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {mode === 'signup' && password.length > 0 && (
                  <div className="flex gap-1 h-1.5 mt-2">
                    <div className={`flex-1 rounded-full ${password.length > 0 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${password.length > 5 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 rounded-full ${password.length > 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-all bg-gradient-to-r from-[#C65D3B] to-[#D4A574] hover:shadow-[0_0_20px_rgba(198,93,59,0.4)] active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Send OTP & Continue'} <ChevronRight size={18} />
                </button>
              </form>
            </>
          )}
          
          <div className="mt-6 flex flex-col items-center gap-3">
            {mode === 'signin' ? (
              <>
                <a href="#" className="text-sm text-gray-500 hover:text-[#C65D3B]">Forgot password?</a>
                <p className="text-sm text-gray-600">No account? <span onClick={() => navigate('/signup')} className="text-[#C65D3B] font-bold cursor-pointer hover:underline">Sign up →</span></p>
              </>
            ) : (
              <p className="text-sm text-gray-600">Already have an account? <span onClick={() => navigate('/signin')} className="text-[#C65D3B] font-bold cursor-pointer hover:underline">Sign in →</span></p>
            )}
          </div>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">or try demo</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => handleDemo('farmer')} disabled={loading} className="flex-1 py-3 bg-orange-50 text-[#C65D3B] rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors disabled:opacity-50">🌾 Farmer Demo</button>
            <button onClick={() => handleDemo('buyer')} disabled={loading} className="flex-1 py-3 bg-blue-50 text-[#0087FF] rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">🛒 Buyer Demo</button>
          </div>
        </div>
      </div>
    </div>
  );
};
