import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ProgramProvider } from './context/ProgramContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import AdminAuthModal from './components/AdminAuthModal';
import Dashboard from './components/Dashboard';
import ProgressPage from './components/ProgressPage';
import HistoryPage from './components/HistoryPage';
import CertificateView from './components/CertificateView';
import SettingsPage from './components/SettingsPage';
import AdminDashboard from './components/AdminDashboard';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { Mail, Phone } from 'lucide-react';

import thabatLogo from './assets/Elegant Thabāt Qur’an Emblem.png';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  // URL Hash & Query routing (e.g. #admin, ?tab=admin)
  React.useEffect(() => {
    if (loading) return undefined;

    const PROTECTED_TABS = ['dashboard', 'progress', 'history', 'certificate', 'settings', 'admin'];

    const clearDeepLink = () => {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    const handleUrlRouting = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      const target = tabParam || hash;

      const validTabs = ['landing', 'dashboard', 'progress', 'history', 'certificate', 'settings', 'admin'];
      if (!validTabs.includes(target)) return;

      // Never leave a signed-out visitor on a protected hash: render the
      // landing page and ask them to sign in instead of an empty main area.
      if (PROTECTED_TABS.includes(target) && !isAuthenticated) {
        setActiveTab('landing');
        clearDeepLink();
        if (target === 'admin') {
          setAuthModalOpen(false);
          setAdminAuthOpen(true);
        } else {
          setAuthModalMode('login');
          setAdminAuthOpen(false);
          setAuthModalOpen(true);
        }
        return;
      }

      if (target === 'admin') {
        setActiveTab(isAdmin ? 'admin' : 'dashboard');
      } else {
        setActiveTab(target);
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    return () => window.removeEventListener('hashchange', handleUrlRouting);
  }, [isAuthenticated, isAdmin, loading]);

  // If the session expires or the participant signs out while on a protected
  // tab, fall back to the landing page and drop the stale deep link.
  React.useEffect(() => {
    if (loading || isAuthenticated) return;
    const protectedTabs = ['dashboard', 'progress', 'history', 'certificate', 'settings', 'admin'];
    if (protectedTabs.includes(activeTab)) {
      setActiveTab('landing');
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [loading, isAuthenticated, activeTab]);

  // Sync hash with active tab
  React.useEffect(() => {
    if (activeTab && activeTab !== 'landing') {
      if (window.location.hash.replace(/^#\/?/, '').toLowerCase() !== activeTab) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab]);

  // If user logs in and was on landing or requested admin
  React.useEffect(() => {
    if (isAuthenticated) {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const deepLinkedTabs = ['dashboard', 'progress', 'history', 'certificate', 'settings', 'admin'];

      if (hash === 'admin' && isAdmin) {
        setActiveTab('admin');
      } else if (activeTab === 'landing' && !deepLinkedTabs.includes(hash)) {
        // Only fall back to the dashboard when no deep link was requested,
        // so refreshing on e.g. #settings does not bounce the user back.
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/20 animate-pulse bg-emerald-950">
            <img src={thabatLogo} alt="THABĀT Emblem" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
            THABĀT | ثبات...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors islamic-pattern-bg print:min-h-0 print:bg-white">
      
      {/* Persistent Navigation */}
      <div className="print:hidden">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenLogin={() => { setAuthModalMode('login'); setAdminAuthOpen(false); setAuthModalOpen(true); }}
          onOpenRegister={() => { setAuthModalMode('register'); setAdminAuthOpen(false); setAuthModalOpen(true); }}
          onOpenAdminLogin={() => { setAuthModalOpen(false); setAdminAuthOpen(true); }}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 print:max-w-none print:p-0">
        
        {/* If user is on landing page or not authenticated */}
        {activeTab === 'landing' && (
          <LandingPage
            onGoToRegister={() => { setAuthModalMode('register'); setAdminAuthOpen(false); setAuthModalOpen(true); }}
            onGoToLogin={() => { setAuthModalMode('login'); setAdminAuthOpen(false); setAuthModalOpen(true); }}
          />
        )}

        {/* Authenticated Participant Views */}
        {isAuthenticated && activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {isAuthenticated && activeTab === 'progress' && <ProgressPage setActiveTab={setActiveTab} />}
        {isAuthenticated && activeTab === 'history' && <HistoryPage />}
        {isAuthenticated && activeTab === 'certificate' && <CertificateView />}
        {isAuthenticated && activeTab === 'settings' && <SettingsPage />}

        {/* Admin Dashboard */}
        {isAuthenticated && isAdmin && activeTab === 'admin' && <AdminDashboard setActiveTab={setActiveTab} />}

      </main>

      {/* Participant auth modal (passwordless email OTP) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onOpenAdminPortal={() => setAdminAuthOpen(true)}
        onSuccess={(user) => {
          setActiveTab(user?.role === 'admin' ? 'admin' : 'dashboard');
        }}
      />

      {/* Dedicated administrator portal (email + password, OTP reset) */}
      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onSuccess={() => setActiveTab('admin')}
        onSwitchToParticipant={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
      />

      {/* Universal Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-4 sm:py-6 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                THABĀT | ثبات
              </span>
              <span>• {t('descriptor')}</span>
            </div>

            <div className="text-center sm:text-right font-arabic text-sm text-emerald-800 dark:text-emerald-300">
              اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا وجلاء أحزاننا وذهاب همومنا
            </div>
          </div>

          {/* Support and Inquiry Footer Row */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t('supportTitle')}:</span>
              <a 
                href="mailto:bellomuhyideen0001@gmail.com?subject=THABAT%20Inquiry"
                title="bellomuhyideen0001@gmail.com"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 flex items-center gap-1 min-w-0"
              >
                <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="sm:hidden">{t('supportEmailShort')}</span>
                <span className="hidden sm:inline break-all">bellomuhyideen0001@gmail.com</span>
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://wa.me/2349164028709?text=Assalamu%20Alaikum%2C%20I%20need%20support%20with%20THAB%C4%80T."
                target="_blank"
                rel="noopener noreferrer"
                title="+234 916 402 8709"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-[#25D366]" />
                <span className="sm:hidden">{t('supportWhatsappShort')}</span>
                <span className="hidden sm:inline">+234 916 402 8709</span>
              </a>
            </div>

            <div>
              <span>© {new Date().getFullYear()} THABĀT. {t('freeBadge')}.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Persistent Floating WhatsApp Icon */}
      <div className="print:hidden">
        <FloatingWhatsApp />
      </div>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProgramProvider>
          <AppContent />
        </ProgramProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
