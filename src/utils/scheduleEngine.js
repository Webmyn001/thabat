import { QURAN_JUZ } from '../data/quranData.js';

/**
 * THABĀT (ثبات) – Canonical 90-Day Revision Programme Definition
 * 
 * PHASE ONE: Days 1–15
 * - Scope: Juz 1–15 (First Pass)
 * - Daily assignment: 3 Juz
 * - Sessions: 2 sessions/day (Morning 3 Juz + Evening Tikrar 3 Juz)
 * - 5-Day cycle repeated 3 times = 30 sessions
 * 
 * PHASE TWO: Days 16–30
 * - Scope: Juz 16–30 (First Pass)
 * - Daily assignment: 3 Juz
 * - Sessions: 2 sessions/day (Morning 3 Juz + Evening Tikrar 3 Juz)
 * - 5-Day cycle repeated 3 times = 30 sessions
 * - Day 30 completes 6 full Khatmahs (3 morning + 3 evening Tikrar)
 * 
 * PHASE THREE: Days 31–45
 * - Scope: Juz 1–15 (Second Pass - Reinforcement)
 * - Daily assignment: 3 Juz
 * - Sessions: 2 sessions/day (Morning 3 Juz + Evening Tikrar 3 Juz)
 * - 5-Day cycle repeated 3 times = 30 sessions
 * 
 * PHASE FOUR: Days 46–60
 * - Scope: Juz 16–30 (Second Pass - Reinforcement)
 * - Daily assignment: 3 Juz
 * - Sessions: 2 sessions/day (Morning 3 Juz + Evening Tikrar 3 Juz)
 * - 5-Day cycle repeated 3 times = 30 sessions
 * - Day 60 completes 6 more full Khatmahs (3 morning + 3 evening Tikrar) -> Cumulative 12 Khatmahs
 * 
 * PHASE FIVE: Days 61–90
 * - Scope: Complete Qur'an (Juz 1–30)
 * - Daily assignment: 5 Juz Morning Reading + 1 Juz Evening Offhand (from pure memory)
 * - 30 days × 2 sessions = 60 sessions
 * - Completes 6 more Khatmahs (5 reading Khatmahs + 1 full offhand Khatmah from memory)
 * 
 * Grand Total: 90 Days, 180 Sessions, 18 Complete Qur'an Khatmahs (ثمانية عشر ختمة كاملة).
 */
