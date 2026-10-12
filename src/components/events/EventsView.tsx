import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { OrgEvent, EventGuest, EventScheduleItem } from '../../types';
import { fileToBase64, formatDate } from '../../lib/formatters';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  Users,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  Image,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { db, addEvent, updateEvent, deleteEvent, isAdmin, setIsLoginModalOpen, openDocumentViewer } = useDatabase();

  const [activeTab, setActiveFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [activeEventModal, setActiveEventModal] = useState<OrgEvent | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    posterUrl: string;
    date: string;
    time: string;
    venue: string;
    description: string;
    category: string;
    status: 'upcoming' | 'completed';
    importantNotice: string;
    speakers: EventGuest[];
    schedule: EventScheduleItem[];
    gallery: string[];
  }>({
    title: '',
    posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    date: '2026-10-15',
    time: '10:00 AM - 05:00 PM BST',
    venue: 'An Noor Central Hall, Dhaka',
    description: '',
    category: 'Conference',
    status: 'upcoming',
    importantNotice: '',
    speakers: [
      { name: 'Muhammad Saiful Azam Babar Al-Azhari', role: 'Keynote Speaker & Founder' },
    ],
    schedule: [
      { time: '10:00 AM', activity: 'Inaugural Session' },
      { time: '11:30 AM', activity: 'Main Lecture & Q&A' },
    ],
    gallery: [],
  });

  const [deleteTarget, setDeleteTarget] = useState<OrgEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return db.events;
    return db.events.filter((e) => e.status === activeTab);
  }, [db.events, activeTab]);

  const openAddForm = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      date: new Date().toISOString().split('T')[0],
      time: '09:00 AM - 04:00 PM BST',
      venue: 'An Noor Auditorium, Dhaka',
      description: '',
      category: 'Conference & Symposium',
      status: 'upcoming',
      importantNotice: 'Please register in advance for attendance passes.',
      speakers: [{ name: 'Muhammad Saiful Azam Babar Al-Azhari', role: 'Founder' }],
      schedule: [{ time: '09:00 AM', activity: 'Registration & Welcoming' }],
      gallery: [],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (evt: OrgEvent) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      posterUrl: evt.posterUrl,
      date: evt.date,
      time: evt.time,
      venue: evt.venue,
      description: evt.description,
      category: evt.category,
      status: evt.status,
      importantNotice: evt.importantNotice || '',
      speakers: evt.speakers || [],
      schedule: evt.schedule || [],
      gallery: evt.gallery || [],
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      updateEvent(editingEventId, formData);
    } else {
      addEvent(formData);
    }
    setIsFormOpen(false);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setFormData((prev) => ({ ...prev, posterUrl: b64 }));
    }
  };

  const handleAddSpeaker = () => {
    setFormData((prev) => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', role: '' }],
    }));
  };

  const handleSpeakerChange = (index: number, field: 'name' | 'role', val: string) => {
    setFormData((prev) => {
      const copy = [...prev.speakers];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, speakers: copy };
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
  };

  const handleAddSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', activity: '' }],
    }));
  };

  const handleScheduleChange = (index: number, field: 'time' | 'activity', val: string) => {
    setFormData((prev) => {
      const copy = [...prev.schedule];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, schedule: copy };
    });
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C59B27]/15 text-[#9E7B1D] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-cinzel text-stone-900">
              Events & Programs
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Seminars, conferences, youth retreats, and scholarly competitions
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-add-event"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7A1224] hover:bg-[#580B18] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#E4BC52]" />
            <span>Create New Program</span>
          </button>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-stone-500 hover:text-stone-700 text-xs font-medium underline"
          >
            Admin Sign-in to Manage Events
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-[#7A1224] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>Upcoming Events</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {db.events.filter((e) => e.status === 'upcoming').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-[#0E4D34] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <span>Completed Archives</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {db.events.filter((e) => e.status === 'completed').length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'all'
              ? 'bg-stone-800 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All ({db.events.length})
        </button>
      </div>

      {/* Event Cards List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
          <Calendar className="w-10 h-10 mx-auto text-stone-300 mb-2" />
          <p className="font-semibold text-stone-700">No events found in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row group"
            >
              {/* Event Poster */}
              <div
                onClick={() => setActiveEventModal(evt)}
                className="md:w-72 h-48 md:h-auto shrink-0 relative cursor-pointer overflow-hidden bg-stone-100"
              >
                <img
                  src={evt.posterUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      evt.status === 'upcoming' ? 'bg-emerald-400' : 'bg-stone-400'
                    }`}
                  />
                  <span className="capitalize">{evt.status}</span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7A1224]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(evt.date)} • {evt.time}</span>
                  </div>

                  <h3
                    onClick={() => setActiveEventModal(evt)}
                    className="text-base sm:text-lg font-bold font-cinzel text-stone-900 mt-1 cursor-pointer hover:text-[#7A1224]"
                  >
                    {evt.title}
                  </h3>

                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </p>

                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Speakers Preview */}
                  {evt.speakers && evt.speakers.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
                      <Users className="w-3.5 h-3.5 text-[#0E4D34]" />
                      <span className="font-semibold text-stone-700">Speakers:</span>
                      <span className="truncate">
                        {evt.speakers.map((s) => s.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveEventModal(evt)}
                    className="text-xs font-bold text-[#7A1224] hover:underline flex items-center gap-1"
                  >
                    <span>View Schedule & Guests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditForm(evt)}
                        title="Edit Event"
                        className="p-1.5 text-stone-500 hover:text-[#7A1224] hover:bg-stone-100 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(evt)}
                        title="Delete Event"
                        className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            {/* Poster Header */}
            <div className="relative h-48 sm:h-56 shrink-0 bg-stone-900">
              <img
                src={activeEventModal.posterUrl}
                alt={activeEventModal.title}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveEventModal(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 transition backdrop-blur-xs"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#7A1224] px-2.5 py-0.5 rounded-full">
                  {activeEventModal.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-cinzel text-white mt-1 drop-shadow-md">
                  {activeEventModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-stone-700">
              {/* Event Time & Venue cards */}
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Date & Time</span>
                  <p className="font-bold text-stone-900">{formatDate(activeEventModal.date)}</p>
                  <p className="text-stone-500 text-[11px]">{activeEventModal.time}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Location</span>
                  <p className="font-bold text-stone-900 truncate">{activeEventModal.venue}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Venue Confirmed</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#7A1224] mb-1">
                  Program Details
                </h5>
                <p className="leading-relaxed text-stone-600 whitespace-pre-line text-xs">
                  {activeEventModal.description}
                </p>
              </div>

              {/* Notice */}
              {activeEventModal.importantNotice && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block text-[11px]">Notice for Attendees</span>
                    <p className="text-amber-800 text-[11px]">{activeEventModal.importantNotice}</p>
                  </div>
                </div>
              )}

              {/* Speakers */}
              {activeEventModal.speakers && activeEventModal.speakers.length > 0 && (
                <div>
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#0E4D34] mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Distinguished Speakers & Guests</span>
                  </h5>
                  <div className="space-y-1.5">
                    {activeEventModal.speakers.map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-stone-800 text-xs">{sp.name}</p>
                          <p className="text-[11px] text-stone-500">{sp.role}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#0E4D34] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Honorary Guest
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule / Agenda */}
              {activeEventModal.schedule && activeEventModal.schedule.length > 0 && (
                <div>
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#7A1224] mb-2 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Event Schedule & Timeline</span>
                  </h5>
                  <div className="space-y-1.5">
                    {activeEventModal.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-3"
                      >
                        <span className="font-mono font-bold text-[#7A1224] text-[11px] shrink-0 pt-0.5">
                          {item.time}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-800 text-xs">{item.activity}</p>
                          {item.speaker && (
                            <p className="text-[10px] text-stone-500">By {item.speaker}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {activeEventModal.gallery && activeEventModal.gallery.length > 0 && (
                <div>
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#C59B27] mb-2 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" />
                    <span>Event Photo Highlights</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {activeEventModal.gallery.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt="Event Photo"
                        className="h-28 w-full object-cover rounded-xl border border-stone-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end border-t border-stone-200">
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#7A1224] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-cinzel">
                {editingEventId ? 'Edit Event Details' : 'Create Organization Program'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Seerah Conference 2026"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Time Range *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="09:00 AM - 05:00 PM BST"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'upcoming' | 'completed' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Conference, Workshop, etc."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Venue / Location *</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Bangabandhu International Conference Centre, Dhaka"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Event Poster / Banner
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.posterUrl}
                    alt="Poster Preview"
                    className="w-14 h-10 rounded object-cover border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      placeholder="Poster Image URL"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 outline-hidden"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload Banner File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Event Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full description of the event, agenda goals, and target audience"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              {/* Speakers Management */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">Speakers & Guests</label>
                  <button
                    type="button"
                    onClick={handleAddSpeaker}
                    className="text-[11px] font-bold text-[#7A1224] hover:underline"
                  >
                    + Add Speaker
                  </button>
                </div>
                <div className="space-y-1.5">
                  {formData.speakers.map((spk, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Speaker Name"
                        value={spk.name}
                        onChange={(e) => handleSpeakerChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={spk.role}
                        onChange={(e) => handleSpeakerChange(idx, 'role', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Management */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">Timeline / Schedule</label>
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="text-[11px] font-bold text-[#0E4D34] hover:underline"
                  >
                    + Add Time Slot
                  </button>
                </div>
                <div className="space-y-1.5">
                  {formData.schedule.map((slot, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Time (e.g. 10:00 AM)"
                        value={slot.time}
                        onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg border border-stone-300"
                      />
                      <input
                        type="text"
                        placeholder="Activity / Session Title"
                        value={slot.activity}
                        onChange={(e) => handleScheduleChange(idx, 'activity', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSchedule(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Notice / Registration Guidelines
                </label>
                <input
                  type="text"
                  value={formData.importantNotice}
                  onChange={(e) => setFormData({ ...formData, importantNotice: e.target.value })}
                  placeholder="e.g. Admission is free, pre-registration required"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-event"
                  className="px-4 py-2 font-semibold text-white bg-[#7A1224] hover:bg-[#580B18] rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingEventId ? 'Update Event' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Event Program"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated speakers, schedule items, and photo archives will be removed.`}
        confirmLabel="Delete Program"
        onConfirm={() => {
          if (deleteTarget) {
            deleteEvent(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
