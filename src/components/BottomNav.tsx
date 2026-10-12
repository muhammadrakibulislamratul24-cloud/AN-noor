import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TabType } from '../types';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  Wallet,
  Settings,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isAdmin } = useDatabase();

  const navItems: { tab: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'members', label: 'Members', icon: Users },
    { tab: 'library', label: 'Library', icon: BookOpen },
    { tab: 'events', label: 'Events', icon: Calendar },
    { tab: 'finance', label: 'Finance', icon: Wallet },
  ];

  if (isAdmin) {
    navItems.push({ tab: 'admin', label: 'Admin', icon: Settings });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1 px-2 shadow-lg safe-area-bottom">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              id={`nav-tab-${item.tab}`}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? 'text-[#7A1224] font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-7 h-1 bg-[#C59B27] rounded-full" />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-[#7A1224]/10 text-[#7A1224] scale-105' : 'hover:bg-stone-100'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#7A1224]' : 'text-stone-500'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] leading-tight mt-0.5 tracking-tight ${
                  isActive ? 'text-[#7A1224]' : 'text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
