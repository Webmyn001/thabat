import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Grid, 
  Edit3, 
  Save, 
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';
import { 
  formatDate, 
  formatDisplayDate 
} from '../utils/scheduleEngine.js';

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const { 
    enrolment, 
    sessions, 
    metrics, 
    customDayNotes, 
    setDayNote, 
    currentDateStr
  } = useProgram();

  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const startDate = enrolment?.startDate || currentDateStr;

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const [y, m] = (startDate || currentDateStr).split('-').map(Number);
    return new Date(y, m - 1, 1);
  });

  const getDayStatusForDate = (dateStr) => {
    const isPast = dateStr < currentDateStr;
    const isToday = dateStr === currentDateStr;
    const isBeforeStart = dateStr < startDate;

    if (isBeforeStart) {
      return { status: 'before_start', label: 'Before Start', color: 'bg-transparent text-slate-300' };
    }

    const completedOnThisDate = Object.entries(sessions)
      .filter(([_, s]) => {
        const cDate = s.completedDate || (s.completedAt ? formatDate(new Date(s.completedAt)) : null);
        return s.isCompleted && cDate === dateStr;
      })
      .map(([id, s]) => ({ id, ...s }));

    const count = completedOnThisDate.length;

    if (isPast) {
      if (count === 0) {
        return { 
          status: 'missed', 
          label: language === 'ar' ? 'يوم متأخر' : 'Missed Day', 
          color: 'bg-rose-500 text-white border-rose-600',
          dot: 'bg-rose-500',
          completedSessions: completedOnThisDate
        };
      } else if (count === 1) {
        return { 
          status: 'partial', 
          label: language === 'ar' ? 'مكتمل جزئياً' : 'Partially Completed', 
          color: 'bg-amber-400 text-slate-900 border-amber-500 font-bold',
          dot: 'bg-amber-400',
          completedSessions: completedOnThisDate
        };
      } else {
        return { 
          status: 'completed', 
          label: language === 'ar' ? 'مكتمل بالكامل' : 'Fully Completed', 
          color: 'bg-emerald-600 text-white border-emerald-700',
          dot: 'bg-emerald-500',
          completedSessions: completedOnThisDate
        };
      }
    } else if (isToday) {
      if (count >= 2) {
        return { 
          status: 'completed', 
          label: language === 'ar' ? 'أُنجز اليوم' : 'Completed Today', 
          color: 'bg-emerald-600 text-white ring-2 ring-emerald-400',
          dot: 'bg-emerald-500',
          completedSessions: completedOnThisDate
        };
      } else if (count === 1) {
        return { 
          status: 'partial', 
          label: language === 'ar' ? 'أُنجز جزء اليوم' : 'Partial Today', 
          color: 'bg-amber-400 text-slate-900 ring-2 ring-amber-400',
          dot: 'bg-amber-400',
          completedSessions: completedOnThisDate
        };
      } else {
        return { 
          status: 'today_pending', 
          label: language === 'ar' ? 'اليوم المستحق' : 'Today (Active)', 
          color: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-emerald-500',
          dot: 'bg-emerald-400 animate-pulse',
          completedSessions: []
        };
      }
    } else {
      return { 
        status: 'upcoming', 
        label: language === 'ar' ? 'يوم قادم' : 'Upcoming Day', 
        color: 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800',
        dot: 'bg-slate-300 dark:bg-slate-700',
        completedSessions: []
      };
    }
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7;

  const monthName = currentMonthDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { month: 'long', year: 'numeric' });

  const handleSelectDay = (dateStr) => {
    const statusInfo = getDayStatusForDate(dateStr);
    setSelectedDayRecord({
      dateStr,
      displayDate: formatDisplayDate(dateStr, language),
      statusInfo,
      note: customDayNotes[dateStr] || ''
    });
    setNoteInput(customDayNotes[dateStr] || '');
    setIsEditingNote(false);
  };

  const handleSaveNote = () => {
    if (!selectedDayRecord) return;
    setDayNote(selectedDayRecord.dateStr, noteInput);
    setSelectedDayRecord(prev => ({ ...prev, note: noteInput }));
    setIsEditingNote(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('historyTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking every calendar day of your 90-day revision journey with color-coded accountability.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'calendar' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-white dark:bg-emerald-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="font-bold text-slate-800 dark:text-slate-200">
          {language === 'ar' ? 'دليل الألوان:' : 'Calendar Legend:'}
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 shadow-xs" />
            <span>{t('legendCompleted')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-400 shadow-xs" />
            <span>{t('legendPartial')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-xs" />
            <span>{t('legendMissed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700" />
            <span>{t('legendUpcoming')}</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {monthName}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => {
                  const [cy, cm] = currentDateStr.split('-').map(Number);
                  setCurrentMonthDate(new Date(cy, cm - 1, 1));
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayInfo = getDayStatusForDate(dateStr);
              const isToday = dateStr === currentDateStr;
              const hasNote = !!customDayNotes[dateStr];

              return (
                <button
                  key={dateStr}
                  onClick={() => handleSelectDay(dateStr)}
                  className={`h-14 sm:h-20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border flex flex-col justify-between text-left rtl:text-right transition-all hover:scale-[1.02] cursor-pointer ${dayInfo.color}`}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-xs sm:text-sm font-extrabold">{dayNum}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isToday && (
                        <span className="hidden sm:inline text-[9px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded-full bg-emerald-700 text-white">
                          Today
                        </span>
                      )}
                      {hasNote && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`sm:hidden w-2 h-2 rounded-full shrink-0 ${dayInfo.dot || 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="hidden sm:block text-[10px] truncate font-medium">
                      {dayInfo.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {metrics.calendarDaysLog.slice().reverse().map((item) => {
              const statusInfo = getDayStatusForDate(item.date);
              return (
                <div
                  key={item.date}
                  onClick={() => handleSelectDay(item.date)}
                  className="py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${statusInfo.dot || 'bg-slate-400'}`} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{formatDisplayDate(item.date, language)}</span>
                        {item.isToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {statusInfo.label} • {item.activityCount} session(s)
                      </div>
                    </div>
                  </div>

                  <span className="hidden sm:inline text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Day Audit Record</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDayRecord.displayDate}</h3>
              </div>
              <button onClick={() => setSelectedDayRecord(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-2">
              <div><strong>Status:</strong> {selectedDayRecord.statusInfo.label}</div>
              <div><strong>Completed Sessions on this Date:</strong> {selectedDayRecord.statusInfo.completedSessions?.length || 0}</div>
            </div>

            {/* Note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500">Muroja'ah Personal Reflection / Note:</span>
                {!isEditingNote && (
                  <button onClick={() => setIsEditingNote(true)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5" /> <span>Edit Note</span>
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-2">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    rows={3}
                    placeholder="Write reflections or notes on verses..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingNote(false)} className="px-3 py-1.5 rounded-lg text-xs">Cancel</button>
                    <button onClick={handleSaveNote} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 min-h-[40px]">
                  {selectedDayRecord.note || <span className="italic text-slate-400">No notes written for this day.</span>}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedDayRecord(null)} className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
