import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, API_BASE } from './AuthContext';
import {
  CANONICAL_PROGRAM,
  ALL_SESSIONS_LIST,
  formatDate,
  calculateScheduleMetrics
} from '../utils/scheduleEngine.js';

const ProgramContext = createContext(null);

export function ProgramProvider({ children }) {
  const { currentUser, token, isAuthenticated } = useAuth();

  const [sessions, setSessions] = useState({});
  const [enrolment, setEnrolment] = useState(null);
  const [dailyInspiration, setDailyInspiration] = useState(null);
  const [customDayNotes, setCustomDayNotes] = useState({});
  const [isLoadingProgram, setIsLoadingProgram] = useState(true);
  const [currentDateStr, setCurrentDateStr] = useState(formatDate(new Date()));

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thabat_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('thabat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('thabat_theme', 'light');
    }
  }, [darkMode]);

  // Load Daily Inspiration from backend (stable across all users & devices for today's date)
  const fetchDailyInspiration = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/inspirations/daily`);
      if (res.ok) {
        const data = await res.json();
        setDailyInspiration(data.reminder);
      }
    } catch (err) {
      console.warn("Could not fetch daily inspiration from server:", err);
    }
  }, []);

  useEffect(() => {
    fetchDailyInspiration();
  }, [fetchDailyInspiration]);

  // Load Program status from backend when user is authenticated
  const fetchProgramStatus = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setIsLoadingProgram(false);
      return;
    }

    try {
      setIsLoadingProgram(true);
      const res = await fetch(`${API_BASE}/program/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || {});
        setEnrolment(data.enrolment || null);
        if (data.todayDateStr) setCurrentDateStr(data.todayDateStr);
      }
    } catch (err) {
      console.error("Error loading program status:", err);
    } finally {
      setIsLoadingProgram(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchProgramStatus();
  }, [fetchProgramStatus]);

  // Derived metrics from the 3-phase schedule engine
  const startDate = enrolment?.startDate || formatDate(new Date());
  const metrics = useMemo(() => {
    return calculateScheduleMetrics(startDate, sessions, currentDateStr);
  }, [startDate, sessions, currentDateStr]);

  const activeDay = metrics.activeDay || CANONICAL_PROGRAM[0];

  // --- ACTIONS ---

  const markSessionComplete = async (dayNumber, sessionType, dateOverride) => {
    // 1. Strict frontend constraint: "users should not be able to mark for the next day today, it should only be for that day"
    if (dayNumber > activeDay.dayNumber) {
      throw new Error("You cannot mark sessions for future programme days in advance.");
    }

    const sessionId = sessionType === 'daily' ? `d${dayNumber}_daily` : `d${dayNumber}_${sessionType}`;
    const now = new Date();
    const effectiveDate = dateOverride || formatDate(now);

    // Optimistic UI update
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        isCompleted: true,
        completedAt: now.toISOString(),
        completedDate: effectiveDate
      }
    }));

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/program/complete-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ dayNumber, sessionType, dateOverride: effectiveDate })
        });

        if (!res.ok) {
          const errData = await res.json();
          // Rollback if rejected by server
          fetchProgramStatus();
          throw new Error(errData.error || "Failed to confirm session on server.");
        }

        const data = await res.json();
        setSessions(data.sessions);
      } catch (err) {
        fetchProgramStatus();
        throw err;
      }
    }
  };

  const undoSessionComplete = async (dayNumber, sessionType) => {
    const sessionId = sessionType === 'daily' ? `d${dayNumber}_daily` : `d${dayNumber}_${sessionType}`;

    setSessions(prev => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/program/undo-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ dayNumber, sessionType })
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (err) {
        fetchProgramStatus();
      }
    }
  };

  const updateStartDate = async (newStartDate) => {
    if (!newStartDate) return;
    setEnrolment(prev => ({ ...prev, startDate: newStartDate }));

    if (token) {
      try {
        await fetch(`${API_BASE}/program/update-start-date`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ startDate: newStartDate })
        });
        fetchProgramStatus();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const setDayNote = (dateStr, note) => {
    setCustomDayNotes(prev => ({
      ...prev,
      [dateStr]: note
    }));
  };

  return (
    <ProgramContext.Provider
      value={{
        isLoadingProgram,
        enrolment,
        sessions,
        customDayNotes,
        darkMode,
        currentDateStr,
        metrics,
        activeDay,
        dailyInspiration,
        markSessionComplete,
        undoSessionComplete,
        updateStartDate,
        setDayNote,
        toggleDarkMode,
        fetchProgramStatus,
        fetchDailyInspiration
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('useProgram must be used within a ProgramProvider');
  }
  return context;
}
