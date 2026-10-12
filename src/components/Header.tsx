import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Search, ShieldCheck, ShieldAlert, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileFrame, setIsMobileFrame }) => {
  const { db, isAdmin, setIsLoginModalOpen, logoutAdmin, setIsSearchOpen, setActiveTab } = useDatabase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top micro-bar with Arabic motif and organization motto */}
      <div className="bg-[#7A1224] text-amber-100 text-xs px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-amiri text-sm tracking-wider text-[#E4BC52]">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          <span className="hidden sm:inline text-stone-300">|</span>
          <span className="hidden sm:inline text-amber-50/90 text-[11px] truncate max-w-[280px]">
            {db.organization.tagline}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop/Mobile preview toggle for convenience */}
          <button
            id="btn-toggle-frame"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden md:flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-amber-100 px-2 py-0.5 rounded transition"
            title="Toggle Mobile Simulator vs Full Desktop"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3 h-3 text-[#E4BC52]" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-[#E4BC52]" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Admin status toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-[#0E4D34] text-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-500/40">
              <ShieldCheck className="w-3 h-3 text-[#E4BC52]" />
              <span>Admin Active</span>
              <button
                id="btn-admin-logout"
                onClick={logoutAdmin}
                className="ml-1 text-stone-300 hover:text-white underline text-[10px]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              id="btn-open-admin-login"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full transition"
            >
              <ShieldAlert className="w-3 h-3 text-[#E4BC52]" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main navigation header */}
      <div className="px-4 py-2.5 flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand identity */}
        <div
          id="brand-header-link"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#C59B27] p-0.5 bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition duration-200">
              <img
                src={db.organization.logoUrl}
                alt={db.organization.name}
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#0E4D34] text-[#E4BC52] text-[8px] font-bold px-1 rounded-full border border-amber-300/50">
              نور
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-cinzel text-[#7A1224] tracking-tight leading-none group-hover:text-[#580B18]">
                {db.organization.name}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-[#0E4D34]/10 text-[#0E4D34] px-1.5 py-0.5 rounded border border-[#0E4D34]/20">
                Official
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium tracking-tight">
              Organization & Knowledge Platform
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-global-search"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-stone-600 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-full text-xs font-medium transition border border-stone-200"
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Search records...</span>
            <kbd className="hidden sm:inline-block bg-white px-1.5 py-0.5 rounded text-[10px] text-stone-400 border border-stone-200">
              ⌘K
            </kbd>
          </button>

          {isAdmin && (
            <button
              id="btn-quick-admin-tab"
              onClick={() => setActiveTab('admin')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-[#7A1224] text-white px-3 py-1.5 rounded-full hover:bg-[#580B18] transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E4BC52]" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
