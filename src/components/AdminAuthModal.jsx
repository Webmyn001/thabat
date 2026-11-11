import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import thabatLogo from '../assets/thabat-logo.png';

/**
 * Dedicated administrator portal.
 *
 * This is intentionally a separate interface from the participant flow:
 *  - Administrators sign in with email + password.
 *  - Participants continue to use passwordless email OTP.
 *  - Forgotten administrator passwords are reset with an emailed OTP.
 */
export default function AdminAuthModal({ isOpen, onClose, onSuccess, onSwitchToParticipant }) {
  const { adminLogin, requestAdminPasswordOtp, resetAdminPassword } = useAuth();
  const { language, isRtl } = useLanguage();
  const tr = (en, ar) => (language === 'ar' ? ar : en);
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setErrorMsg('');
      setStatusMsg('');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setIsSubmitting(true);
    try {
      const user = await adminLogin(email, password);
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || tr('Administrator login failed.', 'فشل تسجيل دخول المشرف.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setIsSubmitting(true);
    try {
      const res = await requestAdminPasswordOtp(email);
      setStatusMsg(res.message || tr('If this email belongs to an administrator, a reset code has been sent.', 'إذا كان هذا البريد يخص مشرفاً، فقد تم إرسال رمز إعادة التعيين.'));
      setMode('reset');
    } catch (err) {
      setErrorMsg(err.message || tr('Failed to send reset code.', 'فشل إرسال رمز إعادة التعيين.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (newPassword.length < 8) {
      setErrorMsg(tr('Password must be at least 8 characters long.', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(tr('Passwords do not match.', 'كلمتا المرور غير متطابقتين.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetAdminPassword(email, otp, newPassword);
      setStatusMsg(res.message || tr('Password updated successfully. You can now sign in.', 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.'));
      setMode('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setDevOtp('');
    } catch (err) {
      setErrorMsg(err.message || tr('Failed to reset password.', 'فشل إعادة تعيين كلمة المرور.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-3 sm:p-6">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-8">
        <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden animate-fadeIn my-auto text-slate-100">

          {/* Distinct Administrator Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-950 via-slate-950 to-emerald-950 border-b border-amber-500/20 relative">
            <button
              type="button"
              onClick={onClose}
              aria-label={tr('Close administrator portal', 'إغلاق بوابة المشرفين')}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2.5 rounded-2xl bg-black/30 hover:bg-black/50 text-white ring-1 ring-white/15 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-amber-400/40 bg-emerald-950 shrink-0">
                <img src={thabatLogo} alt="THABĀT Emblem" className="w-full h-full object-cover" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{tr('Restricted Access', 'دخول محظور')}</span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {mode === 'login'
                ? tr('Administrator Portal', 'بوابة المشرفين والإدارة')
                : tr('Reset Administrator Password', 'إعادة تعيين كلمة مرور المشرف')}
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/70 mt-1.5 leading-relaxed">
              {mode === 'login'
                ? tr('This portal is separate from participant access. Sign in with your administrator email and password.', 'هذه البوابة منفصلة عن دخول المشاركين. سجّل الدخول ببريد المشرف وكلمة المرور.')
                : tr('We will email a one-time code to your administrator address. Enter it below with your new password.', 'سنرسل رمزاً لمرة واحدة إلى بريد المشرف. أدخله أدناه مع كلمة المرور الجديدة.')}
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-black/25 border border-amber-500/15 text-[11px] text-amber-100/70 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {tr('Administrator actions are audited. Never share your password or email OTP with anyone.', 'تُسجَّل إجراءات المشرفين في سجل التدقيق. لا تشارك كلمة المرور أو رمز البريد مع أي شخص.')}
              </span>
            </div>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'forgot' ? handleRequestReset : handleResetPassword} className="p-6 sm:p-8 space-y-4">

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {statusMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Email (all modes) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {tr('Administrator Email', 'بريد المشرف')} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password (login mode) */}
            {mode === 'login' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {tr('Administrator Password', 'كلمة مرور المشرف')} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 rtl:pl-11 rtl:pr-10 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label={showPassword ? tr('Hide password', 'إخفاء كلمة المرور') : tr('Show password', 'إظهار كلمة المرور')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP + new password (reset mode) */}
            {mode === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {tr('Email OTP', 'رمز البريد الإلكتروني')} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-center font-mono text-xl tracking-widest font-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {tr('New Password', 'كلمة المرور الجديدة')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={tr('At least 8 characters', '8 أحرف على الأقل')}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {tr('Confirm New Password', 'تأكيد كلمة المرور الجديدة')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 group transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>
                {mode === 'login'
                  ? tr('Sign In Securely', 'تسجيل الدخول الآمن')
                  : mode === 'forgot'
                    ? tr('Send Reset Code', 'إرسال رمز إعادة التعيين')
                    : tr('Set New Password', 'تعيين كلمة المرور الجديدة')}
              </span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Secondary actions */}
            <div className="flex flex-col gap-2 pt-2 text-xs border-t border-slate-800">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setStatusMsg(''); }}
                    className="font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer text-center"
                  >
                    {tr('Forgot password? Reset it via email OTP', 'نسيت كلمة المرور؟ أعد تعيينها عبر رمز البريد')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); if (onSwitchToParticipant) onSwitchToParticipant(); }}
                    className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer text-center"
                  >
                    {tr('Return to Participant Sign In', 'العودة لتسجيل دخول المشاركين')}
                  </button>
                </>
              ) : (
                <>
                  {mode === 'reset' && (
                    <button
                      type="button"
                      onClick={async () => {
                        setErrorMsg('');
                        setStatusMsg('');
                        try {
                          const res = await requestAdminPasswordOtp(email);
                          setStatusMsg(res.message || tr('A new reset code has been sent.', 'تم إرسال رمز جديد.'));
                        } catch (err) {
                          setErrorMsg(err.message || tr('Failed to resend reset code.', 'فشل إرسال الرمز.'));
                        }
                      }}
                      className="font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {tr('Resend Code', 'إعادة إرسال الرمز')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); setStatusMsg(''); }}
                    className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer text-center"
                  >
                    {tr('Back to Administrator Sign In', 'العودة لتسجيل دخول المشرف')}
                  </button>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
