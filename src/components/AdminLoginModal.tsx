import { useState, type FormEvent } from 'react';
import { Lock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language } from '../types/lumenops';

interface AdminLoginModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export default function AdminLoginModal({
  isOpen,
  lang,
  onClose,
  onLogin,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const t = TRANSLATIONS[lang].auth;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const ok = await onLogin(email, password);
    setSubmitting(false);
    if (!ok) {
      setError(t.errorInvalid);
    } else {
      setEmail('');
      setPassword('');
      onClose();
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@bescom.gov.in');
    setPassword('BESCOM@2026');
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-login-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
        <div className="bg-[#08152B] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <h2 id="admin-login-title" className="font-display text-base font-bold">
              {t.modalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.modalSubtitle}</p>

          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.emailLabel}
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bescom.gov.in"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {t.passwordLabel}
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-600">{t.demoHint}</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 whitespace-nowrap cursor-pointer text-left sm:text-right"
            >
              {t.fillDemoBtn}
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[42px] px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[42px] px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-70 rounded-lg transition-colors cursor-pointer"
            >
              {t.loginBtn}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
