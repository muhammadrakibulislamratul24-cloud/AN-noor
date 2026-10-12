import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { fileToBase64 } from '../../lib/formatters';
import {
  ShieldCheck,
  Building,
  Award,
  Users,
  BookOpen,
  Calendar,
  Wallet,
  Bell,
  Database,
  Key,
  Check,
  Upload,
  AlertCircle,
  FileDown,
  FileUp,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    db,
    updateOrganization,
    changeAdminPin,
    resetDatabase,
    exportDatabaseJSON,
    importDatabaseJSON,
    setActiveTab,
    logoutAdmin,
  } = useDatabase();

  const [activeSubSection, setActiveSubSection] = useState<
    'org' | 'founder' | 'backup' | 'security'
  >('org');

  // Org form state
  const [orgForm, setOrgForm] = useState({
    name: db.organization.name,
    tagline: db.organization.tagline,
    description: db.organization.description,
    logoUrl: db.organization.logoUrl,
    contactEmail: db.organization.contactEmail,
    contactPhone: db.organization.contactPhone,
    address: db.organization.address,
    establishedYear: db.organization.establishedYear,
  });
  const [orgSaved, setOrgSaved] = useState(false);

  // Security / PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Backup & Restore
  const [importJson, setImportJson] = useState('');
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleOrgSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(orgForm);
    setOrgSaved(true);
    setTimeout(() => setOrgSaved(false), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setOrgForm((prev) => ({ ...prev, logoUrl: b64 }));
    }
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setPinMessage({ text: 'PIN must be at least 4 digits', isError: true });
      return;
    }
    const success = changeAdminPin(oldPin, newPin);
    if (success) {
      setPinMessage({ text: 'Administrator PIN successfully updated', isError: false });
      setOldPin('');
      setNewPin('');
    } else {
      setPinMessage({ text: 'Current PIN is incorrect', isError: true });
    }
  };

  const handleExport = () => {
    const data = exportDatabaseJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `An_Noor_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const success = importDatabaseJSON(importJson);
    if (success) {
      setRestoreMessage({ text: 'Database successfully restored from JSON backup', isError: false });
      setImportJson('');
    } else {
      setRestoreMessage({ text: 'Invalid JSON format or corrupted schema', isError: true });
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all records to default organization state?')) {
      resetDatabase();
      alert('Database restored to default demo state.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#7A1224] to-[#580B18] text-white rounded-3xl p-6 shadow-lg border border-amber-400/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E4BC52]" />
            <h2 className="text-xl font-bold font-cinzel text-amber-100">
              Administrative Control Center
            </h2>
          </div>
          <p className="text-xs text-stone-200 mt-1">
            Dynamic CMS & security configuration. All changes update the database in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-[#0E4D34] text-emerald-100 px-3 py-1 rounded-full border border-emerald-500/30">
            Authenticated Admin
          </span>
          <button
            onClick={logoutAdmin}
            className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Quick Navigation to other module managers */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-2">
          Module Direct Managers
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('founder')}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7A1224] hover:bg-stone-50 flex items-center gap-2 text-left transition"
          >
            <Award className="w-4 h-4 text-[#C59B27]" />
            <div>
              <p className="font-bold text-stone-800">Founder Profile</p>
              <p className="text-[10px] text-stone-500">Edit Bio & Photo</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-[#7A1224] hover:bg-stone-50 flex items-center gap-2 text-left transition"
          >
            <Users className="w-4 h-4 text-[#7A1224]" />
            <div>
              <p className="font-bold text-stone-800">Members ({db.members.length})</p>
              <p className="text-[10px] text-stone-500">Add & Edit Roster</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-[#0E4D34] hover:bg-stone-50 flex items-center gap-2 text-left transition"
          >
            <BookOpen className="w-4 h-4 text-[#0E4D34]" />
            <div>
              <p className="font-bold text-stone-800">Books ({db.books.length})</p>
              <p className="text-[10px] text-stone-500">Upload PDFs & Cores</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className="p-2.5 rounded-xl border border-stone-200 hover:border-[#0E4D34] hover:bg-stone-50 flex items-center gap-2 text-left transition"
          >
            <Wallet className="w-4 h-4 text-[#0E4D34]" />
            <div>
              <p className="font-bold text-stone-800">Finance & Ledgers</p>
              <p className="text-[10px] text-stone-500">Post Transactions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Sub-section Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveSubSection('org')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubSection === 'org'
              ? 'bg-[#7A1224] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Organization Profile & Logo</span>
        </button>

        <button
          onClick={() => setActiveSubSection('backup')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubSection === 'backup'
              ? 'bg-[#0E4D34] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Restore Database</span>
        </button>

        <button
          onClick={() => setActiveSubSection('security')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubSection === 'security'
              ? 'bg-stone-800 text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Change Admin PIN</span>
        </button>
      </div>

      {/* Organization Settings */}
      {activeSubSection === 'org' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold font-cinzel text-stone-900">
                Organization Information & Logo
              </h3>
              <p className="text-xs text-stone-500">
                Update identity, contact details, and branding stored in dynamic database.
              </p>
            </div>
            {orgSaved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved Successfully
              </span>
            )}
          </div>

          <form onSubmit={handleOrgSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Established Year
                </label>
                <input
                  type="text"
                  value={orgForm.establishedYear}
                  onChange={(e) => setOrgForm({ ...orgForm, establishedYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Motto / Tagline *
              </label>
              <input
                type="text"
                required
                value={orgForm.tagline}
                onChange={(e) => setOrgForm({ ...orgForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            {/* Official Logo Upload */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Organizational Logo
              </label>
              <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#C59B27] bg-white shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src={orgForm.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={orgForm.logoUrl}
                    onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })}
                    placeholder="Logo Image URL"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white outline-hidden"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-lg cursor-pointer transition font-semibold text-[11px]">
                    <Upload className="w-3 h-3" />
                    <span>Upload New Official Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Organizational Introduction & Mission *
              </label>
              <textarea
                rows={3}
                required
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-[#7A1224] outline-hidden leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={orgForm.contactEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Official Phone</label>
                <input
                  type="text"
                  value={orgForm.contactPhone}
                  onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-organization"
                className="px-5 py-2.5 bg-[#7A1224] hover:bg-[#580B18] text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
              >
                <Check className="w-4 h-4 text-[#E4BC52]" />
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Backup & Restore */}
      {activeSubSection === 'backup' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold font-cinzel text-stone-900">
              Database Export & Restore (Data Integrity)
            </h3>
            <p className="text-xs text-stone-500">
              Download your full organizational state as JSON, or restore from a previous backup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <FileDown className="w-6 h-6 text-[#0E4D34] mb-2" />
                <h4 className="text-xs font-bold text-stone-800">Export Complete JSON Backup</h4>
                <p className="text-[11px] text-stone-500 mt-1">
                  Downloads all current founder profiles, members, books, event records, and audited financial ledger entries.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="mt-4 px-4 py-2 bg-[#0E4D34] hover:bg-[#093322] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Database JSON</span>
              </button>
            </div>

            {/* Reset */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
              <div>
                <RefreshCw className="w-6 h-6 text-[#C59B27] mb-2" />
                <h4 className="text-xs font-bold text-amber-900">Reset Demo Database</h4>
                <p className="text-[11px] text-amber-800 mt-1">
                  Restores initial authentic records for An Noor, founder Muhammad Saiful Azam Babar Al-Azhari, and sample financial transactions.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Default State</span>
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <FileUp className="w-4 h-4 text-[#7A1224]" />
              <span>Restore from JSON File or Paste</span>
            </h4>
            <textarea
              rows={4}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste valid database backup JSON string here..."
              className="w-full p-3 bg-white text-[11px] font-mono rounded-xl border border-stone-300 outline-hidden"
            />
            {restoreMessage && (
              <p
                className={`text-xs flex items-center gap-1 font-medium ${
                  restoreMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {restoreMessage.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                {restoreMessage.text}
              </p>
            )}
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-[#7A1224] hover:bg-[#580B18] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <FileUp className="w-4 h-4" />
              <span>Validate & Restore Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Security & Admin PIN */}
      {activeSubSection === 'security' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs max-w-md">
          <h3 className="text-sm font-bold font-cinzel text-stone-900 mb-1">
            Change Administrator PIN
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Protect financial ledger modifications and organizational profile changes.
          </p>

          <form onSubmit={handlePinChange} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Current PIN</label>
              <input
                type="password"
                required
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Enter current PIN"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">New 4-Digit PIN</label>
              <input
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            {pinMessage && (
              <p
                className={`text-xs flex items-center gap-1 font-medium ${
                  pinMessage.isError ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {pinMessage.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                {pinMessage.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#7A1224] hover:bg-[#580B18] text-white font-bold rounded-xl transition shadow-xs mt-2"
            >
              Update Admin PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