export function generateCanonicalProgram() {
  const days = [];

  const firstHalfPatterns = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12],
    [13, 14, 15]
  ];

  const secondHalfPatterns = [
    [16, 17, 18],
    [19, 20, 21],
    [22, 23, 24],
    [25, 26, 27],
    [28, 29, 30]
  ];

  // PHASE 1: Days 1 to 15 (Juz 1–15, 3 Juz daily morning & evening Tikrar)
  for (let dayNumber = 1; dayNumber <= 15; dayNumber++) {
    const cycleIndex = Math.floor((dayNumber - 1) / 5) + 1; // 1 to 3
    const dayInCycle = ((dayNumber - 1) % 5) + 1; // 1 to 5
    const juzList = firstHalfPatterns[dayInCycle - 1];

    days.push({
      dayNumber,
      phase: 1,
      phaseTitleEn: "Phase One: Days 1–15 (Juz 1–15 First Pass)",
      phaseTitleAr: "المرحلة الأولى: الأيام 1–15 (الأجزاء 1–15 الجولة الأولى)",
      phaseShortEn: "Phase 1",
      phaseShortAr: "المرحلة 1",
      cycleNumber: cycleIndex,
      totalCyclesInPhase: 3,
      dayInCycle,
      cycleLength: 5,
      assignedJuz: juzList,
      juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
      juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`,
      sessions: [
        {
          id: `d${dayNumber}_morning`,
          dayNumber,
          type: "morning",
          titleEn: "Morning Revision (3 Juz)",
          titleAr: "ورد الصباح (3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        },
        {
          id: `d${dayNumber}_evening`,
          dayNumber,
          type: "evening",
          titleEn: "Evening Tikrar (Same 3 Juz)",
          titleAr: "تكرار المساء (نفس الـ 3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        }
      ]
    });
  }

  // PHASE 2: Days 16 to 30 (Juz 16–30, 3 Juz daily morning & evening Tikrar)
  for (let dayNumber = 16; dayNumber <= 30; dayNumber++) {
    const dayOffset = dayNumber - 16;
    const cycleIndex = Math.floor(dayOffset / 5) + 1; // 1 to 3
    const dayInCycle = (dayOffset % 5) + 1; // 1 to 5
    const juzList = secondHalfPatterns[dayInCycle - 1];

    days.push({
      dayNumber,
      phase: 2,
      phaseTitleEn: "Phase Two: Days 16–30 (Juz 16–30 First Pass)",
      phaseTitleAr: "المرحلة الثانية: الأيام 16–30 (الأجزاء 16–30 الجولة الأولى)",
      phaseShortEn: "Phase 2",
      phaseShortAr: "المرحلة 2",
      cycleNumber: cycleIndex,
      totalCyclesInPhase: 3,
      dayInCycle,
      cycleLength: 5,
      assignedJuz: juzList,
      juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
      juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`,
      sessions: [
        {
          id: `d${dayNumber}_morning`,
          dayNumber,
          type: "morning",
          titleEn: "Morning Revision (3 Juz)",
          titleAr: "ورد الصباح (3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        },
        {
          id: `d${dayNumber}_evening`,
          dayNumber,
          type: "evening",
          titleEn: "Evening Tikrar (Same 3 Juz)",
          titleAr: "تكرار المساء (نفس الـ 3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        }
      ]
    });
  }

  // PHASE 3: Days 31 to 45 (Juz 1–15, Second Pass - 3 Juz daily morning & evening Tikrar)
  for (let dayNumber = 31; dayNumber <= 45; dayNumber++) {
    const dayOffset = dayNumber - 31;
    const cycleIndex = Math.floor(dayOffset / 5) + 1; // 1 to 3
    const dayInCycle = (dayOffset % 5) + 1; // 1 to 5
    const juzList = firstHalfPatterns[dayInCycle - 1];

    days.push({
      dayNumber,
      phase: 3,
      phaseTitleEn: "Phase Three: Days 31–45 (Juz 1–15 Second Pass)",
      phaseTitleAr: "المرحلة الثالثة: الأيام 31–45 (الأجزاء 1–15 الجولة الثانية)",
      phaseShortEn: "Phase 3",
      phaseShortAr: "المرحلة 3",
      cycleNumber: cycleIndex,
      totalCyclesInPhase: 3,
      dayInCycle,
      cycleLength: 5,
      assignedJuz: juzList,
      juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
      juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`,
      sessions: [
        {
          id: `d${dayNumber}_morning`,
          dayNumber,
          type: "morning",
          titleEn: "Morning Revision (3 Juz)",
          titleAr: "ورد الصباح (3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        },
        {
          id: `d${dayNumber}_evening`,
          dayNumber,
          type: "evening",
          titleEn: "Evening Tikrar (Same 3 Juz)",
          titleAr: "تكرار المساء (نفس الـ 3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        }
      ]
    });
  }

  // PHASE 4: Days 46 to 60 (Juz 16–30, Second Pass - 3 Juz daily morning & evening Tikrar)
  for (let dayNumber = 46; dayNumber <= 60; dayNumber++) {
    const dayOffset = dayNumber - 46;
    const cycleIndex = Math.floor(dayOffset / 5) + 1; // 1 to 3
    const dayInCycle = (dayOffset % 5) + 1; // 1 to 5
    const juzList = secondHalfPatterns[dayInCycle - 1];

    days.push({
      dayNumber,
      phase: 4,
      phaseTitleEn: "Phase Four: Days 46–60 (Juz 16–30 Second Pass)",
      phaseTitleAr: "المرحلة الرابعة: الأيام 46–60 (الأجزاء 16–30 الجولة الثانية)",
      phaseShortEn: "Phase 4",
      phaseShortAr: "المرحلة 4",
      cycleNumber: cycleIndex,
      totalCyclesInPhase: 3,
      dayInCycle,
      cycleLength: 5,
      assignedJuz: juzList,
      juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
      juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`,
      sessions: [
        {
          id: `d${dayNumber}_morning`,
          dayNumber,
          type: "morning",
          titleEn: "Morning Revision (3 Juz)",
          titleAr: "ورد الصباح (3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        },
        {
          id: `d${dayNumber}_evening`,
          dayNumber,
          type: "evening",
          titleEn: "Evening Tikrar (Same 3 Juz)",
          titleAr: "تكرار المساء (نفس الـ 3 أجزاء)",
          assignedJuz: juzList,
          juzLabelEn: `Juz ${juzList[0]}–${juzList[juzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${juzList[0]}–${juzList[juzList.length - 1]}`
        }
      ]
    });
  }

  // PHASE 5: Days 61 to 90 (5 Juz Reading Daily + 1 Juz Offhand Daily)
  // 30 days total. 6-day cycle for the 5-juz reading repeats 5 times (5 Khatmahs).
  // The 1-juz offhand cycles through Juz 1 to 30 over the 30 days (1 full offhand Khatmah).
  const readingPatterns = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30]
  ];

  for (let dayNumber = 61; dayNumber <= 90; dayNumber++) {
    const dayOffset = dayNumber - 61; // 0 to 29
    const cycleIndex = Math.floor(dayOffset / 6) + 1; // 1 to 5
    const dayInCycle = (dayOffset % 6) + 1; // 1 to 6
    const readingJuzList = readingPatterns[dayInCycle - 1];
    const offhandJuz = dayOffset + 1; // 1 to 30

    days.push({
      dayNumber,
      phase: 5,
      phaseTitleEn: "Phase Five: 5 Juz Reading + 1 Juz Offhand Daily",
      phaseTitleAr: "المرحلة الخامسة: 5 أجزاء قراءة + جزء عن ظهر قلب يومياً",
      phaseShortEn: "Phase 5",
      phaseShortAr: "المرحلة 5",
      cycleNumber: cycleIndex,
      totalCyclesInPhase: 5,
      dayInCycle,
      cycleLength: 6,
      assignedJuz: readingJuzList,
      offhandJuz,
      juzLabelEn: `Reading: Juz ${readingJuzList[0]}–${readingJuzList[readingJuzList.length - 1]} | Offhand: Juz ${offhandJuz}`,
      juzLabelAr: `قراءة: الأجزاء ${readingJuzList[0]}–${readingJuzList[readingJuzList.length - 1]} | غيباً: الجزء ${offhandJuz}`,
      sessions: [
        {
          id: `d${dayNumber}_reading`,
          dayNumber,
          type: "reading",
          titleEn: "Morning: 5-Juz Reading",
          titleAr: "الصباح: مراجعة 5 أجزاء",
          assignedJuz: readingJuzList,
          juzLabelEn: `Juz ${readingJuzList[0]}–${readingJuzList[readingJuzList.length - 1]}`,
          juzLabelAr: `الأجزاء ${readingJuzList[0]}–${readingJuzList[readingJuzList.length - 1]}`
        },
        {
          id: `d${dayNumber}_offhand`,
          dayNumber,
          type: "offhand",
          titleEn: "Evening: 1-Juz Offhand (From Memory)",
          titleAr: "المساء: جزء عن ظهر قلب",
          assignedJuz: [offhandJuz],
          juzLabelEn: `Juz ${offhandJuz}`,
          juzLabelAr: `الجزء ${offhandJuz}`
        }
      ]
    });
  }

  return days;
}

