import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Film,
  Music,
  ImageIcon,
  Calendar,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { DownloadHistoryItem } from '../types';

interface HistoryTabProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onNavigateToSingle: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onClearHistory,
  onNavigateToSingle
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  const formatTimestamp = (ts: number) => {
    try {
      const date = new Date(ts);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    const a = document.createElement('a');
    a.href = item.downloadUrl;
    a.download = item.filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (history.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
          <History className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
            No Downloads Yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Videos, audio tracks, and covers you download will automatically be saved here for quick re-access.
          </p>
        </div>
        <button
          onClick={onNavigateToSingle}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:opacity-95 shadow-md shadow-orange-500/20 transition active:scale-95"
        >
          Download Your First Video
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Download History
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {history.length} {history.length === 1 ? 'item' : 'items'} saved in local storage
          </p>
        </div>

        {showConfirmClear ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Clear all?</span>
            <button
              onClick={() => {
                onClearHistory();
                setShowConfirmClear(false);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        )}
      </div>

      {/* History Items List */}
      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Film className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 p-0.5 rounded-tl bg-black/80 text-[8px] text-white">
                  {item.type === 'audio' ? 'MP3' : item.type === 'image' ? 'JPG' : 'MP4'}
                </div>
              </div>

              <div className="min-w-0">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 block">
                  {item.title}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span>@{item.author}</span>
                  <span>·</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {item.qualityLabel}
                  </span>
                  <span>·</span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRedownload(item)}
              className="px-3 py-1.5 rounded-xl font-semibold text-xs text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40 dark:hover:text-orange-400 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-1.5 shrink-0 transition"
              title="Re-download this file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Re-download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
