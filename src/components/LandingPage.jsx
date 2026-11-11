import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Calendar, 
  ShieldCheck, 
  Flame, 
  Award, 
  Clock, 
  HelpCircle,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import thabatLogo from '../assets/thabat-logo.png';
import SupportSection from './SupportSection';

export default function LandingPage({ onGoToRegister, onGoToLogin }) {
  const { t, isRtl, language } = useLanguage();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Logo Emblem */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-emerald-400/30 bg-emerald-950 shrink-0">
              <img src={thabatLogo} alt="THABĀT Emblem" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">THABĀT | ثبات</div>
              <div className="text-xs text-emerald-300 font-medium mt-1">{t('descriptor')}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{t('descriptor')}</span>
            </div>

            {/* Prominent 100% FREE Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/25 border border-amber-300/40 text-amber-200 text-xs sm:text-sm font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{t('freeBadge')}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight">
            {t('heroTitle')}
          </h1>

          <div className="text-xl sm:text-2xl font-serif text-emerald-200 font-semibold tracking-wide">
            "{t('tagline')}"
          </div>

          {/* Prominent Core Purpose Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>{t('purposeTitle')}</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              {t('purposeDesc')}
            </p>
          </div>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-light">
            {t('heroDesc')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onGoToRegister}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/40 flex items-center gap-2 group transition-all"
            >
              <span>{t('heroCtaJoin')} ({language === 'ar' ? 'مجاناً' : 'Free'})</span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('about-program')}
              className="px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-colors"
            >
              {t('heroCtaLearn')}
            </button>

            <button
              onClick={onGoToLogin}
              className="px-5 py-3.5 sm:py-4 rounded-2xl text-emerald-300 hover:text-white font-semibold text-sm sm:text-base transition-colors"
            >
              {t('heroCtaLogin')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. About the Programme */}
      <section id="about-program" className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Muroja'ah & Tikrar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t('aboutTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('aboutP1')}
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('aboutP2')}
          </p>
        </div>

        {/* Hadith Highlight Quote */}
        <div className="mt-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100">
          <div dir="rtl" className="font-arabic text-xl sm:text-2xl font-bold leading-loose text-center sm:text-right">
            « تَعَاهَدُوا هَذَا الْقُرْآنَ، فَوَالَّذِي نَفْسِي بِيَدِهِ لَهُوَ أَشَدُّ تَفَلُّتًا مِنَ الإِبِلِ فِي عُقُلِهَا »
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mt-3 text-center sm:text-left">
            "Keep revising and committing yourselves to this Qur'an; for by the One in Whose Hand is my soul, it slips away faster than camels escaping their hobbles."
          </p>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-2 text-right">
            — Sahih al-Bukhari 5033; Sahih Muslim 791
          </div>
        </div>
      </section>

      {/* 3. The 5 Phases + Quran Completion Count */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {t('phasesTitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {language === 'ar'
              ? 'خمس مراحل متصاعدة لترسيخ الحفظ وتعميق الإتقان.'
              : 'Five progressive phases, each building deeper mastery of the Qur\'an.'}
          </p>
        </div>

        {/* ── Quran Completion Count Banner ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-amber-900 to-emerald-950 text-white text-center shadow-2xl border border-amber-700/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.15)_0%,transparent_70%)]" />
          <div className="relative z-10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
              {t('quranCompletionLabel')}
            </div>
            <div className="text-6xl sm:text-8xl font-black text-amber-400 leading-none drop-shadow-lg">18×</div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {t('quranCompletionCount')}
            </div>
            <div className="font-arabic text-2xl sm:text-3xl font-bold text-amber-200 leading-relaxed">
              {t('quranCompletionCountAr')}
            </div>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl mx-auto leading-relaxed pt-1">
              {t('quranCompletionDetail')}
            </p>
          </div>
        </div>

        {/* ── Phase Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Phase 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center">1</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{t('phase1Title')}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('phase1Scope')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('phase1Desc')}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              📖 30 sessions · 3 Juz morning + 3 Juz evening Tikrar
            </div>
          </div>

          {/* Phase 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-600/60 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
              {language === 'ar' ? '٦ ختمات' : '6 Khatmahs'}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-teal-600 text-white text-xs font-black flex items-center justify-center">2</span>
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400">{t('phase2Title')}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('phase2Scope')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('phase2Desc')}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-teal-700 dark:text-teal-400">
              📖 30 sessions · 3 Juz morning + 3 Juz evening · <span className="text-amber-700 dark:text-amber-400">{language === 'ar' ? '🌟 ٦ ختمات تامة' : '🌟 6 Complete Khatmahs'}</span>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-violet-600 text-white text-xs font-black flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-violet-700 dark:text-violet-400">{t('phase3Title')}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('phase3Scope')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('phase3Desc')}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-violet-700 dark:text-violet-400">
              📖 30 sessions · 3 Juz morning + 3 Juz evening Tikrar
            </div>
          </div>

          {/* Phase 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-600/60 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
              {language === 'ar' ? '١٢ ختمة' : '12 Khatmahs'}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center justify-center">4</span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{t('phase4Title')}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('phase4Scope')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t('phase4Desc')}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-orange-700 dark:text-orange-400">
              📖 30 sessions · 3 Juz morning + 3 Juz evening · <span className="text-amber-700 dark:text-amber-400">{language === 'ar' ? '🌟 ١٢ ختمة تراكمية' : '🌟 12 Total Khatmahs'}</span>
            </div>
          </div>

          {/* Phase 5 — spans full width on lg */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-900 text-white border border-emerald-700/60 shadow-xl flex flex-col justify-between space-y-4 sm:col-span-2 lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-full bg-amber-400/25 border border-amber-300/30 text-amber-200 text-[10px] font-black uppercase tracking-wider">
              {language === 'ar' ? 'الختمات ١٣–١٨ · ٦ ختمات إضافية' : 'Khatmahs #13–18 · 6 Additional Readings'}
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-emerald-950 text-sm font-black flex items-center justify-center shadow">5</span>
                <span className="text-xs font-bold text-amber-300">{t('phase5Title')}</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white">{t('phase5Scope')}</h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">{t('phase5Desc')}</p>
            </div>
            <div className="pt-3 border-t border-white/15 text-xs font-semibold text-amber-300 flex flex-wrap gap-3">
              <span>🌟 60 sessions</span>
              <span>· 5 Juz morning reading + 1 Juz evening offhand from pure memory</span>
              <span>· {language === 'ar' ? 'إجمالي البرنامج: ١٨ ختمة كاملة' : 'Grand Total: 18 Complete Khatmahs'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Who Can Participate & Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Audience */}
        <div className="p-8 rounded-3xl bg-emerald-900 text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Target Audience</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('audienceTitle')}
            </h3>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              {t('audienceDesc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs text-emerald-200 italic">
            "{t('declarationText')}"
          </div>
        </div>

        {/* Practical Benefits */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('benefitsTitle')}
          </h3>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('benefit1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('benefit2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('benefit3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('benefit4')}</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t('benefit5')}</span>
            </li>
          </ul>
        </div>

      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('faqTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know before joining the programme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('faq1Q')}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('faq1A')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('faq2Q')}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('faq2A')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('faq3Q')}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('faq3A')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('faq4Q')}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('faq4A')}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-6">
          <button
            onClick={onGoToRegister}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/25 inline-flex items-center gap-2 group transition-all"
          >
            <span>{t('heroCtaJoin')}</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 6. Support & Inquiry Section */}
      <SupportSection />

    </div>
  );
}
