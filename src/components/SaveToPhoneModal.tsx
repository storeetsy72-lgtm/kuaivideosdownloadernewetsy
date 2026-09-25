import React from 'react';
import { Smartphone, MoreVertical, Share2, CheckCircle2, X } from 'lucide-react';

interface SaveToPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveToPhoneModal: React.FC<SaveToPhoneModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[28px] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-orange-600 dark:text-orange-400">
              Quick Bookmark
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
              Don't lose this website kuaivideosdownloader!
            </h3>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 leading-relaxed">
          Add our downloader directly to your home screen for instantaneous 1-tap access anytime without opening a search browser:
        </p>

        <div className="space-y-3 mb-6">
          {/* Android instruction */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <MoreVertical className="w-4 h-4" />
            </div>
            <div className="text-xs leading-normal">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Android (Chrome / Samsung):</span>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                Tap 3 dots (<span className="font-medium text-neutral-800 dark:text-neutral-200">⋮</span>) top right &rarr; select <span className="font-semibold text-orange-600 dark:text-orange-400">Add to Home screen</span>.
              </p>
            </div>
          </div>

          {/* iOS instruction */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-xs leading-normal">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">iPhone / iPad (Safari):</span>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                Tap Share icon (<span className="font-medium text-neutral-800 dark:text-neutral-200">⎋</span>) bottom bar &rarr; scroll down to <span className="font-semibold text-orange-600 dark:text-orange-400">Add to Home Screen</span>.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:opacity-95 shadow-md shadow-orange-500/20 transition active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          Got It, Continue
        </button>
      </div>
    </div>
  );
};
