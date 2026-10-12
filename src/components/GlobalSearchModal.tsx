import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Search, X, Users, BookOpen, Calendar, Wallet, ChevronRight } from 'lucide-react';
import { formatBDT, formatDate } from '../lib/formatters';

export const GlobalSearchModal: React.FC = () => {
  const { db, isAdmin, isSearchOpen, setIsSearchOpen, setActiveTab, openDocumentViewer } = useDatabase();
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        members: db.members.slice(0, 3),
        books: db.books.slice(0, 3),
        events: db.events.slice(0, 2),
        transactions: isAdmin ? db.transactions.slice(0, 3) : [],
      };
    }

    return {
      members: db.members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q)
      ),
      books: db.books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      ),
      events: db.events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      ),
      transactions: isAdmin
        ? db.transactions.filter(
            (t) =>
              t.description.toLowerCase().includes(q) ||
              t.category.toLowerCase().includes(q) ||
              t.party.toLowerCase().includes(q) ||
              (t.referenceNo && t.referenceNo.toLowerCase().includes(q))
          )
        : [],
    };
  }, [query, db, isAdmin]);

  if (!isSearchOpen) return null;

  const totalResults =
    filteredResults.members.length +
    filteredResults.books.length +
    filteredResults.events.length +
    filteredResults.transactions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden mt-6 sm:mt-12 flex flex-col max-h-[85vh]">
        {/* Search input bar */}
        <div className="p-3.5 border-b border-stone-200 flex items-center gap-3 bg-stone-50">
          <Search className="w-5 h-5 text-stone-400 shrink-0 ml-1" />
          <input
            type="text"
            id="input-global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, books, events, or categories..."
            className="w-full bg-transparent text-sm text-stone-900 outline-hidden font-medium placeholder-stone-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1">
          {totalResults === 0 ? (
            <div className="text-center py-10 text-stone-500">
              <Search className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-semibold text-stone-700">No matching records found</p>
              <p className="text-xs text-stone-400 mt-0.5">Try searching with a different term</p>
            </div>
          ) : (
            <>
              {/* Members */}
              {filteredResults.members.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A1224] uppercase tracking-wider px-2 mb-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Members ({filteredResults.members.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setActiveTab('members');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-stone-800">{m.name}</p>
                            <p className="text-[11px] text-stone-500">{m.designation}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books */}
              {filteredResults.books.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E4D34] uppercase tracking-wider px-2 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Books & Publications ({filteredResults.books.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.books.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setActiveTab('library');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-8 h-10 rounded object-cover border border-stone-200 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-stone-800 truncate max-w-[280px]">
                              {b.title}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {b.author} • <span className="text-[#C59B27] font-medium">{b.category}</span>
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {filteredResults.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C59B27] uppercase tracking-wider px-2 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Events & Programs ({filteredResults.events.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.events.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          setActiveTab('events');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-800">{e.title}</p>
                          <p className="text-[11px] text-stone-500">
                            {formatDate(e.date)} • {e.venue}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            e.status === 'upcoming'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial records (Admin Only) */}
              {isAdmin && filteredResults.transactions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider px-2 mb-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Financial Records (Admin Only: {filteredResults.transactions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.transactions.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setActiveTab('finance');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-800">{t.description}</p>
                          <p className="text-[11px] text-stone-500">
                            {formatDate(t.date)} • {t.party} ({t.category})
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold ${
                              t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {t.type === 'income' ? '+' : '-'}
                            {formatBDT(t.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Tip: Press ESC to exit search</span>
          <span className="text-[#7A1224] font-medium">An Noor Central Knowledge Index</span>
        </div>
      </div>
    </div>
  );
};
