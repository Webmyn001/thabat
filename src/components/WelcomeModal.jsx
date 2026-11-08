import React, { useState } from 'react';
import { BookOpen, Sparkles, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { useProgram } from '../context/ProgramContext';
import { formatDate } from '../utils/scheduleEngine';

export default function WelcomeModal() {
  const { userProfile, programConfig, initializeProgram } = useProgram();
  const [selectedDate, setSelectedDate] = useState(programConfig.startDate || formatDate(new Date()));

  if (programConfig.isInitialized) return null;

  const handleStart = (e) => {
    e.preventDefault();
    initializeProgram(selectedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Top Header Banner with Emerald Gradient */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Welcome • أهلاً وسهلاً</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Assalamu alaykum, {userProfile.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold font-arabic text-emerald-200">
              مراجعتي – 90-Day Qur'an Revision Tracker
            </span>
          </div>

          <p className="mt-3 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Welcome to your personal accountability application, specifically designed to help you regain, solidify, and master your Qur'an memorisation through a structured, rolling 90-day Tikrar discipline.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Phase 1 & Phase 2 Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Phase 1 Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/50">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-semibold mb-2">
                <span>Phase One</span> • <span>Days 1–30</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Intensive 1st 15 Juz Revision
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Weaker portion reinforcement. 3 Juz in the morning, followed by evening Tikrar repetition of the exact same 3 Juz.
              </p>
              <div className="mt-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                • 5-day cycle repeated 6 times (60 sessions)
              </div>
            </div>

            {/* Phase 2 Card */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/50">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-xs font-semibold mb-2">
                <span>Phase Two</span> • <span>Days 31–90</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Full Qur'an Fluency & Khatmahs
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Complete Qur'an revision. 5 Juz daily in a single dedicated session across all 30 Juz sequentially.
              </p>
              <div className="mt-2 text-[11px] font-medium text-teal-800 dark:text-teal-300">
                • 6-day cycle repeated 10 times (60 sessions)
              </div>
            </div>
          </div>

          {/* Key Principles Callout */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Automatic Rolling Queue Protection</span>
            </div>
            <p className="leading-relaxed">
              If life happens and you miss a day or an evening session, unfinished assignments are <strong>never skipped or doubled</strong>. They roll forward seamlessly, protecting your thoroughness and adjusting your projected completion date automatically.
            </p>
          </div>

          {/* Start Date Form */}
          <form onSubmit={handleStart} className="space-y-4 pt-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Select Programme Start Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                You can start today, pick an earlier date if you've already begun, or set an upcoming date.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Begin 90-Day Muroja'ah Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
