import { Globe, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';
import type { AdminUser, Language } from '../types/lumenops';

interface ControlStripProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  adminUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export default function ControlStrip({
  lang,
  onChangeLang,
  adminUser,
  onOpenLogin,
  onLogout,
}: ControlStripProps) {
  const t = TRANSLATIONS[lang].controlBar;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">{t.coverage}</p>

        <div className="flex flex-wrap items-center gap-3">
          {/* English / Kannada Language Switcher */}
          <div
            role="group"
            aria-label={t.languageLabel}
            className="inline-flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg"
          >
            <span className="pl-2 pr-1 text-slate-500 hidden sm:inline-flex items-center">
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`min-h-[30px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('kn')}
              className={`min-h-[30px] px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'kn'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Admin Session Status / Login Control */}
          {adminUser ? (
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  {adminUser.name} <span className="text-slate-400 font-normal">·</span>{' '}
                  <span className="text-slate-600 font-normal hidden sm:inline">
                    {t.adminSignedIn}
                  </span>
                </span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[32px] inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="min-h-[32px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#08152B] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{t.adminLogin}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
