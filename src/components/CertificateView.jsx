import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Lock, 
  Printer, 
  ShieldCheck, 
  Sparkles,
  Globe
} from 'lucide-react';
import { useAuth, API_BASE } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgram } from '../context/ProgramContext';
import { formatDisplayDate } from '../utils/scheduleEngine.js';
import thabatLogo from '../assets/thabat-logo.png';

export default function CertificateView() {
  const { token, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { metrics } = useProgram();

  const [eligibilityData, setEligibilityData] = useState(null);
  const [certLanguage, setCertLanguage] = useState(language);
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Administrators can preview the certificate template from Day 1.
    // The backend endpoint is protected by requireAdmin and is never exposed
    // to participant accounts.
    if (isAdmin) {
      fetch(`${API_BASE}/admin/certificate-preview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.certificate) {
            setCertificate(data.certificate);
            setIsPreview(true);
            setEligibilityData({ isEligible: true, ...data.certificate });
          }
        })
        .catch(console.error);
      return;
    }

    fetch(`${API_BASE}/certificates/eligibility`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setEligibilityData(data);
        if (data.certificate) {
          setCertificate(data.certificate);
        }
      })
      .catch(console.error);
  }, [token, isAdmin, metrics.totalSessionsCompleted]);

  const handleGenerateCertificate = async () => {
    if (!token) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCertificate(data.certificate);
      } else {
        alert(data.error || "Failed to generate certificate.");
      }
    } catch (err) {
      alert("Error generating certificate.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (certificate && token && !isPreview) {
      // Track download on server
      fetch(`${API_BASE}/certificates/${certificate.id || certificate.certificateNumber}/track-download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(console.error);
    }
    window.print();
  };

  const isEligible = isAdmin
    ? true
    : (eligibilityData ? eligibilityData.isEligible : metrics.totalSessionsCompleted >= (metrics.totalSessionsTarget || 180));
  const remainingSessions = Math.max(0, (metrics.totalSessionsTarget || 180) - metrics.totalSessionsCompleted);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{t('certTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar' 
              ? "شهادة رسمية توثق إتمام متطلبات برنامج ثبات الـ 90 يوماً ومعدل المواظبة والدرجة المكتسبة."
              : "Official certificate verifying 90-day programme completion, consistency score, and distinction honour."}
          </p>
        </div>

        {certificate && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCertLanguage(prev => prev === 'en' ? 'ar' : 'en')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{certLanguage === 'en' ? 'عرض باللغة العربية' : 'View in English'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btnDownloadPdf')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Administrator-only template preview notice */}
      {isAdmin && isPreview && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2 max-w-4xl mx-auto">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>{language === 'ar' ? 'معاينة المشرف:' : 'Administrator Preview:'}</strong>{' '}
            {language === 'ar'
              ? 'هذه معاينة لقالب الشهادة الرسمي متاحة للمشرفين فقط من اليوم الأول. الشهادة الحقيقية للمشاركين تظل مقفلة حتى إتمام جميع الأوراد الـ 180.'
              : 'This is a preview of the official certificate template, available to administrators only from Day 1. Real participant certificates remain locked until all 180 sessions are completed.'}
          </span>
        </div>
      )}

      {/* Ineligible State Card */}
      {!isEligible && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t('certIneligibleTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
              {t('certIneligibleDesc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 inline-flex flex-col sm:flex-row items-center gap-6">
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">{t('sessionsCompleted')}</div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{metrics.totalSessionsCompleted} / {metrics.totalSessionsTarget || 180}</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">{t('sessionsLeft')}</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{remainingSessions}</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-xs uppercase font-bold text-slate-400">{t('streak')}</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.currentStreak} {t('day')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Eligible but Not Generated Yet */}
      {isEligible && !certificate && (
        <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
            {language === 'ar' ? "مبارك! أنت مؤهل لاستلام شهادة التخرج" : "Congratulations! You are eligible for your Certificate"}
          </h3>

          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
            {language === 'ar'
              ? `لقد أتممت كافة أوراد البرنامج الـ 180 كاملاً بنسبة إنجاز 100% وختمت القرآن 18 ختمة كاملة. معدل التزامك المحتسب: ${eligibilityData?.scorePercent || 100}% (${eligibilityData?.gradeTitleAr || 'ممتاز'}).`
              : `You have successfully completed all 180 sessions with 100% completion and finished the Qur'an 18 complete times. Consistency score: ${eligibilityData?.scorePercent || 100}% (${eligibilityData?.gradeTitleEn || 'Distinction'}).`}
          </p>

          <button
            onClick={handleGenerateCertificate}
            disabled={isGenerating}
            className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-800/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? "Issuing Certificate..." : (language === 'ar' ? "إصدار الشهادة الرسمية الآن" : "Generate Official Certificate Now")}
          </button>
        </div>
      )}

      {/* Printable Certificate Template */}
      {certificate && (
        <div className="print-area max-w-4xl mx-auto bg-white text-slate-900 p-3 sm:p-14 rounded-3xl shadow-2xl border-4 sm:border-8 border-emerald-800/20 relative overflow-hidden">
          
          {/* Ornate Islamic Border Frame */}
          <div className="border-2 sm:border-4 border-emerald-700 p-3 sm:p-10 rounded-2xl relative">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500" />

            {/* Header / Bismillah */}
            <div className="text-center space-y-3 mb-6">
              {/* Official Emblem */}
              <div className="flex justify-center mb-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xl ring-4 ring-emerald-700/30 bg-emerald-950">
                  <img src={thabatLogo} alt="THABĀT Official Emblem" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="font-arabic text-xl sm:text-2xl font-bold text-emerald-800">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                THABĀT | 90-DAY QUR'AN REVISION PROGRAMME
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-emerald-900 font-arabic tracking-tight pt-1">
                {certLanguage === 'ar' ? "شهادة إتمام برنامج مراجعة القرآن الكريم" : "Certificate of Programme Completion"}
              </h2>
            </div>

            {/* Recipient Statement */}
            <div className="text-center my-6 space-y-3">
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider font-semibold">
                {certLanguage === 'ar' ? "تَشْهَدُ إِدَارَةُ بَرْنَامَجِ ثَبَاتٍ بِأَنَّ الحَافِظَ / الحَافِظَةَ:" : "This certifies that the Hafidh:"}
              </p>
              
              <div className="text-xl sm:text-4xl font-extrabold text-emerald-800 border-b-2 border-emerald-600/30 inline-block px-3 sm:px-8 py-2 break-words max-w-full">
                {certificate.participantName}
              </div>

              <p className="text-xs sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed pt-2">
                {certLanguage === 'ar' ? (
                  <span>
                    قد أتمّ بنجاح ومواظبة تامة برنامج «ثبات» لمراجعة القرآن الكريم كاملاً في <strong>90 يوماً</strong>، مستكملاً <strong>180 ورداً قرآنيّاً</strong> عبر مراحله الخمس، متوجاً ذلك بـ <strong>ثمانية عشر ختمة كاملة</strong> لكتاب الله تعالى، ترسيخاً للحفظ وتثبيتاً للآيات في الصدر.
                  </span>
                ) : (
                  <span>
                    has diligently and faithfully completed the <strong>90-Day Thabāt Qur'an Revision Programme</strong>, successfully completing all <strong>180 required sessions</strong> across its 5 phases, culminating in <strong>18 complete readings of the Noble Qur'an</strong> to firmly anchor the memorisation.
                  </span>
                )}
              </p>
            </div>

            {/* Score & Distinction Metric (As requested by user) */}
            <div className="my-8 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-4 text-center text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">{t('certScore')}</span>
                <span className="text-2xl font-black text-emerald-800">{certificate.scorePercent}%</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-emerald-200" />
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">{t('certGrade')}</span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-900">
                  {certLanguage === 'ar' ? certificate.gradeTitleAr : certificate.gradeTitleEn}
                </span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-emerald-200" />
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">{t('missedDays')}</span>
                <span className="text-sm font-bold text-slate-700">{certificate.missedDaysCount}</span>
              </div>
            </div>

            {/* Signatures & Footer details */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
              
              <div className="space-y-1 text-center sm:text-left rtl:sm:text-right">
                <div className="font-bold text-slate-800 break-all">{t('certNumber')}: <span className="font-mono text-emerald-800">{certificate.certificateNumber}</span></div>
                <div>{t('issueDate')}: {formatDisplayDate(certificate.issueDate, certLanguage)}</div>
                <div className="text-[10px] text-slate-400">Verified by Thabāt Cryptographic Registry</div>
              </div>

              {/* Official Seal – Thabāt Emblem */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md ring-2 ring-emerald-600/40 bg-emerald-950">
                <img src={thabatLogo} alt="THABĀT Official Seal" className="w-full h-full object-cover" />
              </div>

              {/* Director Signature Section */}
              <div className="text-center sm:text-right rtl:sm:text-left space-y-1">
                <div className="font-serif italic text-base sm:text-lg font-bold text-emerald-900">
                  {certLanguage === 'ar' ? certificate.directorNameAr : certificate.directorNameEn}
                </div>
                <div className="w-36 h-0.5 bg-slate-300 mx-auto sm:ml-auto rtl:sm:mr-auto" />
                <div className="text-[11px] font-bold text-slate-700">
                  {certLanguage === 'ar' ? certificate.signatureTitleAr : certificate.signatureTitleEn}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