export const CANONICAL_PROGRAM = generateCanonicalProgram();
export const ALL_SESSIONS_LIST = CANONICAL_PROGRAM.flatMap(d => d.sessions);
export const TOTAL_PROGRAM_SESSIONS = ALL_SESSIONS_LIST.length; // Exactly 180 sessions
export const TOTAL_QURAN_COMPLETIONS = 18;

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function diffDays(date1Str, date2Str) {
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);
  const diffTime = dt2.getTime() - dt1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDisplayDate(dateStr, lang = 'en') {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const locale = lang === 'ar' ? 'ar-SA' : 'en-GB';
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getJuzDetails(juzNumbers) {
  return juzNumbers.map(num => {
    return QURAN_JUZ.find(j => j.juz === num) || {
      juz: num,
      name: `Juz ${num}`,
      arabic: "",
      verseStartAr: "",
      surahs: ""
    };
  });
}

/**
 * Calculate completion score & honour grade for certificate
 */
export function calculateCertificateScore(totalCompletedSessions, missedDaysCount) {
  const isEligible = totalCompletedSessions >= TOTAL_PROGRAM_SESSIONS;
  if (!isEligible) {
    return {
      isEligible: false,
      scorePercent: 0,
      gradeTitleEn: "Incomplete",
      gradeTitleAr: "غير مكتمل"
    };
  }

  // Base 100% with minor deduction per missed calendar day to reflect consistency
  let score = 100 - (missedDaysCount * 1.5);
  score = Math.max(75, Math.min(100, Math.round(score)));

  let gradeTitleEn = "Distinction with Highest Honours";
  let gradeTitleAr = "ممتاز مع مرتبة الشرف";

  if (missedDaysCount === 0) {
    gradeTitleEn = "Distinction with Highest Honours (Zero Missed Days)";
    gradeTitleAr = "ممتاز مع مرتبة الشرف العليا (بلا أي انقطاع)";
  } else if (missedDaysCount <= 3) {
    gradeTitleEn = "Distinction";
    gradeTitleAr = "ممتاز";
  } else if (missedDaysCount <= 7) {
    gradeTitleEn = "Very Good";
    gradeTitleAr = "جيد جداً";
  } else if (missedDaysCount <= 14) {
    gradeTitleEn = "Good";
    gradeTitleAr = "جيد";
  } else {
    gradeTitleEn = "Satisfactory Completion";
    gradeTitleAr = "مقبول";
  }

  return {
    isEligible: true,
    scorePercent: score,
    gradeTitleEn,
    gradeTitleAr
  };
}

/**
 * Full schedule metrics calculation
 */
export function calculateScheduleMetrics(startDateStr, sessionsMap = {}, todayDateStr = formatDate(new Date())) {
  if (!startDateStr) {
    startDateStr = todayDateStr;
  }

  let totalSessionsCompleted = 0;
  let fullyCompletedDays = 0;
  let partiallyCompletedDays = 0;
  let phase1SessionsCompleted = 0;
  let phase2SessionsCompleted = 0;
  let phase3SessionsCompleted = 0;
  let phase4SessionsCompleted = 0;
  let phase5SessionsCompleted = 0;

  const calendarActivity = {};

  CANONICAL_PROGRAM.forEach(day => {
    let dayCompletedCount = 0;
    day.sessions.forEach(sess => {
      const record = sessionsMap[sess.id];
      if (record && record.isCompleted) {
        totalSessionsCompleted++;
        dayCompletedCount++;
        if (day.phase === 1) phase1SessionsCompleted++;
        else if (day.phase === 2) phase2SessionsCompleted++;
        else if (day.phase === 3) phase3SessionsCompleted++;
        else if (day.phase === 4) phase4SessionsCompleted++;
        else if (day.phase === 5) phase5SessionsCompleted++;

        const cDate = record.completedDate || (record.completedAt ? formatDate(new Date(record.completedAt)) : null);
        if (cDate) {
          calendarActivity[cDate] = (calendarActivity[cDate] || 0) + 1;
        }
      }
    });

    if (dayCompletedCount === day.sessions.length) {
      fullyCompletedDays++;
    } else if (dayCompletedCount > 0) {
      partiallyCompletedDays++;
    }
  });

  // Find active programme day (earliest day with any incomplete session)
  let activeDay = CANONICAL_PROGRAM.find(day => {
    return day.sessions.some(sess => !sessionsMap[sess.id]?.isCompleted);
  });

  const isAllCompleted = !activeDay;
  if (!activeDay) {
    activeDay = CANONICAL_PROGRAM[CANONICAL_PROGRAM.length - 1];
  }

  // Elapsed calendar days
  const elapsedDaysSinceStart = Math.max(0, diffDays(startDateStr, todayDateStr));
  let missedDaysCount = 0;
  const calendarDaysLog = [];

  for (let i = 0; i <= elapsedDaysSinceStart; i++) {
    const curDate = addDays(startDateStr, i);
    const activityCount = calendarActivity[curDate] || 0;
    const isPast = curDate < todayDateStr;
    const isToday = curDate === todayDateStr;

    let status = "upcoming";
    if (isPast) {
      if (activityCount === 0) {
        status = "missed";
        missedDaysCount++;
      } else {
        status = activityCount >= 2 ? "completed" : "partial";
      }
    } else if (isToday) {
      if (activityCount >= 2) {
        status = "completed";
      } else if (activityCount === 1) {
        status = "partial";
      } else {
        status = "active_today";
      }
    }

    calendarDaysLog.push({
      date: curDate,
      activityCount,
      status,
      isToday,
      isPast
    });
  }

  const originalDeadline = addDays(startDateStr, 89);
  const remainingProgrammeDays = Math.max(0, 90 - fullyCompletedDays);
  
  let revisedDeadline = addDays(originalDeadline, missedDaysCount);
  const minProjectedDeadline = addDays(todayDateStr, Math.max(0, remainingProgrammeDays - 1));
  if (minProjectedDeadline > revisedDeadline) {
    revisedDeadline = minProjectedDeadline;
  }

  // Streaks
  let currentStreak = 0;
  let checkDate = todayDateStr;
  
  if (calendarActivity[checkDate] > 0) {
    currentStreak = 1;
    let prev = addDays(checkDate, -1);
    while (calendarActivity[prev] > 0) {
      currentStreak++;
      prev = addDays(prev, -1);
    }
  } else {
    let prev = addDays(checkDate, -1);
    while (calendarActivity[prev] > 0) {
      currentStreak++;
      prev = addDays(prev, -1);
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const activeDates = Object.keys(calendarActivity).filter(d => calendarActivity[d] > 0).sort();
  if (activeDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const prev = activeDates[i - 1];
      const curr = activeDates[i];
      if (diffDays(prev, curr) === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }
  }

  const totalSessionsTarget = TOTAL_PROGRAM_SESSIONS; // 120
  const overallPercentage = Math.min(100, Math.round((totalSessionsCompleted / totalSessionsTarget) * 100));

  // Juz revision count map
  const juzCountMap = {};
  for (let j = 1; j <= 30; j++) juzCountMap[j] = 0;

  CANONICAL_PROGRAM.forEach(day => {
    day.sessions.forEach(sess => {
      if (sessionsMap[sess.id]?.isCompleted) {
        sess.assignedJuz.forEach(juzNum => {
          juzCountMap[juzNum] = (juzCountMap[juzNum] || 0) + 1;
        });
      }
    });
  });

  const certificateScore = calculateCertificateScore(totalSessionsCompleted, missedDaysCount);

  return {
    activeDay,
    isAllCompleted,
    totalSessionsCompleted,
    totalSessionsTarget,
    fullyCompletedDays,
    partiallyCompletedDays,
    missedDaysCount,
    phase1SessionsCompleted,
    phase2SessionsCompleted,
    phase3SessionsCompleted,
    phase4SessionsCompleted,
    phase5SessionsCompleted,
    originalDeadline,
    revisedDeadline,
    currentStreak,
    longestStreak,
    overallPercentage,
    calendarActivity,
    calendarDaysLog,
    juzCountMap,
    certificateScore
  };
}
