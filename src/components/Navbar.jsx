import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Flame, 
  Globe, 
  Award, 
  ShieldCheck, 
  LogOut, 
  User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';

import thabatLogo from '../assets/Elegant Thabāt Qur’an Emblem.png';

export default function Navbar({ activeTab, setActiveTab, onOpenLogin, onOpenRegister }) {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { metrics, darkMode, toggleDarkMode } = useProgram();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Identity */}
          <div 
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/30 bg-emerald-950 flex items-center justify-center">
              <img 
                src={thabatLogo} 
                alt="THABĀT Emblem" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  THABĀT
                </span>
                <span className="font-arabic text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                  | ثبات
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {t('descriptor')}
              </div>
            </div>
          </div>

          {/* Navigation Links for Authenticated Users */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('navDashboard')}</span>
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'progress'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('navProgress')}</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('navHistory')}</span>
              </button>

              <button
                onClick={() => setActiveTab('certificate')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'certificate'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t('navCertificate')}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>{t('navSettings')}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('navAdmin')}</span>
                </button>
              )}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('navLogin')}
              </button>
              <button
                onClick={onOpenRegister}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {t('navRegister')}
              </button>
            </div>
          )}

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Streak Indicator if logged in */}
            {isAuthenticated && (
              <div 
                title={`Current Streak: ${metrics.currentStreak} days`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{metrics.currentStreak} {t('day')}</span>
              </div>
            )}

            {/* Language Switcher (EN / العربية) */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? "التحويل إلى العربية" : "Switch to English"}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Account / Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 rtl:pl-0 rtl:pr-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden lg:inline truncate max-w-[120px]">
                  {currentUser.fullName}
                </span>
                <button
                  onClick={logout}
                  title={t('navLogout')}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

          </div>

        </div>

        {/* Mobile Navigation bar */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                activeTab === 'dashboard' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('navDashboard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                activeTab === 'progress' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('navProgress')}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                activeTab === 'history' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('navHistory')}</span>
            </button>

            <button
              onClick={() => setActiveTab('certificate')}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                activeTab === 'certificate' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{t('navCertificate')}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                activeTab === 'settings' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{t('navSettings')}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
                  activeTab === 'admin' ? 'text-amber-600' : 'text-amber-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('navAdmin')}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
