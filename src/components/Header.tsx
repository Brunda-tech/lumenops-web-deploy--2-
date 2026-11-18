import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TRANSLATIONS } from '../i18n/translations';
import type { Language, WorkspaceView } from '../types/lumenops';

interface HeaderProps {
  activeView: WorkspaceView;
  lang: Language;
  isAdmin: boolean;
  onSelectView: (view: WorkspaceView) => void;
}

export default function Header({
  activeView,
  lang,
  isAdmin,
  onSelectView,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = TRANSLATIONS[lang].nav;

  const allNavItems: Array<{ id: WorkspaceView; label: string }> = [
    { id: 'operations', label: t.operations },
    { id: 'citizen', label: t.citizen },
    { id: 'crews', label: t.crews },
    { id: 'analytics', label: t.analytics },
  ];
  const navItems = allNavItems.filter(
    (item) => isAdmin || (item.id !== 'crews' && item.id !== 'analytics')
  );

  const handleSelect = (view: WorkspaceView) => {
    onSelectView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08152B] text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('operations')}
          className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 rounded-sm"
        >
          LumenOps
        </button>

        {/* Zone 2: 5 concise single-line workspace navigation links */}
        <nav
          aria-label="Primary workspace navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
                  isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-amber-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-[#08152B] border-t border-white/10 px-4 py-4 space-y-2"
          >
            <nav aria-label="Mobile workspace navigation" className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`min-h-[44px] w-full text-left flex items-center justify-between px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-amber-400 font-semibold'
                        : 'text-slate-200 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
