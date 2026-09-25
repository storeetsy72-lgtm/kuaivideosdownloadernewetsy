import React, { useState } from 'react';
import { Sparkles, MessageCircle, Copy, Check, Video, Scissors, Flame, Clock, X } from 'lucide-react';

interface CreatorServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const CreatorServicesModal: React.FC<CreatorServicesModalProps> = ({ isOpen, onClose, onProceed }) => {
  const [copied, setCopied] = useState(false);
  const phoneNumber = '0343 789 3678';
  const whatsappUrl = 'https://wa.me/03437893678';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('03437893678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[28px] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-left overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Special Creator Deals
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              Level Up Your Content
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
          Premium creator subscriptions at wholesale rates + high-converting video editing services:
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Canva &amp; CapCut Pro</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Private lifetime &amp; annual accounts at 80% discount.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Scissors className="w-3.5 h-3.5 text-red-500" />
              <span>Viral Video Editing</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Hook editing, pacing &amp; captions for Reels &amp; TikTok.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>Clickbait Covers</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              High CTR YouTube &amp; Kuaishou thumbnail designs.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>24/7 Fast Delivery</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Under 12-hour turnaround for shorts and repost packages.
            </p>
          </div>
        </div>

        {/* WhatsApp & Copy Section */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Direct WhatsApp Support:
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Number'}
            </button>
          </div>
          <p className="text-sm font-bold font-mono text-emerald-900 dark:text-emerald-100">
            {phoneNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onProceed}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            Chat on WhatsApp
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition"
          >
            Not interested, skip
          </button>
        </div>
      </div>
    </div>
  );
};
