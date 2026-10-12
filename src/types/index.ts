export type TabType = 'home' | 'founder' | 'members' | 'library' | 'events' | 'finance' | 'admin';

export interface OrganizationInfo {
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  establishedYear: string;
  socialFacebook?: string;
  socialYoutube?: string;
}

export interface Founder {
  id: string;
  name: string;
  designation: string;
  photoUrl: string;
  biography: string;
  education: string;
  honors: string;
  message: string;
  contactEmail?: string;
}

export interface Member {
  id: string;
  name: string;
  designation: string;
  department: string;
  photoUrl: string;
  biography: string;
  email?: string;
  phone?: string;
  joiningDate?: string;
  orderIndex: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  publisher: string;
  publishYear: string;
  pages: number;
  coverUrl: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfContentPreview?: string; // sample text excerpt for the digital reader
  dateAdded: string;
}

export interface EventGuest {
  name: string;
  role: string;
  avatar?: string;
}

export interface EventScheduleItem {
  time: string;
  activity: string;
  speaker?: string;
}

export interface OrgEvent {
  id: string;
  title: string;
  posterUrl: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  category: string;
  status: 'upcoming' | 'completed';
  speakers: EventGuest[];
  schedule: EventScheduleItem[];
  gallery: string[];
  importantNotice?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  description: string;
  referenceNo?: string;
  party: string; // "Income Source" (e.g. Donor) or "Where Spent" (e.g. Stage Decorator)
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
  createdAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  priority: 'normal' | 'urgent';
}

export interface DatabaseState {
  organization: OrganizationInfo;
  founder: Founder;
  members: Member[];
  books: Book[];
  events: OrgEvent[];
  transactions: Transaction[];
  announcements: Announcement[];
}
