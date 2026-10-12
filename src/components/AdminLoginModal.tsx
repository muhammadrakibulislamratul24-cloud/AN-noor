import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginAdmin, isAdmin, logoutAdmin, setActiveTab } = useDatabase();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      setError(false);
      setPin('');
      setIsLoginModalOpen(false);
      setActiveTab('admin');
    } else {
      setError(true);
    }
  };

  const handleQuickDemoFill = (testPin: string) => {
    setPin(testPin);
    if (loginAdmin(testPin)) {
      setError(false);
      setPin('');
      setIsLoginModalOpen(false);
      setActiveTab('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7A1224] to-[#580B18] text-white p-5 relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-4 right-4 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 border border-amber-300/30">
            <Lock className="w-6 h-6 text-[#E4BC52]" />
          </div>
          <h3 className="text-lg font-bold font-cinzel text-amber-100">An Noor Admin Portal</h3>
          <p className="text-xs text-stone-300 mt-0.5">
            Secure administrative access to edit organization, founder, members, books, events, and finance.
          </p>
        </div>

        {/* Content */}
        <div className="p-5">
          {isAdmin ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0E4D34] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">You are currently logged in as Administrator</p>
                <p className="text-xs text-stone-500 mt-1">Full content management and financial controls are unlocked.</p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setActiveTab('admin');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#7A1224] text-white rounded-xl hover:bg-[#580B18] transition"
                >
                  Go to Admin Panel
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setIsLoginModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Enter Administrator PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="input-admin-pin"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError(false);
                    }}
                    placeholder="Enter 4-digit PIN"
                    maxLength={10}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-[#7A1224] focus:ring-1 focus:ring-[#7A1224] outline-hidden"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Incorrect PIN. Try 7860 or 1234.
                  </p>
                )}
              </div>

              {/* Quick test credentials button */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
                <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C59B27]" />
                    Quick Demo Access:
                  </span>
                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-[11px] font-bold">
                    7860
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('7860')}
                  className="w-full text-center text-xs py-1 px-2 bg-amber-600/10 hover:bg-amber-600/20 text-[#7A1224] font-medium rounded-lg transition"
                >
                  Click to Auto-fill & Login as Admin
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-admin-login"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#7A1224] hover:bg-[#580B18] rounded-xl transition shadow-xs"
                >
                  Authenticate
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
