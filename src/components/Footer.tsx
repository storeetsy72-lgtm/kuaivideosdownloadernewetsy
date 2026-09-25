import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 pt-6 pb-8 border-t border-neutral-200/80 dark:border-neutral-800 text-center text-xs text-neutral-400 space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-medium">
        <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          100% Free · No Registration Required
        </span>
        <span>·</span>
        <span>Fast CDN Streaming</span>
        <span>·</span>
        <span>Supports Kuaishou &amp; Kwai</span>
      </div>

      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 max-w-md mx-auto leading-relaxed">
        Disclaimer: This tool is intended for personal and educational backup use only. Please respect creator intellectual property and copyright laws.
      </p>

      <div className="text-[11px] text-neutral-400 pt-1">
        &copy; {new Date().getFullYear()} kuaivideosdownloader. All rights reserved.
      </div>
    </footer>
  );
};
