import React from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './components/home/HomeView';
import { FounderView } from './components/founder/FounderView';
import { MembersView } from './components/members/MembersView';
import { LibraryView } from './components/library/LibraryView';
import { EventsView } from './components/events/EventsView';
import { FinanceView } from './components/finance/FinanceView';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainLayout: React.FC = () => {
  const { activeTab, db } = useDatabase();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'founder':
        return <FounderView />;
      case 'members':
        return <MembersView />;
      case 'library':
        return <LibraryView />;
      case 'events':
        return <EventsView />;
      case 'finance':
        return <FinanceView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-[#7A1224] selection:text-white pb-20 md:pb-8">
      {/* Top Application Header */}
      <Header />

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4">
        {renderActiveView()}
      </main>

      {/* Bottom Navigation for Mobile / Quick Access */}
      <BottomNav />

      {/* Global Modals */}
      <AdminLoginModal />
      <DocumentViewerModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <DatabaseProvider>
      <MainLayout />
    </DatabaseProvider>
  );
}
