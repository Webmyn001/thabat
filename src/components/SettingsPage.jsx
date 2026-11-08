import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Calendar, 
  Download, 
  Upload, 
  CheckCircle2, 
  Search, 
  Save, 
  Globe, 
  Check, 
  User, 
  RotateCcw 
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';
import { 
  CANONICAL_PROGRAM, 
  formatDisplayDate, 
  formatDate 
} from '../utils/scheduleEngine.js';

export default function SettingsPage() {
  const { currentUser, token, refreshUser } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { 
    enrolment, 
    metrics, 
    sessions, 
    updateStartDate, 
    markSessionComplete, 
    undoSessionComplete 
  } = useProgram();

  const [startDateInput, setStartDateInput] = useState(enrolment?.startDate || formatDate(new Date()));
  const [dateUpdatedSuccess, setDateUpdatedSuccess] = useState(false);
  const [filterPhase, setFilterPhase] = useState('all');
  const [searchDayQuery, setSearchDayQuery] = useState('');

  // Profile update
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveStartDate = async (e) => {
    e.preventDefault();
    if (!startDateInput) return;
    await updateStartDate(startDateInput);
    setDateUpdatedSuccess(true);
    setTimeout(() => setDateUpdatedSuccess(false), 2500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: phoneInput })
      });
      if (res.ok) {
        await refreshUser();
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleToggleSession = async (dayNumber, sessionType) => {
    const sessionId = sessionType === 'daily' ? `d${dayNumber}_daily` : `d${dayNumber}_${sessionType}`;
    const isDone = !!sessions[sessionId]?.isCompleted;
    if (isDone) {
      await undoSessionComplete(dayNumber, sessionType);
    } else {
      await markSessionComplete(dayNumber, sessionType);
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupObj = {
      app: "THABĀT | ثبات",
      exportedAt: new Date().toISOString(),
      user: currentUser,
      enrolment,
      sessions
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thabat-backup-${currentUser?.fullName?.replace(/\s+/g, '_')}-${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDays = CANONICAL_PROGRAM.filter(d => {
    if (filterPhase === '1' && d.phase !== 1) return false;
    if (filterPhase === '2' && d.phase !== 2) return false;
    if (filterPhase === '3' && d.phase !== 3) return false;
    if (searchDayQuery.trim()) {
      const q = searchDayQuery.trim().toLowerCase();
      return d.dayNumber.toString().includes(q) || d.juzLabelEn.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t('navSettings')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Participant preferences, start date adjustments, manual session logs, and backup exports.
        </p>
      </div>

      {/* Profile & Language Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Participant Profile & Language</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">{t('fullName')}</span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white py-1">{currentUser?.fullName}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">{t('email')}</span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white py-1">{currentUser?.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <label className="text-[11px] uppercase font-bold text-slate-400 block mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> <span>Update Profile</span>
            </button>
            {profileSaved && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> Updated!</span>}
          </div>
        </form>
      </section>

      {/* Schedule Adjustment Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Programme Schedule Dates</span>
        </h3>

        <form onSubmit={handleSaveStartDate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">{t('startDate')}</label>
              <input
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="block text-[11px] font-bold uppercase text-slate-400 mb-1">{t('originalDeadline')}</span>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 py-1.5">{formatDisplayDate(metrics.originalDeadline, language)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="block text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1">{t('revisedDeadline')}</span>
              <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 py-1.5">{formatDisplayDate(metrics.revisedDeadline, language)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> <span>Update Schedule</span>
            </button>
            {dateUpdatedSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> Start date updated!</span>}
          </div>
        </form>
      </section>

      {/* Manual Session Correction Tool */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Manual Session Correction Tool</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Review or correct any past session completed offline.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Day or Juz..."
              value={searchDayQuery}
              onChange={(e) => setSearchDayQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-48"
            />
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="all">All Phases</option>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
              <option value="3">Phase 3</option>
            </select>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Day</th>
                <th className="py-2.5 px-4">Phase</th>
                <th className="py-2.5 px-4">Portion</th>
                <th className="py-2.5 px-4 text-center">Session 1</th>
                <th className="py-2.5 px-4 text-center">Session 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredDays.map((day) => {
                const mDone = !!sessions[`d${day.dayNumber}_morning`]?.isCompleted;
                const eDone = !!sessions[`d${day.dayNumber}_evening`]?.isCompleted;
                const dDone = !!sessions[`d${day.dayNumber}_daily`]?.isCompleted;

                return (
                  <tr key={day.dayNumber} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">Day {day.dayNumber}</td>
                    <td className="py-2.5 px-4 text-slate-400">Phase {day.phase}</td>
                    <td className="py-2.5 px-4 font-semibold text-emerald-700 dark:text-emerald-400">{day.juzLabelEn}</td>
                    
                    {day.phase !== 3 ? (
                      <>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleSession(day.dayNumber, 'morning')}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                              mDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {mDone ? 'Completed' : 'Pending'}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleSession(day.dayNumber, 'evening')}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                              eDone ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {eDone ? 'Completed' : 'Pending'}
                          </button>
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSession(day.dayNumber, 'daily')}
                          className={`w-full max-w-[180px] py-1 rounded-lg text-[11px] font-bold ${
                            dDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {dDone ? 'Daily Complete' : 'Daily Pending'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Backup Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>Download Personal Backup (JSON)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Export a secure JSON backup of your 90-day progress records.</p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON File</span>
        </button>
      </section>

    </div>
  );
}
