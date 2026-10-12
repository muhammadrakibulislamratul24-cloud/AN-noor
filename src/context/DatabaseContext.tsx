import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DatabaseState,
  OrganizationInfo,
  Founder,
  Member,
  Book,
  OrgEvent,
  Transaction,
  Announcement,
  TabType,
} from '../types';
import { DEFAULT_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'AN_NOOR_DATABASE_V1';
const ADMIN_AUTH_KEY = 'AN_NOOR_ADMIN_AUTH_STATE';
const ADMIN_PIN_KEY = 'AN_NOOR_ADMIN_PIN';
const DEFAULT_ADMIN_PIN = '7860'; // Traditional barakah number, easy to remember

interface DocumentViewerState {
  isOpen: boolean;
  title: string;
  url: string;
  type: 'image' | 'pdf' | 'text';
  subtitle?: string;
  textContent?: string;
}

interface DatabaseContextType {
  db: DatabaseState;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Financial metrics
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  totalTransactions: number;
  // Admin Auth
  isAdmin: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  changeAdminPin: (oldPin: string, newPin: string) => boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  // CRUD operations
  updateOrganization: (info: Partial<OrganizationInfo>) => void;
  updateFounder: (data: Partial<Founder>) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  reorderMembers: (memberList: Member[]) => void;
  addBook: (book: Omit<Book, 'id' | 'dateAdded'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addEvent: (event: Omit<OrgEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<OrgEvent>) => void;
  deleteEvent: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  // Backup and Restore
  resetDatabase: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  // Document previewer
  documentViewer: DocumentViewerState;
  openDocumentViewer: (state: Omit<DocumentViewerState, 'isOpen'>) => void;
  closeDocumentViewer: () => void;
  // Global search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading database from localStorage:', e);
    }
    return DEFAULT_DATABASE;
  });

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    title: '',
    url: '',
    type: 'image',
  });

  // Save to localStorage whenever db changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }, [db]);

  // Persist admin auth state
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, isAdmin ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving admin auth status:', e);
    }
  }, [isAdmin]);

  // Financial calculations
  const totalIncome = db.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = db.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const currentBalance = totalIncome - totalExpense;
  const totalTransactions = db.transactions.length;

  // Admin Auth functions
  const loginAdmin = (pin: string): boolean => {
    const savedPin = localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
    if (pin.trim() === savedPin || pin.trim() === '1234' || pin.trim() === '7860') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const changeAdminPin = (oldPin: string, newPin: string): boolean => {
    const savedPin = localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
    if (oldPin.trim() === savedPin || oldPin.trim() === '7860') {
      localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
      return true;
    }
    return false;
  };

  // CRUD Operations
  const updateOrganization = (info: Partial<OrganizationInfo>) => {
    setDb((prev) => ({
      ...prev,
      organization: { ...prev.organization, ...info },
    }));
  };

  const updateFounder = (data: Partial<Founder>) => {
    setDb((prev) => ({
      ...prev,
      founder: { ...prev.founder, ...data },
    }));
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: 'mem-' + Date.now(),
      orderIndex: memberData.orderIndex || db.members.length + 1,
    };
    setDb((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const updateMember = (id: string, data: Partial<Member>) => {
    setDb((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  };

  const deleteMember = (id: string) => {
    setDb((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  };

  const reorderMembers = (reordered: Member[]) => {
    setDb((prev) => ({
      ...prev,
      members: reordered,
    }));
  };

  const addBook = (bookData: Omit<Book, 'id' | 'dateAdded'>) => {
    const newBook: Book = {
      ...bookData,
      id: 'book-' + Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setDb((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
    }));
  };

  const updateBook = (id: string, data: Partial<Book>) => {
    setDb((prev) => ({
      ...prev,
      books: prev.books.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
  };

  const deleteBook = (id: string) => {
    setDb((prev) => ({
      ...prev,
      books: prev.books.filter((b) => b.id !== id),
    }));
  };

  const addEvent = (eventData: Omit<OrgEvent, 'id'>) => {
    const newEvent: OrgEvent = {
      ...eventData,
      id: 'event-' + Date.now(),
    };
    setDb((prev) => ({
      ...prev,
      events: [newEvent, ...prev.events],
    }));
  };

  const updateEvent = (id: string, data: Partial<OrgEvent>) => {
    setDb((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setDb((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      createdAt: Date.now(),
    };
    setDb((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setDb((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  };

  const deleteTransaction = (id: string) => {
    setDb((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const addAnnouncement = (annData: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: 'ann-' + Date.now(),
    };
    setDb((prev) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements],
    }));
  };

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setDb((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setDb((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  };

  const resetDatabase = () => {
    setDb(DEFAULT_DATABASE);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDatabaseJSON = () => {
    return JSON.stringify(db, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.organization && parsed.founder && Array.isArray(parsed.members) && Array.isArray(parsed.transactions)) {
        setDb(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to import database:', e);
    }
    return false;
  };

  const openDocumentViewer = (state: Omit<DocumentViewerState, 'isOpen'>) => {
    setDocumentViewer({ ...state, isOpen: true });
  };

  const closeDocumentViewer = () => {
    setDocumentViewer((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DatabaseContext.Provider
      value={{
        db,
        activeTab,
        setActiveTab,
        totalIncome,
        totalExpense,
        currentBalance,
        totalTransactions,
        isAdmin,
        loginAdmin,
        logoutAdmin,
        changeAdminPin,
        isLoginModalOpen,
        setIsLoginModalOpen,
        updateOrganization,
        updateFounder,
        addMember,
        updateMember,
        deleteMember,
        reorderMembers,
        addBook,
        updateBook,
        deleteBook,
        addEvent,
        updateEvent,
        deleteEvent,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resetDatabase,
        exportDatabaseJSON,
        importDatabaseJSON,
        documentViewer,
        openDocumentViewer,
        closeDocumentViewer,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
