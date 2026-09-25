import React, { useState } from 'react';
import {
  ListFilter,
  Layers,
  Download,
  Film,
  Music,
  Loader2,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { VideoData, DownloadHistoryItem } from '../types';

interface BatchResult {
  url: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  data?: VideoData;
  error?: string;
}

interface BatchTabProps {
  onTriggerDownload: (item: DownloadHistoryItem) => void;
}

export const BatchTab: React.FC<BatchTabProps> = ({ onTriggerDownload }) => {
  const [urlsInput, setUrlsInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [results, setResults] = useState<BatchResult[]>([]);

  const sampleBatch = [
    'https://v.kuaishou.com/fw/photo/3x2yiec5hsb552a',
    'https://www.kuaishou.com/short-video/3xgumwke4cjizjw',
    'https://kwai-video.com/p/v94k2001'
  ].join('\n');

  const handleProcessBatch = async () => {
    const rawLines = urlsInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawLines.length === 0) return;

    setIsProcessing(true);
    const initialBatch: BatchResult[] = rawLines.map((u) => ({
      url: u,
      status: 'pending'
    }));
    setResults(initialBatch);

    const CONCURRENCY_LIMIT = 5;
    let completedCount = 0;
    const total = rawLines.length;

    const queue = [...initialBatch.keys()];

    const worker = async () => {
      while (queue.length > 0) {
        const index = queue.shift();
        if (index === undefined) break;

        setResults((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'processing' };
          return next;
        });

        const target = rawLines[index];
        setProgressText(`Processing ${completedCount + 1} of ${total}...`);

        try {
          const res = await fetch('/api/fetch-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: target })
          });
          const json = await res.json();

          if (res.ok && json.success) {
            setResults((prev) => {
              const next = [...prev];
              next[index] = {
                url: target,
                status: 'success',
                data: json.data
              };
              return next;
            });
          } else {
            setResults((prev) => {
              const next = [...prev];
              next[index] = {
                url: target,
                status: 'error',
                error: json.error || 'Failed to fetch video stream'
              };
              return next;
            });
          }
        } catch (err: any) {
          setResults((prev) => {
            const next = [...prev];
            next[index] = {
              url: target,
              status: 'error',
              error: err.message || 'Network request failed'
            };
            return next;
          });
        } finally {
          completedCount++;
          setProgressText(`Processed ${completedCount} of ${total}`);
        }
      }
    };

    // Run up to CONCURRENCY_LIMIT simultaneous workers
    const workers = Array.from(
      { length: Math.min(CONCURRENCY_LIMIT, total) },
      () => worker()
    );
    await Promise.all(workers);

    setIsProcessing(false);
    setProgressText(`Completed! ${completedCount} links processed.`);
  };

  const handleDownloadItem = (
    itemData: VideoData,
    type: 'video' | 'audio',
    qualityLabel: string
  ) => {
    let targetStream = itemData.videoUrl;
    let filename = '';
    const safeTitle = itemData.title.replace(/[^\w\s-]/g, '').slice(0, 50) || 'kuaishou_video';

    if (type === 'audio') {
      targetStream = itemData.audioUrl || itemData.videoUrl;
      filename = `kuaivideosdownloader_${safeTitle}_320k.mp3`;
    } else {
      filename = `kuaivideosdownloader_${safeTitle}_HD.mp4`;
    }

    const downloadEndpoint =
      type === 'audio'
        ? `/api/extract-audio?url=${encodeURIComponent(targetStream)}&filename=${encodeURIComponent(filename)}`
        : `/api/download-proxy?url=${encodeURIComponent(targetStream)}&type=${type}&filename=${encodeURIComponent(filename)}`;

    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onTriggerDownload({
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: itemData.title,
      author: itemData.author,
      thumbnail: itemData.thumbnail,
      type,
      qualityLabel,
      downloadUrl: downloadEndpoint,
      filename,
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Batch Video Downloader
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Paste multiple Kuaishou / Kwai video URLs (one per line) to parse and download in bulk.
        </p>
      </div>

      {/* Textarea container */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={urlsInput}
            onChange={(e) => setUrlsInput(e.target.value)}
            disabled={isProcessing}
            rows={5}
            placeholder={`https://v.kuaishou.com/xxxxxx\nhttps://www.kuaishou.com/short-video/xxxxxx\nhttps://kwai-video.com/p/xxxxxx`}
            className="w-full p-4 text-xs font-mono rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center justify-between text-xs px-1 text-neutral-500 dark:text-neutral-400">
          <span>Max 20 links per batch recommended</span>
          <button
            type="button"
            onClick={() => setUrlsInput(sampleBatch)}
            className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
          >
            Insert 3 Sample Links
          </button>
        </div>

        <button
          onClick={handleProcessBatch}
          disabled={isProcessing || !urlsInput.trim()}
          className="w-full h-12 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:opacity-95 shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{progressText || 'Processing Concurrent Batch...'}</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              <span>Fetch All Videos in Batch</span>
            </>
          )}
        </button>
      </div>

      {/* Results List */}
      {results.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold">Results ({results.length}):</span>
            {progressText && <span className="text-orange-600 dark:text-orange-400">{progressText}</span>}
          </div>

          <div className="space-y-2.5">
            {results.map((res, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
              >
                {res.status === 'processing' && (
                  <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-300">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="truncate max-w-[280px] font-mono">{res.url}</span>
                  </div>
                )}

                {res.status === 'pending' && (
                  <div className="flex items-center gap-2.5 text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-neutral-300" />
                    <span className="truncate max-w-[280px] font-mono">{res.url}</span>
                  </div>
                )}

                {res.status === 'error' && (
                  <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-mono truncate block max-w-[220px] sm:max-w-[320px]">{res.url}</span>
                      <span className="text-[10px] text-neutral-500">{res.error}</span>
                    </div>
                  </div>
                )}

                {res.status === 'success' && res.data && (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={res.data.thumbnail}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-neutral-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 block">
                          {res.data.title}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          @{res.data.author}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDownloadItem(res.data!, 'video', '1080p HD')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1 transition shadow-sm"
                        title="Download MP4 Video"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>MP4</span>
                      </button>

                      <button
                        onClick={() => handleDownloadItem(res.data!, 'audio', '320 kbps')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition shadow-sm"
                        title="Extract MP3 Audio"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>MP3</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
