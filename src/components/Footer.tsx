import { TRANSLATIONS } from '../i18n/translations';
import type { Language, WorkspaceView } from '../types/lumenops';

interface FooterProps {
  lang: Language;
  isAdmin: boolean;
  onSelectView: (view: WorkspaceView) => void;
}

export default function Footer({ lang, isAdmin, onSelectView }: FooterProps) {
  const t = TRANSLATIONS[lang].nav;

  const handleNav = (view: WorkspaceView) => {
    onSelectView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{ id: WorkspaceView; label: string }> = [
    { id: 'operations', label: t.operations },
    { id: 'citizen', label: t.citizen },
  ];
  if (isAdmin) {
    navItems.push(
      { id: 'crews', label: t.crews },
      { id: 'analytics', label: t.analytics }
    );
  }

  return (
    <footer className="bg-[#08152B] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-display text-lg font-bold text-white">LumenOps</p>
          <p className="text-xs text-slate-400">
            {lang === 'kn'
              ? 'ಬೆಸ್ಕಾಂ ವಿತರಣಾ ಜಾಲಗಳಿಗಾಗಿ ಬುದ್ಧಿವಂತ ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ ಮತ್ತು ದೂರು ಕಾರ್ಯಾಚರಣೆ ವೇದಿಕೆ'
              : 'Intelligent Outage & Complaint Operations Platform for BESCOM Distribution Networks'}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-5 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
