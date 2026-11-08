import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/scheduleEngine';
import thabatLogo from '../assets/thabat-logo.png';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const { t, isRtl, language } = useLanguage();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify_otp'
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [hifzDeclaration, setHifzDeclaration] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize mode when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setResendStatus('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(fullName, email);
        if (res.requiresOtp) {
          setActiveEmail(res.email || email);
          if (res.devOtp) setDevOtp(res.devOtp);
          setMode('verify_otp');
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      } else if (mode === 'register') {
        if (!hifzDeclaration) {
          throw new Error(language === 'ar' 
            ? "يجب الموافقة على إقرار حفظ القرآن الكريم كاملاً للمتابعة." 
            : "You must accept the solemn Hifz declaration to participate.");
        }
        const res = await register({
          fullName,
          email,
          phone,
          startDate,
          hifzDeclarationAccepted: true,
          preferredLanguage: language
        });
        if (res.requiresOtp) {
          setActiveEmail(res.email || email);
          if (res.devOtp) setDevOtp(res.devOtp);
          setMode('verify_otp');
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      } else if (mode === 'verify_otp') {
        await verifyOtp(activeEmail || email, otpCode);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || "Operation failed. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendStatus('');
      setErrorMsg('');
      const res = await resendOtp(activeEmail || email);
      if (res.devOtp) setDevOtp(res.devOtp);
      setResendStatus(t('otpSent'));
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend code.");
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn my-auto">
          
          {/* Top Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-teal-900 text-white relative">
            <button
              type="button"
              onClick={onClose}
              aria-label={language === 'ar' ? "إغلاق النموذج" : "Close form"}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2.5 rounded-2xl bg-black/25 hover:bg-black/45 text-white ring-1 ring-white/20 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo + Badges Row */}
            <div className="flex items-center gap-3 mb-3 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-emerald-400/30 bg-emerald-950 shrink-0">
                <img src={thabatLogo} alt="THABĀT Emblem" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>THABĀT | ثبات</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold">
                  <span>{t('freeBadge')}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black">
              {mode === 'verify_otp' 
                ? t('otpTitle') 
                : (mode === 'login' ? t('loginTitle') : t('regTitle'))}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              {mode === 'verify_otp' 
                ? t('otpDesc') 
                : (mode === 'login' ? t('loginDesc') : t('regDesc'))}
            </p>

            {/* Purpose Box */}
            <div className="mt-3 p-3 rounded-2xl bg-white/10 border border-white/10 text-xs text-emerald-100/90">
              <strong className="block text-emerald-200 font-bold mb-0.5">{t('purposeTitle')}:</strong>
              {t('purposeDesc')}
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {resendStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resendStatus}</span>
              </div>
            )}

            {/* MODE: VERIFY OTP */}
            {mode === 'verify_otp' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? "البريد الإلكتروني للتحقق:" : "Verifying code sent to:"}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>{activeEmail || email}</span>
                  </div>
                </div>

                {/* Dev notice showing generated code */}
                {devOtp && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                    <span className="font-semibold">{t('devOtpNotice')} <strong className="font-mono text-sm tracking-widest text-emerald-700 dark:text-emerald-400">{devOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtp)}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? "تعبئة تلقائية" : "Auto-fill"}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('otpLabel')} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-mono text-xl tracking-widest font-black focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>{t('btnVerifyOtp')}</span>
                  <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t('resendOtp')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    {t('backToEdit')}
                  </button>
                </div>

                {/* Dismiss action */}
                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء وإغلاق' : 'Cancel & Close'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Passwordless Informative Callout */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{t('noPasswordNotice')}</span>
                </div>

                {/* Full Name (Used in both Login & Register) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('fullName')} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('loginFullNamePlaceholder')}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('email')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('loginEmailPlaceholder')}
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('phone')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 ... / +1 ..."
                        className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Start Date (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('startDate')}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Solemn Hifz Declaration (Register only) */}
                {mode === 'register' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={hifzDeclaration}
                        onChange={(e) => setHifzDeclaration(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed select-none">
                        <strong className="block text-emerald-800 dark:text-emerald-300 mb-0.5">
                          {t('declarationLabel')}
                        </strong>
                        "{t('declarationText')}"
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>{mode === 'login' ? t('btnLogin') : t('btnRegister')}</span>
                  <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Switch Mode */}
                <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'login' ? (
                    <span>
                      {t('noAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('register'); setErrorMsg(''); }}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {t('registerHere')}
                      </button>
                    </span>
                  ) : (
                    <span>
                      {t('haveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMsg(''); }}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {t('loginHere')}
                      </button>
                    </span>
                  )}
                </div>

                {/* Secondary Close / Cancel Action */}
                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء وإغلاق النموذج' : 'Cancel & Close'}
                  </button>
                </div>
              </>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
