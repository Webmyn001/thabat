import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  BookOpen, 
  Clock, 
  Layers, 
  Award,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';
import { QURAN_JUZ } from '../data/quranData.js';

export default function ProgressPage({ setActiveTab }) {
  const { t, language, isRtl } = useLanguage();
  const { metrics } = useProgram();

  const phase1Target = 30;
  const phase1Pct = Math.round(((metrics.phase1SessionsCompleted || 0) / phase1Target) * 100);

  const phase2Target = 30;
  const phase2Pct = Math.round(((metrics.phase2SessionsCompleted || 0) / phase2Target) * 100);

  const phase3Target = 30;
  const phase3Pct = Math.round(((metrics.phase3SessionsCompleted || 0) / phase3Target) * 100);

  const phase4Target = 30;
  const phase4Pct = Math.round(((metrics.phase4SessionsCompleted || 0) / phase4Target) * 100);

  const phase5Target = 60;
  const phase5Pct = Math.round(((metrics.phase5SessionsCompleted || 0) / phase5Target) * 100);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white shadow-xl border border-emerald-700/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>{t('analyticsTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'ar' ? "مؤشرات المداومة وإتقان الحفظ" : "Hifz Mastery & Revision Analytics"}
            </h1>
            <p className="mt-1 text-emerald-100/80 text-xs sm:text-sm max-w-xl font-light">
              {language === 'ar'
                ? "متابعة دقيقة لمسار الـ 90 يوماً عبر المراحل الخمس (18 ختمة كاملة - 180 ورداً)، ومعدل تكرار أجزاء القرآن الكريم الـ 30."
                : "Tracking your 90-day trajectory across all five phases (18 full Khatmahs - 180 sessions), streaks, and individual Juz revision frequencies."}
            </p>
          </div>

          {/* Large Overall Progress Card */}
          <div className="bg-white/10 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-5">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${metrics.overallPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{metrics.overallPercentage}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-200 font-bold">{t('descriptor')}</div>
              <div className="text-xl font-extrabold text-white">{metrics.totalSessionsCompleted} / {metrics.totalSessionsTarget || 180}</div>
              <div className="text-[11px] text-emerald-300 font-medium">{t('sessionsCompleted')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('sessionsCompleted')}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalSessionsCompleted} <span className="text-xs text-slate-400">/ {metrics.totalSessionsTarget || 180}</span></div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">{metrics.overallPercentage}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('daysCompleted')}</div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{metrics.fullyCompletedDays} <span className="text-xs text-slate-400">/ 90</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{Math.round((metrics.fullyCompletedDays / 90) * 100)}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">{t('missedDays')}</div>
          <div className={`text-2xl font-black ${metrics.missedDaysCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {metrics.missedDaysCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.missedDaysCount === 0 ? 'Flawless' : 'Rolled forward'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{t('streak')}</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.currentStreak} <span className="text-xs text-slate-400">{t('day')}</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Active habit</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">Longest Streak</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.longestStreak} <span className="text-xs text-slate-400">{t('day')}</span></div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Personal best</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">Remaining Days</div>
          <div className="text-2xl font-black text-teal-700 dark:text-teal-400">{Math.max(0, 90 - metrics.fullyCompletedDays)}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">To graduation</div>
        </div>

      </div>

      {/* 5-Phase Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Phase 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
              {t('phase1Title')}
            </span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{phase1Pct}%</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('phase1Scope')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('phase1Desc')}</p>
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{metrics.phase1SessionsCompleted || 0} / 30 Sessions</span>
              <span>{Math.min(15, Math.ceil((metrics.phase1SessionsCompleted || 0) / 2))} / 15 Days</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, phase1Pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold">
              {t('phase2Title')}
            </span>
            <span className="text-sm font-black text-teal-700 dark:text-teal-400">{phase2Pct}%</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('phase2Scope')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('phase2Desc')}</p>
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{metrics.phase2SessionsCompleted || 0} / 30 Sessions</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Khatmahs #1–6</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, phase2Pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-xs font-bold">
              {t('phase3Title')}
            </span>
            <span className="text-sm font-black text-cyan-700 dark:text-cyan-400">{phase3Pct}%</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('phase3Scope')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('phase3Desc')}</p>
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{metrics.phase3SessionsCompleted || 0} / 30 Sessions</span>
              <span>{Math.min(15, Math.ceil((metrics.phase3SessionsCompleted || 0) / 2))} / 15 Days</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-cyan-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, phase3Pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Phase 4 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
              {t('phase4Title')}
            </span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-400">{phase4Pct}%</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('phase4Scope')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('phase4Desc')}</p>
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{metrics.phase4SessionsCompleted || 0} / 30 Sessions</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Khatmahs #7–12</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, phase4Pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Phase 5 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 dark:border-amber-600/50 shadow-md space-y-4 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-bold">
              {t('phase5Title')}
            </span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{phase5Pct}%</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('phase5Scope')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{t('phase5Desc')}</p>
          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <span>{metrics.phase5SessionsCompleted || 0} / 60 Sessions (30 Days × 2 Sessions)</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Khatmahs #13–18</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, phase5Pct)}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* 30-Juz Heatmap Matrix */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t('juzMatrixTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative number of times each of the 30 Juz has been revised throughout the programme.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{t('navHistory')}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {QURAN_JUZ.map((item) => {
            const count = metrics.juzCountMap[item.juz] || 0;
            let intensity = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400';
            if (count >= 10) intensity = 'bg-emerald-600 text-white border-emerald-500 shadow-xs';
            else if (count >= 6) intensity = 'bg-emerald-500 text-white border-emerald-400';
            else if (count >= 3) intensity = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300';
            else if (count >= 1) intensity = 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border-teal-200';

            return (
              <div key={item.juz} className={`p-3 rounded-2xl border transition-all ${intensity}`}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Juz {item.juz}</span>
                  <span className="font-arabic text-xs font-bold">{item.arabic}</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-black">{count}</span>
                  <span className="text-[10px] font-medium opacity-80">{t('timesRevised')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
