import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Scan, Mail, Lock, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { cn } from '../components/Layout';

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail, forgotPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (isSignUp) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await forgotPassword(resetEmail);
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
      setShowForgotModal(false);
    } catch (err) {
      alert(err.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 text-gray-900 font-sans selection:bg-primary/20">
      {/* Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[460px] relative z-10">
        <div className="bg-white rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-gray-100 p-8 md:p-12 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 flex">
             <div className={cn("h-full bg-primary transition-all duration-500", isSignUp ? "w-full" : "w-1/2")}></div>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 group cursor-pointer">
              <Scan className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">LekkaFlow</h1>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
               <ShieldCheck className="w-3 h-3" />
               Secure Cloud Terminal
            </div>
          </div>

          {/* Strong Switcher */}
          <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 relative">
             <div className={cn(
               "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300",
               isSignUp ? "left-[calc(50%+3px)]" : "left-1.5"
             )}></div>
             <button 
               onClick={() => setIsSignUp(false)}
               className={cn("flex-1 py-3 text-sm font-bold items-center justify-center gap-2 relative z-10 transition-colors uppercase tracking-wider flex", !isSignUp ? "text-primary" : "text-gray-400")}
             >
               <LogIn className="w-4 h-4" /> Sign In
             </button>
             <button 
               onClick={() => setIsSignUp(true)}
               className={cn("flex-1 py-3 text-sm font-bold items-center justify-center gap-2 relative z-10 transition-colors uppercase tracking-wider flex", isSignUp ? "text-primary" : "text-gray-400")}
             >
               <UserPlus className="w-4 h-4" /> Sign Up
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">Shop Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@store.com"
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-gray-800 placeholder:text-gray-300"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pr-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">Shop Password</label>
                {!isSignUp && (
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-gray-800 placeholder:text-gray-300"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              {isSignUp && <p className="text-[9px] text-gray-400 font-medium pl-1 italic">*At least 6 characters required for encryption</p>}
            </div>

            {message.text && (
              <div className={cn(
                "p-4 text-xs font-bold rounded-2xl animate-shake flex items-center gap-3",
                message.type === 'error' ? "bg-red-50 text-red-500 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", message.type === 'error' ? "bg-red-500" : "bg-emerald-500")}></div>
                {message.text}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-gray-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 uppercase tracking-widest">
                {loading ? "PROCESSSING..." : (isSignUp ? "DEPLOY MY TERMINAL" : "START BILLING")}
              </span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />}
            </button>
          </form>

          <div className="relative my-12 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative px-6 bg-white text-gray-300 text-[11px] font-black uppercase tracking-widest">Secure Credentials</span>
          </div>

          <button
            onClick={loginWithGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-5 px-6 rounded-[24px] font-black text-gray-700 shadow-sm hover:border-primary/20 hover:bg-gray-50/50 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="uppercase tracking-widest text-xs">Continue with Google</span>
          </button>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in text-gray-900">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-sm animate-slide-up border border-gray-100">
              <h3 className="text-2xl font-black tracking-tight mb-2">Recover Access</h3>
              <p className="text-gray-400 text-sm font-medium mb-8">We'll send a recovery link to your shop email address.</p>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">Recovery Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="shop@email.com"
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-primary/20 transition-all font-bold" 
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 font-black text-xs text-gray-400 uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={resetLoading} className="flex-1 bg-primary text-white py-4.5 rounded-2xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">
                    {resetLoading ? 'SENDING...' : 'SEND LINK'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Cloud Shield Protection Active
          </div>
          <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.3em] max-w-[280px]">
             LekkaFlow Terminal uses 256-bit AES encryption to protect your shop's inventory and billing data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
