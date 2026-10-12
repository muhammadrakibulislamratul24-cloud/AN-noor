import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Member } from '../../types';
import { fileToBase64, formatDate } from '../../lib/formatters';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  Building,
} from 'lucide-react';

export const MembersView: React.FC = () => {
  const { db, addMember, updateMember, deleteMember, isAdmin, setIsLoginModalOpen } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeMemberModal, setActiveMemberModal] = useState<Member | null>(null);

  // Add/Edit member form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: 'Academic Research & Publications',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
    biography: '',
    email: '',
    phone: '',
    joiningDate: new Date().toISOString().split('T')[0],
    orderIndex: 1,
  });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const departments = useMemo(() => {
    const list = Array.from(new Set(db.members.map((m) => m.department)));
    return ['all', ...list];
  }, [db.members]);

  const filteredMembers = useMemo(() => {
    return db.members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.biography.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment === 'all' || m.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [db.members, searchQuery, selectedDepartment]);

  const openAddForm = () => {
    setEditingMemberId(null);
    setFormData({
      name: '',
      designation: '',
      department: 'Academic Research & Publications',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
      biography: '',
      email: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
      orderIndex: db.members.length + 1,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (member: Member) => {
    setEditingMemberId(member.id);
    setFormData({
      name: member.name,
      designation: member.designation,
      department: member.department,
      photoUrl: member.photoUrl,
      biography: member.biography,
      email: member.email || '',
      phone: member.phone || '',
      joiningDate: member.joiningDate || new Date().toISOString().split('T')[0],
      orderIndex: member.orderIndex || 1,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMemberId) {
      updateMember(editingMemberId, formData);
    } else {
      addMember(formData);
    }
    setIsFormOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setFormData((prev) => ({ ...prev, photoUrl: b64 }));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7A1224]/10 text-[#7A1224] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-cinzel text-stone-900">
              Organizational Members
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Scholars, directors, coordinators, and executive council of An Noor
          </p>
        </div>

        {isAdmin ? (
          <button
            id="btn-add-member"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7A1224] hover:bg-[#580B18] text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#E4BC52]" />
            <span>Add New Member</span>
          </button>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-stone-500 hover:text-stone-700 text-xs font-medium underline"
          >
            Admin Sign-in to Manage Members
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member by name, designation, or bio..."
            className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-stone-200 focus:border-[#7A1224] outline-hidden shadow-2xs"
          />
        </div>

        {/* Department pill filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition ${
                selectedDepartment === dept
                  ? 'bg-[#0E4D34] text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {dept === 'all' ? 'All Wings' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
          <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
          <p className="font-semibold text-stone-700">No members match your criteria</p>
          <p className="text-xs text-stone-400 mt-1">Try resetting the department filter or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-4 flex items-start gap-3.5">
                <div
                  onClick={() => setActiveMemberModal(member)}
                  className="relative cursor-pointer shrink-0"
                >
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 group-hover:border-[#C59B27] transition shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0E4D34] border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#0E4D34] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 line-clamp-1">
                    {member.department}
                  </span>
                  <h4
                    onClick={() => setActiveMemberModal(member)}
                    className="text-sm font-bold text-stone-900 truncate mt-1 cursor-pointer hover:text-[#7A1224]"
                  >
                    {member.name}
                  </h4>
                  <p className="text-xs text-[#7A1224] font-medium truncate">
                    {member.designation}
                  </p>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {member.biography}
                  </p>
                </div>
              </div>

              {/* Card Footer with Quick Contact and Admin Actions */}
              <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setActiveMemberModal(member)}
                  className="text-[11px] font-bold text-[#7A1224] hover:underline"
                >
                  View Profile Details →
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditForm(member)}
                      title="Edit Member"
                      className="p-1.5 text-stone-500 hover:text-[#7A1224] hover:bg-stone-200/60 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(member)}
                      title="Delete Member"
                      className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Detail Modal */}
      {activeMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7A1224] to-[#580B18] text-white p-6 relative">
              <button
                onClick={() => setActiveMemberModal(null)}
                className="absolute top-4 right-4 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={activeMemberModal.photoUrl}
                  alt={activeMemberModal.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C59B27] shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                    {activeMemberModal.department}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-cinzel text-white mt-1">
                    {activeMemberModal.name}
                  </h3>
                  <p className="text-xs text-amber-100/90 font-medium">
                    {activeMemberModal.designation}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-stone-700">
              <div>
                <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-[#7A1224] mb-1">
                  Biography & Responsibilities
                </h5>
                <p className="leading-relaxed whitespace-pre-line text-stone-600">
                  {activeMemberModal.biography}
                </p>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                {activeMemberModal.email && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-3.5 h-3.5 text-[#0E4D34]" />
                    <span>{activeMemberModal.email}</span>
                  </div>
                )}
                {activeMemberModal.phone && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-[#0E4D34]" />
                    <span>{activeMemberModal.phone}</span>
                  </div>
                )}
                {activeMemberModal.joiningDate && (
                  <div className="flex items-center gap-2 text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Joined Organization: {formatDate(activeMemberModal.joiningDate)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveMemberModal(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal (Admin CMS) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#7A1224] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm font-cinzel">
                {editingMemberId ? 'Edit Member Profile' : 'Add New Member'}
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
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Tariqul Islam"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Designation / Responsibility *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Vice Chairman & Head of Research"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Department / Wing *</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Academic Research & Publications"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Profile Photo (URL or Device Upload)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="Image URL"
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 outline-hidden"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
                      <Upload className="w-3 h-3" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Short Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Brief summary of duties and academic background"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@annoor-organization.org"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1711..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
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
                  id="btn-save-member"
                  className="px-4 py-2 font-semibold text-white bg-[#7A1224] hover:bg-[#580B18] rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingMemberId ? 'Update Member' : 'Save Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove Member from Directory"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This will remove their record from the organization directory.`}
        confirmLabel="Delete Member"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMember(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
