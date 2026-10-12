import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { fileToBase64 } from '../../lib/formatters';
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  Edit3,
  Check,
  X,
  Upload,
  Quote,
  ShieldCheck,
} from 'lucide-react';

export const FounderView: React.FC = () => {
  const { db, updateFounder, isAdmin, setIsLoginModalOpen } = useDatabase();
  const founder = db.founder;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: founder.name,
    designation: founder.designation,
    photoUrl: founder.photoUrl,
    biography: founder.biography,
    education: founder.education,
    honors: founder.honors,
    message: founder.message,
    contactEmail: founder.contactEmail || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFounder(formData);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setFormData((prev) => ({ ...prev, photoUrl: b64 }));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#7A1224] via-[#580B18] to-[#0E4D34] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-amber-400/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-3 border-[#C59B27] shadow-xl bg-white">
              <img
                src={founder.photoUrl}
                alt={founder.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#0E4D34] text-[#E4BC52] text-xs font-bold px-2 py-0.5 rounded-full border border-amber-400/40">
              Founder
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-amiri text-xs text-[#E4BC52] bg-black/30 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                مُؤَسِّسُ الْمُنَظَّمَةِ
              </span>
              <span className="text-xs text-amber-100/90 font-medium">Leadership & Visionary</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-white tracking-tight">
              {founder.name}
            </h2>

            <p className="text-sm font-semibold text-[#E4BC52]">
              {founder.designation}
            </p>

            {founder.contactEmail && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-stone-300 pt-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>{founder.contactEmail}</span>
              </div>
            )}

            {/* Admin Edit Trigger */}
            <div className="pt-2">
              {isAdmin ? (
                <button
                  id="btn-edit-founder-inline"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-semibold border border-amber-400/40 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E4BC52]" />
                  <span>Edit Founder Profile (CMS)</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-stone-400 hover:text-stone-200 text-[11px] underline flex items-center justify-center sm:justify-start gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin? Log in to edit profile data without code changes</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Founder's Message Callout */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 relative">
        <Quote className="w-10 h-10 text-amber-300/50 absolute top-4 right-4" />
        <h3 className="text-xs uppercase font-bold text-[#7A1224] tracking-wider mb-2 flex items-center gap-1.5">
          <Quote className="w-3.5 h-3.5" />
          <span>Founder's Message to the Ummah</span>
        </h3>
        <p className="text-sm sm:text-base text-stone-800 font-serif italic leading-relaxed">
          "{founder.message}"
        </p>
        <p className="text-right text-xs font-bold text-[#0E4D34] mt-2 font-cinzel">
          — {founder.name}
        </p>
      </div>

      {/* Grid: Biography & Academic Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biography */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <BookOpen className="w-4 h-4 text-[#7A1224]" />
            <h3 className="text-sm font-bold font-cinzel text-stone-900">
              Biography & Heritage
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-3">
            <p>{founder.biography}</p>
          </div>
        </div>

        {/* Education & Honors */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <GraduationCap className="w-4 h-4 text-[#0E4D34]" />
              <h3 className="text-sm font-bold font-cinzel text-stone-900">
                Academic Qualifications
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {founder.education}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Award className="w-4 h-4 text-[#C59B27]" />
              <h3 className="text-sm font-bold font-cinzel text-stone-900">
                Honors & Recognitions
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {founder.honors}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Founder Modal (Admin CMS) */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-[#7A1224] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#E4BC52]" />
                <h3 className="font-bold text-sm font-cinzel">Edit Founder Profile (CMS)</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Founder Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Profile Photo (URL or Upload Image)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-stone-300 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="Photo URL"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 outline-hidden"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer transition">
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Biography *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Academic Credentials & Education
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Honors & Recognitions
                </label>
                <input
                  type="text"
                  value={formData.honors}
                  onChange={(e) => setFormData({ ...formData, honors: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Founder's Message / Vision
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-founder"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7A1224] hover:bg-[#580B18] rounded-xl flex items-center gap-1.5 transition shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
