import React from 'react';
import { DownloadCloud, Moon, Sun, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="w-full flex items-center justify-between pb-6 mb-2">
      {/* Brand logo zone */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
          <DownloadCloud className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              kuaivideosdownloader
            </span>
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.2 rounded-md">
              v2.0
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            No Watermark &amp; Audio Extractor
          </span>
        </div>
      </div>

      {/* Theme toggle action */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 transition"
          aria-label="Toggle dark/light theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>
    </header>
  );
};
