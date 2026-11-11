import React from 'react';
import { Mail, Phone, MessageCircle, HelpCircle, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SupportSection({ compact = false }) {
  const { t, language, isRtl } = useLanguage();

  const email = "bellomuhyideen0001@gmail.com";
  const phone = "+2349164028709";
  const displayPhone = "+234 916 402 8709";
  const pretext = language === 'ar'
    ? 'السلام عليكم ورحمة الله، أحتاج إلى مساعدة واستفسار بخصوص برنامج ثبات لمراجعة القرآن الكريم.'
    : "Assalamu Alaikum, I need support with the THABĀT Qur'an Revision Programme.";

  const whatsappUrl = `https://wa.me/2349164028709?text=${encodeURIComponent(pretext)}`;

  if (compact) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('supportTitle')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('supportSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("THABĀT Support & Inquiry")}`}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs"
          >
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{email}</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>{displayPhone} (WhatsApp)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <section id="support-inquiry" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 dark:from-slate-900/80 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{t('supportTitle')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('supportTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('supportSubtitle')}
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        
        {/* Email Inquiry Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('supportEmail')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'ar' 
                  ? 'راسلنا مباشرة لأي استفسار أو مشكلة في التسجيل والبرنامج.' 
                  : 'Send us an email for general inquiries, registration help, or feedback.'}
              </p>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/60">
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("THABĀT Support & Inquiry")}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </a>
          </div>
        </div>

        {/* WhatsApp & Phone Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between hover:border-[#25D366]/50 transition-all group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('supportWhatsapp')} & {t('supportPhone')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'ar'
                  ? 'تواصل عبر واتساب أو الاتصال الهاتفي المباشر للمساعدة الفورية.'
                  : 'Chat on WhatsApp or reach out via direct phone call for prompt assistance.'}
              </p>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: {displayPhone}</span>
            </a>

            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('supportPhone')}</span>
            </a>
          </div>
        </div>

      </div>

      {/* Assurance Note */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 font-medium">
        <span>{t('supportAvailable')}</span>
      </div>
    </section>
  );
}

