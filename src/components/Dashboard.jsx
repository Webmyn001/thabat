import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Sparkles, 
  Flame, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';
import { 
  formatDisplayDate, 
  getJuzDetails, 
  CANONICAL_PROGRAM,
  formatDate
} from '../utils/scheduleEngine.js';

export default function Dashboard({ setActiveTab }) {
  const { currentUser } = useAuth();
  const { t, isRtl, language } = useLanguage();
  const { 
    sessions, 
    metrics, 
    activeDay, 
    dailyInspiration, 
    markSessionComplete, 
    undoSessionComplete,
    currentDateStr
  } = useProgram();

  const [copiedQuote, setCopiedQuote] = useState(false);
  const [viewedDayOffset, setViewedDayOffset] = useState(0); // 0 means activeDay
  const [actionError, setActionError] = useState('');

  // Current day being inspected (defaults to activeDay from rolling schedule)
  const currentDayIndex = activeDay ? activeDay.dayNumber - 1 : 0;
  const targetIndex = Math.max(0, Math.min(89, currentDayIndex + viewedDayOffset));
  const displayedDay = CANONICAL_PROGRAM[targetIndex] || activeDay;

  const isLookingAtFutureOrPast = viewedDayOffset !== 0;
  const isFutureDay = displayedDay.dayNumber > (activeDay ? activeDay.dayNumber : 1);

  // Session status helpers for displayed day
  const getSessionState = (sessionId) => {
    return sessions[sessionId] || { isCompleted: false };
  };

  const isMorningDone = !!getSessionState(`d${displayedDay.dayNumber}_morning`).isCompleted;
  const isEveningDone = !!getSessionState(`d${displayedDay.dayNumber}_evening`).isCompleted;
  const isReadingDone = !!getSessionState(`d${displayedDay.dayNumber}_reading`).isCompleted;
  const isOffhandDone = !!getSessionState(`d${displayedDay.dayNumber}_offhand`).isCompleted;

  const isDayFullyFinished = displayedDay.sessions.every(sess => !!getSessionState(sess.id).isCompleted);

  const morningRecord = getSessionState(`d${displayedDay.dayNumber}_morning`);
  const eveningRecord = getSessionState(`d${displayedDay.dayNumber}_evening`);
  const readingRecord = getSessionState(`d${displayedDay.dayNumber}_reading`);
  const offhandRecord = getSessionState(`d${displayedDay.dayNumber}_offhand`);

  // Assigned Juz details with exact Arabic opening verse incipits
  const juzDetailsList = getJuzDetails(displayedDay.assignedJuz);

  // Handlers for marking sessions
  const handleMarkSession = async (dayNumber, sessionType) => {
    setActionError('');
    try {
      await markSessionComplete(dayNumber, sessionType);
    } catch (err) {
      setActionError(err.message || "Failed to confirm session.");
    }
  };

  const handleUndoSession = async (dayNumber, sessionType) => {
    setActionError('');
    try {
      await undoSessionComplete(dayNumber, sessionType);
    } catch (err) {
      setActionError(err.message || "Failed to undo confirmation.");
    }
  };

  // Copy motivation quote
  const handleCopyQuote = () => {
    if (!dailyInspiration) return;
    const text = `« ${dailyInspiration.arabicText} »\n"${dailyInspiration.englishText}"\n— ${dailyInspiration.sourceReference || dailyInspiration.attribution}`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Welcome Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('descriptor')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold">
                <span>{t('freeBadge')}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('greeting')}, {currentUser?.fullName}
            </h1>
            <p className="mt-2 text-emerald-100/90 text-xs sm:text-base max-w-2xl font-light leading-relaxed">
              {t('todayIs')} <strong className="font-semibold text-white">{formatDisplayDate(currentDateStr, language)}</strong>. 
              {metrics.isAllCompleted ? (
                <span className="font-bold text-emerald-300"> {language === 'ar' ? "مبارك! لقد أتممت كافة أيام برنامج ثبات الـ 90 بنجاح." : "Ma sha Allah! You have completed all 90 days of the Thabāt programme!"}</span>
              ) : (
                <span> {language === 'ar' ? "اجعل نيتك خالصة، واعلم أن كل آية تكررها اليوم بصبر تثبت في صدرك كالجبل الراسخ." : "Keep your intention sincere. Every verse repeated with steadfast Tikrar anchors your Hifz like a steady mountain."}</span>
              )}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 min-w-[130px]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">{metrics.currentStreak} <span className="text-xs font-normal text-emerald-200">{t('day')}</span></div>
                <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">{t('streak')}</div>
              </div>
            </div>

            <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <span className="text-base font-bold">{metrics.overallPercentage}%</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-white">{metrics.totalSessionsCompleted} <span className="text-xs font-normal text-emerald-200">/ {metrics.totalSessionsTarget || 180}</span></div>
                <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">{t('sessionsCompleted')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 90-Day Miniature Progress Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-2">
            <span><strong>{metrics.fullyCompletedDays} {t('of')} 90 {t('daysCompleted')}</strong></span>
            <span>{metrics.overallPercentage}%</span>
          </div>
          <div className="w-full bg-emerald-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-700/40">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, metrics.overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1.5 18x Qur'an Khatmah Completion Milestone Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-5 border-2 border-amber-300/40 dark:border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            18×
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <span>{language === 'ar' ? 'إجمالي ختمات القرآن الكريم في البرنامج: 18 ختمة كاملة' : 'Total Qur\'an Completions in 90 Days: 18 Complete Khatmahs'}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold">18 ختمة</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {language === 'ar' 
                ? 'المراحل 1–4: 12 ختمة تامة (3 أجزاء صباحاً وتكرارها مساءً) • المرحلة 5: 6 ختمات (5 أجزاء قراءة + جزء عن ظهر قلب غيباً)'
                : 'Phases 1–4: 12 Full Khatmahs (3 Juz morning + 3 Juz evening Tikrar) • Phase 5: 6 Khatmahs (5 reading + 1 offhand from pure memory)'}
            </div>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 border border-amber-400/30 text-amber-900 dark:text-amber-200 font-arabic font-bold text-xs tracking-wide shrink-0">
          ختم القرآن 18 مرة كاملاً
        </div>
      </div>

      {/* 2. SPECIFIC USER REQUIREMENT: Daily Islamic Inspiration ON TOP of the task marking area */}
      {dailyInspiration && (
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {t('dailyInspirationTitle')}
                </span>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {dailyInspiration.attribution || dailyInspiration.category}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyQuote}
              title={t('copyQuote')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedQuote ? t('copied') : t('copyQuote')}</span>
            </button>
          </div>

          {/* Arabic Text (Amiri / Scheherazade font) */}
          <div 
            dir="rtl"
            className="font-arabic text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-emerald-100 leading-loose py-2 text-center sm:text-right"
          >
            « {dailyInspiration.arabicText} »
          </div>

          {/* English Translation */}
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic font-serif leading-relaxed mt-2 text-center sm:text-left">
            "{dailyInspiration.englishText}"
          </p>

          {/* Reference Citation */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
            <span>{t('source')}: {dailyInspiration.sourceReference}</span>
            <span className="text-slate-400 text-[10px] font-normal hidden sm:inline">180 Verified Library</span>
          </div>
        </section>
      )}

      {/* 3. HERO: Today's Assigned Revision Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-600/30 dark:border-emerald-500/30 p-6 sm:p-8 shadow-lg relative overflow-hidden">
        
        {/* Top bar with day navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {language === 'ar' ? displayedDay.phaseTitleAr : displayedDay.phaseTitleEn}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('cycleInfo')} {displayedDay.cycleNumber} {t('of')} {displayedDay.totalCyclesInPhase} ({t('day')} {displayedDay.dayInCycle} {t('of')} {displayedDay.cycleLength})
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <span>{isLookingAtFutureOrPast ? `${t('day')} ${displayedDay.dayNumber}` : `${t('activeRevisionCard')}: ${t('day')} ${displayedDay.dayNumber}`}</span>
              {isDayFullyFinished && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('completed')}
                </span>
              )}
            </h2>
          </div>

          {/* Day switcher controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setViewedDayOffset(prev => Math.max(-(currentDayIndex), prev - 1))}
              disabled={displayedDay.dayNumber <= 1}
              title="Previous Day"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            
            {isLookingAtFutureOrPast && (
              <button
                onClick={() => setViewedDayOffset(0)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 hover:bg-emerald-200 transition-colors"
              >
                {language === 'ar' ? "العودة لليوم المستحق" : "Return to Active Day"}
              </button>
            )}

            <button
              onClick={() => setViewedDayOffset(prev => Math.min(89 - currentDayIndex, prev + 1))}
              disabled={displayedDay.dayNumber >= 90}
              title="Next Day"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Action Error Callout */}
        {actionError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* SPECIFIC USER REQUIREMENT: Show the portion the user is to read, ie juz 16 qala alam aqul lakum in arabic for the three juz */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                {t('assignedPortion')} ({t('day')} {displayedDay.dayNumber})
              </div>
              <div className="text-2xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                {language === 'ar' ? displayedDay.juzLabelAr : displayedDay.juzLabelEn}
              </div>
            </div>

            {/* Quick Juz Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {juzDetailsList.map((j) => (
                <div 
                  key={j.juz} 
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200"
                >
                  <span>{language === 'ar' ? `الجزء ${j.juz}` : `Juz ${j.juz}`}</span>
                  <span className="font-arabic font-bold text-slate-800 dark:text-slate-100">({j.arabic})</span>
                </div>
              ))}
            </div>
          </div>

          {/* REQUIRED OPENING VERSES IN ARABIC (Responsive on Mobile & Desktop) */}
          <div className="pt-4 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {t('openingVerses')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {juzDetailsList.map((j) => (
                <div 
                  key={j.juz}
                  className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800/80 shadow-xs flex flex-col justify-between space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>{language === 'ar' ? `الجزء ${j.juz}` : `Juz ${j.juz}`}</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[140px]">{j.surahs.split('–')[0].trim()}</span>
                  </div>
                  
                  {/* Exact Beginning of the verse in Arabic */}
                  <div dir="rtl" className="font-arabic text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-200 leading-relaxed text-right py-1">
                    « {j.verseStartAr} »
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Future Day Warning Notice */}
        {isFutureDay && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{t('cannotMarkFutureNotice')}</span>
          </div>
        )}

        {/* Session Cards according to 5-Phase Specification */}
        {displayedDay.phase <= 4 ? (
          /* PHASES 1 to 4: Two Sessions Daily (3 Juz Morning + 3 Juz Evening Tikrar) */
          <div className="space-y-4">
            {displayedDay.dayNumber === 30 && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                <span>🎉</span>
                <span>{language === 'ar' ? 'إتمام اليوم 30 يُتوّج إكمال 6 ختمات كاملة لكتاب الله (3 صباحاً + 3 مساءً)' : 'Completing Day 30 marks your 6th complete Qur\'an Khatmah of the programme (3 morning + 3 evening Tikrar)!'}</span>
              </div>
            )}
            {displayedDay.dayNumber === 60 && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                <span>🎉</span>
                <span>{language === 'ar' ? 'إتمام اليوم 60 يُتوّج إكمال 12 ختمة تراكمية كاملة للقرآن الكريم (6 صباحاً + 6 مساءً)' : 'Completing Day 60 marks your 12th cumulative complete Qur\'an Khatmah (6 morning + 6 evening Tikrar)!'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning Card */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isMorningDone 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/60 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-400'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isMorningDone ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {t('sessionMorning')}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'ورد الصباح (3 أجزاء)' : 'Morning Revision (3 Juz)'}
                      </h3>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isMorningDone ? 'bg-emerald-600 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {isMorningDone ? t('completed') : t('pending')}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 space-y-1">
                  <p><strong>{language === 'ar' ? 'المقدار:' : 'Portion:'}</strong> {language === 'ar' ? displayedDay.juzLabelAr : displayedDay.juzLabelEn} (3 Juz)</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {language === 'ar' ? `الدورة ${displayedDay.cycleNumber} من 3 · اليوم ${displayedDay.dayInCycle} من 5` : `Cycle ${displayedDay.cycleNumber} of 3 · Day ${displayedDay.dayInCycle} of 5`}
                  </p>
                  {isMorningDone && morningRecord.completedAt && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('completedAt')} {new Date(morningRecord.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDisplayDate(morningRecord.completedDate, language)})
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div>
                  {isMorningDone ? (
                    <button
                      onClick={() => handleUndoSession(displayedDay.dayNumber, 'morning')}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('undoConfirmation')}</span>
                    </button>
                  ) : (
                    <button
                      disabled={isFutureDay}
                      onClick={() => handleMarkSession(displayedDay.dayNumber, 'morning')}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{t('btnMarkMorning')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Evening Card (Tikrar) */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isEveningDone 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/60 shadow-sm' 
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-400'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isEveningDone ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      <Moon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {t('sessionEvening')}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {language === 'ar' ? 'ورد المساء (تكرار نفس الـ 3 أجزاء)' : 'Evening Tikrar (Same 3 Juz)'}
                      </h3>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isEveningDone ? 'bg-emerald-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  }`}>
                    {isEveningDone ? t('completed') : t('pending')}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 space-y-1">
                  <p><strong>{language === 'ar' ? 'المقدار:' : 'Portion:'}</strong> {language === 'ar' ? displayedDay.juzLabelAr : displayedDay.juzLabelEn} ({language === 'ar' ? 'تكرار نفس الـ 3 أجزاء' : 'Repeat Same 3 Juz'})</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {language === 'ar' ? 'تثبيت ما تمت مراجعته في الصباح' : 'Anchors the portion revised during morning'}
                  </p>
                  {isEveningDone && eveningRecord.completedAt && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('completedAt')} {new Date(eveningRecord.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDisplayDate(eveningRecord.completedDate, language)})
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div>
                  {isEveningDone ? (
                    <button
                      onClick={() => handleUndoSession(displayedDay.dayNumber, 'evening')}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('undoConfirmation')}</span>
                    </button>
                  ) : (
                    <button
                      disabled={isFutureDay}
                      onClick={() => handleMarkSession(displayedDay.dayNumber, 'evening')}
                      className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{t('btnMarkEvening')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PHASE FIVE: Two Sessions Daily (5 Juz Reading Morning + 1 Juz Offhand Evening) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Morning: 5 Juz Reading Card */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isReadingDone 
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/60 shadow-sm' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-400'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isReadingDone ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('sessionReading')}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {language === 'ar' ? 'ورد الصباح: مراجعة 5 أجزاء' : 'Morning: 5-Juz Reading'}
                    </h3>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isReadingDone ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {isReadingDone ? t('completed') : t('pending')}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 space-y-1">
                <p><strong>{language === 'ar' ? 'المقدار:' : 'Portion:'}</strong> {language === 'ar' ? displayedDay.sessions[0]?.juzLabelAr : displayedDay.sessions[0]?.juzLabelEn} (5 Juz)</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {language === 'ar' ? `دورة المراجعة ${displayedDay.cycleNumber} من 5 · مساهمة في الختمات 3–7` : `Reading Cycle ${displayedDay.cycleNumber} of 5 · Contributes to Khatmahs #3–7`}
                </p>
                {isReadingDone && readingRecord.completedAt && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t('completedAt')} {new Date(readingRecord.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDisplayDate(readingRecord.completedDate, language)})
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div>
                {isReadingDone ? (
                  <button
                    onClick={() => handleUndoSession(displayedDay.dayNumber, 'reading')}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('undoConfirmation')}</span>
                  </button>
                ) : (
                  <button
                    disabled={isFutureDay}
                    onClick={() => handleMarkSession(displayedDay.dayNumber, 'reading')}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('btnMarkReading')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Evening: 1 Juz Offhand (From Memory) Card */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isOffhandDone 
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/60 shadow-sm' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-400'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isOffhandDone ? 'bg-emerald-600 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('sessionOffhand')}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {language === 'ar' ? 'ورد المساء: عن ظهر قلب' : 'Evening: 1-Juz Offhand'}
                    </h3>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isOffhandDone ? 'bg-emerald-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                }`}>
                  {isOffhandDone ? t('completed') : t('pending')}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 space-y-1">
                <p><strong>{language === 'ar' ? 'المقدار:' : 'Portion:'}</strong> {language === 'ar' ? displayedDay.sessions[1]?.juzLabelAr : displayedDay.sessions[1]?.juzLabelEn} ({language === 'ar' ? 'غيباً عن ظهر قلب بلا نظر' : 'Recited purely from memory'})</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                  {language === 'ar' ? 'يكتمل به ختم المصحف غيباً بالكامل (الختمة #8)' : 'Completes your 8th Khatmah purely from memory'}
                </p>
                {isOffhandDone && offhandRecord.completedAt && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {t('completedAt')} {new Date(offhandRecord.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDisplayDate(offhandRecord.completedDate, language)})
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div>
                {isOffhandDone ? (
                  <button
                    onClick={() => handleUndoSession(displayedDay.dayNumber, 'offhand')}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('undoConfirmation')}</span>
                  </button>
                ) : (
                  <button
                    disabled={isFutureDay}
                    onClick={() => handleMarkSession(displayedDay.dayNumber, 'offhand')}
                    className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('btnMarkOffhand')}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Day Completed Banner */}
        {isDayFullyFinished && (
          <div className="mt-8 p-5 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 flex items-center gap-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm sm:text-base font-extrabold">
                {t('dayCompletedBanner')}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-0.5">
                {language === 'ar' ? 'تقبل الله طاعتكم وبارك في سعيكم. تتابعك محفوظ في سجلات البرنامج.' : 'May Allah accept your devotion and anchor this memorisation deeply in your heart.'}
              </p>
            </div>
          </div>
        )}

      </section>

      {/* 4. 90-Day Quick Strip Roadmap */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? "خارطة الـ 90 يوماً" : "90-Day Revision Map"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? "انقر على أي يوم لاستعراض مقداره القرآني وأوائل آياته." : "Click any day to view its assigned Juz and opening verses."}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('progress')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t('navProgress')}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-18 gap-1.5 sm:gap-2">
          {CANONICAL_PROGRAM.map((day) => {
            const isDayFinished = day.sessions.every(sess => !!sessions[sess.id]?.isCompleted);
            const isDayPartial = !isDayFinished && day.sessions.some(sess => !!sessions[sess.id]?.isCompleted);

            const isCurrentActive = day.dayNumber === activeDay.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setViewedDayOffset(day.dayNumber - activeDay.dayNumber)}
                className={`h-7 sm:h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                  isCurrentActive
                    ? 'ring-2 ring-emerald-500 scale-105 z-10 bg-emerald-600 text-white shadow-xs'
                    : isDayFinished
                    ? 'bg-emerald-500 text-white'
                    : isDayPartial
                    ? 'bg-amber-400 text-slate-900 font-extrabold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
}
