import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { formatBDT, formatDate } from '../../lib/formatters';
import {
  Users,
  BookOpen,
  Calendar,
  Wallet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Bell,
  Clock,
  MapPin,
  FileText,
  Award,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { db, activeTab, setActiveTab, currentBalance, totalIncome, totalExpense, isAdmin, openDocumentViewer } = useDatabase();
  const [showBalance, setShowBalance] = useState(true);

  const upcomingEvents = db.events
    .filter((e) => e.status === 'upcoming')
    .slice(0, 2);

  const recentBooks = db.books.slice(0, 3);
  const recentTransactions = db.transactions.slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Hero Welcome Banner with Islamic aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A1224] via-[#580B18] to-[#0E4D34] text-white p-5 sm:p-7 shadow-lg border border-amber-400/20">
        {/* Subtle decorative background ring */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-[#0E4D34]/30 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-amiri text-sm tracking-wider text-[#E4BC52] px-2.5 py-0.5 rounded-full bg-black/20 border border-amber-300/30">
              أَهْلًا وَسَهْلًا
            </span>
            <span className="text-[11px] font-medium text-amber-100/80">
              Welcome to An Noor Official Platform
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-white tracking-tight">
                {db.organization.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-xl font-light leading-relaxed">
                {db.organization.description}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/15 pt-3 sm:pt-0 shrink-0">
              <span className="text-[11px] text-amber-200/90 font-medium">Est. {db.organization.establishedYear}</span>
              <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Organization
              </span>
            </div>
          </div>

          {/* Balance Overview Card embedded in Hero */}
          <div className="mt-5 p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-300">Organizational Net Balance</span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-stone-300 hover:text-white transition"
                  title="Toggle Balance Visibility"
                >
                  {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#E4BC52] font-cinzel mt-0.5 tracking-tight">
                {showBalance ? formatBDT(currentBalance) : '••••••••'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="block text-[10px] text-emerald-300/80">Total Income</span>
                  <span className="font-bold text-emerald-300">{formatBDT(totalIncome)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-500/20">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="block text-[10px] text-rose-300/80">Total Expense</span>
                  <span className="font-bold text-rose-300">{formatBDT(totalExpense)}</span>
                </div>
              </div>

              <button
                id="btn-quick-to-finance"
                onClick={() => setActiveTab('finance')}
                className="ml-auto sm:ml-2 px-3 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 rounded-xl font-semibold text-xs flex items-center gap-1 border border-amber-400/40 transition"
              >
                <span>Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Carousel / Alert */}
      {db.announcements.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-[#7A1224] shrink-0 mt-0.5">
              <Bell className="w-4 h-4 text-[#7A1224]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#7A1224] text-white px-2 py-0.5 rounded-full">
                  Announcement
                </span>
                <span className="text-xs text-stone-500">{formatDate(db.announcements[0].date)}</span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 mt-1">
                {db.announcements[0].title}
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                {db.announcements[0].content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Action Grid */}
      <div>
        <h3 className="text-xs uppercase font-bold text-stone-400 tracking-wider mb-2.5 px-1">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="quick-nav-members"
            onClick={() => setActiveTab('members')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#7A1224]/40 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7A1224]/10 text-[#7A1224] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Members</p>
              <p className="text-[11px] text-stone-500">{db.members.length} Leaders & Staff</p>
            </div>
          </button>

          <button
            id="quick-nav-library"
            onClick={() => setActiveTab('library')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#0E4D34]/40 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0E4D34]/10 text-[#0E4D34] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Digital Library</p>
              <p className="text-[11px] text-stone-500">{db.books.length} Publications</p>
            </div>
          </button>

          <button
            id="quick-nav-events"
            onClick={() => setActiveTab('events')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#C59B27]/40 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C59B27]/15 text-[#9E7B1D] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Events & Programs</p>
              <p className="text-[11px] text-stone-500">{upcomingEvents.length} Upcoming</p>
            </div>
          </button>

          <button
            id="quick-nav-finance"
            onClick={() => setActiveTab('finance')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#7A1224]/40 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0E4D34]/10 text-[#0E4D34] flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-800">Accounts & Ledgers</p>
              <p className="text-[11px] text-stone-500">{db.transactions.length} Transactions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Founder Spotlight Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C59B27]" />
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              Organizational Leadership
            </span>
          </div>
          <button
            id="btn-view-founder-details"
            onClick={() => setActiveTab('founder')}
            className="text-xs font-bold text-[#7A1224] hover:text-[#580B18] flex items-center gap-1"
          >
            <span>View Profile & Bio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={db.founder.photoUrl}
              alt={db.founder.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#C59B27] shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#7A1224] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              Founder
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold font-cinzel text-stone-900">
              {db.founder.name}
            </h4>
            <p className="text-xs font-semibold text-[#0E4D34] mt-0.5">
              {db.founder.designation}
            </p>
            <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
              {db.founder.biography}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                🎓 {db.founder.education.split('|')[0]}
              </span>
              <button
                onClick={() => setActiveTab('founder')}
                className="text-[11px] font-bold text-[#7A1224] hover:underline"
              >
                Read Message & Credentials →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Events & Recently Added Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Events */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7A1224]" />
                <h3 className="text-sm font-bold font-cinzel text-stone-900">Upcoming Events</h3>
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="text-xs font-semibold text-[#7A1224] hover:underline"
              >
                See all ({db.events.length})
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No upcoming events scheduled</p>
              ) : (
                upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setActiveTab('events')}
                    className="p-3 rounded-xl border border-stone-100 hover:border-stone-300 hover:bg-stone-50/70 transition cursor-pointer flex gap-3"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                      <img
                        src={evt.posterUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] text-[#0E4D34] font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(evt.date)}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-800 truncate mt-0.5">
                        {evt.title}
                      </h5>
                      <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{evt.venue}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('events')}
            className="w-full mt-4 py-2 text-xs font-bold text-[#7A1224] bg-[#7A1224]/5 hover:bg-[#7A1224]/10 rounded-xl transition text-center"
          >
            Explore Event Details & Registration
          </button>
        </div>

        {/* Recently Added Books */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0E4D34]" />
                <h3 className="text-sm font-bold font-cinzel text-stone-900">Recent Publications</h3>
              </div>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs font-semibold text-[#0E4D34] hover:underline"
              >
                View Library ({db.books.length})
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {recentBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setActiveTab('library')}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="aspect-3/4 rounded-xl overflow-hidden border border-stone-200 shadow-2xs group-hover:shadow-md transition">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h5 className="text-[11px] font-bold text-stone-800 line-clamp-1 mt-1.5 group-hover:text-[#7A1224]">
                    {book.title}
                  </h5>
                  <p className="text-[10px] text-stone-500 truncate">{book.author}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('library')}
            className="w-full mt-4 py-2 text-xs font-bold text-[#0E4D34] bg-[#0E4D34]/5 hover:bg-[#0E4D34]/10 rounded-xl transition text-center"
          >
            Browse Digital Catalog & PDFs
          </button>
        </div>
      </div>

      {/* Recent Income/Expense Activity */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold font-cinzel text-stone-900">
              Recent Financial Activity
            </h3>
            <p className="text-[11px] text-stone-500">Transparent organizational income and expenses</p>
          </div>
          <button
            id="btn-home-view-all-tx"
            onClick={() => setActiveTab('finance')}
            className="text-xs font-bold text-[#7A1224] hover:underline"
          >
            Full Ledger →
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-emerald-100 text-[#0E4D34]'
                      : 'bg-rose-100 text-[#7A1224]'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-700" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-stone-800 truncate">
                      {tx.description}
                    </p>
                    {tx.attachmentUrl && (
                      <button
                        onClick={() =>
                          openDocumentViewer({
                            title: `${tx.type === 'income' ? 'Income Receipt' : 'Expense Memo'}: ${tx.description}`,
                            url: tx.attachmentUrl!,
                            type: 'image',
                            subtitle: `${formatDate(tx.date)} • ${formatBDT(tx.amount)}`,
                          })
                        }
                        title="View receipt attachment"
                        className="text-amber-600 hover:text-amber-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">
                    {formatDate(tx.date)} • {tx.party} • <span className="font-medium text-stone-600">{tx.category}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs sm:text-sm font-bold font-mono ${
                    tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatBDT(tx.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
