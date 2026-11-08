import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Sparkles, 
  Settings as SettingsIcon, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar,
  X
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDisplayDate, TOTAL_PROGRAM_SESSIONS } from '../utils/scheduleEngine.js';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { t, language } = useLanguage();

  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview' | 'participants' | 'inspirations' | 'settings'
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Inspirations manager
  const [inspirations, setInspirations] = useState([]);
  const [inspirationCategoryFilter, setInspirationCategoryFilter] = useState('all');
  const [showAddInspirationModal, setShowAddInspirationModal] = useState(false);
  const [newInspiration, setNewInspiration] = useState({
    category: 'hadith',
    arabicText: '',
    englishText: '',
    sourceReference: '',
    attribution: ''
  });

  // Settings
  const [settings, setSettings] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch overview & participants
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/overview`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(setOverview).catch(console.error);

    fetch(`${API_BASE}/admin/participants`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => setParticipants(d.participants || [])).catch(console.error);

    fetch(`${API_BASE}/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSettings(d.settings || null)).catch(console.error);

    fetch(`${API_BASE}/inspirations/archive?category=all`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(d => setInspirations(d.reminders || [])).catch(console.error);
  }, [token]);

  // Handle settings update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!token || !settings) return;
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } catch (err) {
      alert("Failed to update settings.");
    }
  };

  // Handle add inspiration
  const handleAddInspiration = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/inspirations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInspiration)
      });
      if (res.ok) {
        setShowAddInspirationModal(false);
        setNewInspiration({ category: 'hadith', arabicText: '', englishText: '', sourceReference: '', attribution: '' });
        // Refresh
        const refreshed = await fetch(`${API_BASE}/inspirations/archive?category=all`);
        const data = await refreshed.json();
        setInspirations(data.reminders || []);
      }
    } catch (err) {
      alert("Failed to add inspiration.");
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
  });

  // Filter inspirations
  const filteredInspirations = inspirations.filter(i => {
    if (inspirationCategoryFilter === 'all') return true;
    return i.category === inspirationCategoryFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Authorized Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('adminTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-user surveillance, participant progress verification, and platform management.
          </p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveAdminTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'overview' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveAdminTab('participants')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'participants' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            {t('tabParticipants')} ({participants.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('inspirations')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'inspirations' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            {t('tabInspirations')}
          </button>
          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'settings' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            {t('tabSettings')}
          </button>
        </div>
      </div>

      {/* TAB 1: Overview KPIs */}
      {activeAdminTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('totalParticipants')}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{overview.totalParticipants}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified Huffadh</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('activeParticipants')}</div>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{overview.activeParticipants}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Revising actively</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('graduatedParticipants')}</div>
              <div className="text-3xl font-black text-teal-700 dark:text-teal-400">{overview.completedParticipants}</div>
              <div className="text-[11px] text-teal-600 font-medium mt-1">100% Completed</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('certificatesIssued')}</div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{overview.certificatesIssued}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">{overview.certificateDownloads} downloads logged</div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Health & Execution</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Total completed revision sessions across all participants: <strong>{overview.totalCompletedSessions}</strong>.
                Total missed calendar days accommodated by the rolling engine: <strong>{overview.totalMissedDays}</strong>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveAdminTab('participants')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Inspect Participant Directory
                </button>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Inspiration Library Status</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Database initialized with <strong>{inspirations.length}</strong> verified Islamic reminders (Qur'an, Hadith, Scholarly quotes, and Spiritual reflections).
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveAdminTab('inspirations')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Manage 180 Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Participants Directory */}
      {activeAdminTab === 'participants' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Registered Participants Directory
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
              />
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4 text-center">Sessions</th>
                  <th className="py-3 px-4 text-center">Progress</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400">{p.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDisplayDate(p.startDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Day {p.currentProgramDay}</span>
                      <span className="text-[10px] text-slate-400 block">Phase {p.currentPhase}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {p.totalSessionsCompleted} / {TOTAL_PROGRAM_SESSIONS}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.overallPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-amber-600">
                      {p.currentStreak}d
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedParticipant(p)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                        title="Inspect participant profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Inspirations Manager (180 entries) */}
      {activeAdminTab === 'inspirations' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Daily Inspiration Library ({inspirations.length} Reminders)
              </h3>
              <p className="text-xs text-slate-500">
                180 verified daily entries across Quran, Hadith, Scholars, and Motivational reflections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={inspirationCategoryFilter}
                onChange={(e) => setInspirationCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="hadith">Hadith</option>
                <option value="quran">Qur'an</option>
                <option value="scholar">Scholar Quotes</option>
                <option value="motivation">Motivation</option>
              </select>

              <button
                onClick={() => setShowAddInspirationModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
            {filteredInspirations.map((item) => (
              <div 
                key={item.id || item.dayIndex}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span className="uppercase text-emerald-700 dark:text-emerald-400">{item.category}</span>
                    <span>#{item.dayIndex || item.id}</span>
                  </div>
                  <div dir="rtl" className="font-arabic text-sm sm:text-base font-bold text-slate-900 dark:text-emerald-100 text-right py-1">
                    « {item.arabicText} »
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    "{item.englishText}"
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 font-medium">
                  {item.sourceReference || item.attribution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Platform Settings */}
      {activeAdminTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            <span>Platform & Certificate Director Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Director / Programme Owner Name (English)
              </label>
              <input
                type="text"
                value={settings.directorNameEn}
                onChange={(e) => setSettings({ ...settings, directorNameEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Director Name (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.directorNameAr}
                onChange={(e) => setSettings({ ...settings, directorNameAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold font-arabic"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Director Title (English)
              </label>
              <input
                type="text"
                value={settings.signatureTitleEn}
                onChange={(e) => setSettings({ ...settings, signatureTitleEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Director Title (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.signatureTitleAr}
                onChange={(e) => setSettings({ ...settings, signatureTitleAr: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-arabic"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveSettings')}</span>
            </button>
            {settingsSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
              </span>
            )}
          </div>
        </form>
      )}

      {/* Add Inspiration Modal */}
      {showAddInspirationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Verified Daily Reminder</h3>
              <button onClick={() => setShowAddInspirationModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAddInspiration} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select
                  value={newInspiration.category}
                  onChange={(e) => setNewInspiration({ ...newInspiration, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="hadith">Hadith</option>
                  <option value="quran">Qur'anic Verse</option>
                  <option value="scholar">Scholar Statement</option>
                  <option value="motivation">Motivation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Arabic Text (الرسم القرآني / الحديث)</label>
                <textarea
                  dir="rtl"
                  required
                  rows={2}
                  value={newInspiration.arabicText}
                  onChange={(e) => setNewInspiration({ ...newInspiration, arabicText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-arabic text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">English Translation</label>
                <textarea
                  required
                  rows={2}
                  value={newInspiration.englishText}
                  onChange={(e) => setNewInspiration({ ...newInspiration, englishText: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Exact Source Reference (e.g. Sahih al-Bukhari 5027 / Surah Fatir 35:29)</label>
                <input
                  type="text"
                  required
                  value={newInspiration.sourceReference}
                  onChange={(e) => setNewInspiration({ ...newInspiration, sourceReference: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Attribution / Narrator</label>
                <input
                  type="text"
                  value={newInspiration.attribution}
                  onChange={(e) => setNewInspiration({ ...newInspiration, attribution: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInspirationModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Inspection Drawer / Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Participant Audit Record</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedParticipant.fullName}</h3>
              </div>
              <button onClick={() => setSelectedParticipant(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div><strong>Email:</strong> {selectedParticipant.email}</div>
              <div><strong>Phone:</strong> {selectedParticipant.phone || 'Not specified'}</div>
              <div><strong>Start Date:</strong> {selectedParticipant.startDate}</div>
              <div><strong>Current Programme Day:</strong> Day {selectedParticipant.currentProgramDay} (Phase {selectedParticipant.currentPhase})</div>
              <div><strong>Completed Sessions:</strong> {selectedParticipant.totalSessionsCompleted} / {TOTAL_PROGRAM_SESSIONS} ({selectedParticipant.overallPercentage}%)</div>
              <div><strong>Missed Days:</strong> {selectedParticipant.missedDaysCount}</div>
              <div><strong>Current Streak:</strong> {selectedParticipant.currentStreak} days</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
