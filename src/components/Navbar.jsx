import React, { useEffect, useState } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';

import thabatLogo from '../assets/Elegant Thabāt Qur’an Emblem.png';

export default function Navbar({ activeTab, setActiveTab, onOpenLogin, onOpenRegister, onOpenAdminLogin }) {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { metrics, darkMode, toggleDarkMode } = useProgram();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: BookOpen },
    { id: 'progress', label: t('navProgress'), icon: BarChart3 },
    { id: 'history', label: t('navHistory'), icon: Calendar },
    { id: 'certificate', label: t('navCertificate'), icon: Award },
    { id: 'settings', label: t('navSettings'), icon: SettingsIcon },
    ...(isAdmin
      ? [{ id: 'admin', label: t('navAdmin'), icon: ShieldCheck, isAdminItem: true }]
      : [])
  ];

  // Close the mobile drawer whenever the user navigates.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Lock page scroll and support Escape while the drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Identity */}
          <div 
            onClick={() => selectTab(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/30 bg-emerald-950 flex items-center justify-center shrink-0">
              <img 
                src={thabatLogo} 
                alt="THABĀT Emblem" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  THABĀT
                </span>
                <span className="hidden min-[380px]:inline font-arabic text-emerald-700 dark:text-emerald-400 font-bold text-base sm:text-lg">
                  | ثبات
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium truncate">
                {t('descriptor')}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links for Authenticated Users */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      item.isAdminItem
                        ? isActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50'
                        : isActive
                          ? 'bg-white dark:bg-emerald-700 text-emerald-800 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
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

            {/* Dedicated Administrator Portal entry */}
            {!isAuthenticated && onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                title={language === 'ar' ? 'بوابة المشرفين والإدارة' : 'Administrator Portal'}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
              </button>
            )}

            {/* Language Switcher (EN / العربية) */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? "التحويل إلى العربية" : "Switch to English"}
              aria-label={language === 'en' ? "التحويل إلى العربية" : "Switch to English"}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Account / Logout */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-0.5 sm:pl-1 rtl:pl-0 rtl:pr-0.5 sm:rtl:pr-1">
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

            {/* Mobile menu trigger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label={language === 'ar' ? 'فتح قائمة التنقل' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

          </div>

        </div>

        {/* Mobile authentication actions for visitors */}
        {!isAuthenticated && (
          <div className="md:hidden flex items-center gap-2 py-2 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={onOpenLogin}
              className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('navLogin')}
            </button>
            <button
              onClick={onOpenRegister}
              className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {t('navRegister')}
            </button>
          </div>
        )}

      </div>
    </header>

    {/* Mobile slide-in navigation drawer */}
      {isAuthenticated && (
        <div
          className="md:hidden fixed inset-0 z-50"
          inert={!mobileMenuOpen}
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          <aside
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={language === 'ar' ? 'قائمة التنقل' : 'Navigation menu'}
            className={`absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-emerald-500/30 bg-emerald-950 shrink-0">
                  <img src={thabatLogo} alt="THABĀT Emblem" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                    THABĀT <span className="font-arabic text-emerald-700 dark:text-emerald-400">| ثبات</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {t('descriptor')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    data-active={isActive}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      item.isAdminItem
                        ? isActive
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        : isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">{t('streak')}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {metrics.currentStreak} {t('day')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser?.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
