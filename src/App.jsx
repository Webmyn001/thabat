import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ProgramProvider, useProgram } from './context/ProgramContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import ProgressPage from './components/ProgressPage';
import HistoryPage from './components/HistoryPage';
import CertificateView from './components/CertificateView';
import SettingsPage from './components/SettingsPage';
import AdminDashboard from './components/AdminDashboard';

import thabatLogo from './assets/Elegant Thabāt Qur’an Emblem.png';

function AppContent() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { t, language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // If user logs in and was on landing, transition to dashboard
  React.useEffect(() => {
    if (isAuthenticated && activeTab === 'landing') {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, activeTab]);

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors islamic-pattern-bg">
      
      {/* Persistent Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenLogin={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
        onOpenRegister={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* If user is on landing page or not authenticated */}
        {activeTab === 'landing' && (
          <LandingPage
            onGoToRegister={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
            onGoToLogin={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {/* Authenticated Participant Views */}
        {isAuthenticated && activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {isAuthenticated && activeTab === 'progress' && <ProgressPage setActiveTab={setActiveTab} />}
        {isAuthenticated && activeTab === 'history' && <HistoryPage />}
        {isAuthenticated && activeTab === 'certificate' && <CertificateView />}
        {isAuthenticated && activeTab === 'settings' && <SettingsPage />}

        {/* Admin Dashboard */}
        {isAuthenticated && isAdmin && activeTab === 'admin' && <AdminDashboard />}

      </main>

      {/* Auth Modal for Login and Registration */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />

      {/* Universal Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
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
      </footer>

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
