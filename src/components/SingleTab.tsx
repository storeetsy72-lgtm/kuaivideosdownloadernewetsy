import React, { useState, useEffect, useRef } from 'react';
import {
  Link2,
  Sparkles,
  Clipboard,
  X,
  Loader2,
  Settings,
  Film,
  Music,
  Image as ImageIcon,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { VideoData, VideoQuality, AudioQuality, DownloadHistoryItem } from '../types';

interface SingleTabProps {
  onTriggerDownload: (item: DownloadHistoryItem) => void;
}

export const SingleTab: React.FC<SingleTabProps> = ({ onTriggerDownload }) => {
  const [url, setUrl] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'mp3' | 'jpeg'>('mp4');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<number>(0);
  const [fetchStageText, setFetchStageText] = useState<string>('Connecting to Kuaishou servers...');
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // Active result view tab: video or audio
  const [resultTab, setResultTab] = useState<'video' | 'audio'>('video');

  // Active downloading state
  const [activeDownloadingId, setActiveDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const progressTimerRef = useRef<any>(null);

  // Sample Kuaishou link for 1-click test
  const sampleUrl = 'https://v.kuaishou.com/fw/photo/3x2yiec5hsb552a';

  // Handle URL paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a Kuaishou or Kwai link first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFetchProgress(10);
    setFetchStageText('Connecting to Kuaishou servers...');

    // Progress simulation while server resolves redirects and SSR state
    let cur = 10;
    const progressInterval = setInterval(() => {
      cur += Math.floor(Math.random() * 18) + 8;
      if (cur >= 92) {
        cur = 92;
        clearInterval(progressInterval);
      }
      setFetchProgress(cur);
      if (cur > 30 && cur < 65) {
        setFetchStageText('Resolving video stream & CDN redirect...');
      } else if (cur >= 65) {
        setFetchStageText('Extracting full HD 1080p stream & metadata...');
      }
    }, 180);

    try {
      const res = await fetch('/api/fetch-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      clearInterval(progressInterval);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch video details.');
      }

      setFetchProgress(100);
      setFetchStageText('Details loaded!');
      setTimeout(() => {
        setVideoData(json.data);
        setIsLoading(false);
        // Switch tab based on format preselection
        if (selectedFormat === 'mp3') {
          setResultTab('audio');
        } else {
          setResultTab('video');
        }
      }, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsLoading(false);
      setError(err.message || 'Could not fetch video. Please check your link.');
    }
  };

  // Trigger file download
  const startDownload = (
    type: 'video' | 'audio' | 'image',
    targetUrl: string,
    filename: string,
    qualityLabel: string
  ) => {
    if (activeDownloadingId) return;

    setActiveDownloadingId(qualityLabel);
    setDownloadProgress(10);
    setDownloadStatusText('Connecting to CDN stream...');

    // Build the proxy download URL
    let downloadEndpoint = '';
    if (type === 'audio') {
      downloadEndpoint = `/api/extract-audio?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
    } else {
      downloadEndpoint = `/api/download-proxy?url=${encodeURIComponent(targetUrl)}&type=${type}&filename=${encodeURIComponent(filename)}`;
    }

    // Trigger direct browser download through invisible anchor element
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Save download to History
    const historyItem: DownloadHistoryItem = {
      id: `dl_${Date.now()}`,
      title: videoData?.title || 'Kuaishou Video',
      author: videoData?.author || 'Kuaishou Creator',
      thumbnail: videoData?.thumbnail || '',
      type,
      qualityLabel,
      downloadUrl: downloadEndpoint,
      filename,
      timestamp: Date.now()
    };

    onTriggerDownload(historyItem);

    // Animated progress simulation
    let p = 15;
    progressTimerRef.current = setInterval(() => {
      p += Math.floor(Math.random() * 20) + 12;
      if (p >= 100) {
        p = 100;
        clearInterval(progressTimerRef.current);
        setDownloadProgress(100);
        setDownloadStatusText('Download complete! Sent to browser.');
        setTimeout(() => {
          setActiveDownloadingId(null);
          setDownloadProgress(0);
          setDownloadStatusText('');
        }, 2200);
      } else {
        setDownloadProgress(p);
        setDownloadStatusText(`Downloading ${p}%...`);
      }
    }, 150);
  };

  const handleReset = () => {
    setVideoData(null);
    setError(null);
    setActiveDownloadingId(null);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      {!videoData ? (
        /* STEP A: INITIAL INPUT STATE */
        <div className="space-y-6">
          {/* Header Title & Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HD 1080p &amp; 4K Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Kuaishou Video Downloader
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Download clean Kuaishou and Kwai video clips, lossless MP3 music, and full-resolution covers without watermarks.
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleFetch} className="space-y-4">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-neutral-400 pointer-events-none">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                placeholder="Paste Kuaishou or Kwai link here (e.g. https://v.kuaishou.com/...)"
                className="w-full h-14 pl-12 pr-24 rounded-[20px] bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-inner transition"
              />

              {/* Input Action Helpers (Paste / Clear) */}
              <div className="absolute right-2.5 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200/80 dark:bg-neutral-700/80 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-xl transition"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Paste
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sample Link Helper */}
            <div className="flex items-center justify-between text-xs px-2 text-neutral-500 dark:text-neutral-400">
              <span>Supports short links, mobile share texts &amp; web URLs</span>
              <button
                type="button"
                onClick={() => {
                  setUrl(sampleUrl);
                  setError(null);
                }}
                className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                Try Sample Link
              </button>
            </div>

            {/* Format Selection Row */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-neutral-100/90 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60">
              <button
                type="button"
                onClick={() => setSelectedFormat('mp4')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  selectedFormat === 'mp4'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-4 h-4 text-orange-500" />
                <span>MP4 (Video)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('mp3')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  selectedFormat === 'mp3'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Music className="w-4 h-4 text-emerald-500" />
                <span>MP3 (Audio)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('jpeg')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  selectedFormat === 'jpeg'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>JPEG (Cover)</span>
              </button>
            </div>

            {/* Glowing Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-[20px] font-bold text-base text-white bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:opacity-95 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Media Link...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Download Link</span>
                </>
              )}
            </button>
          </form>

          {/* Loading state with animated gear and live percentage bar */}
          {isLoading && (
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Settings className="w-5 h-5 text-orange-500 animate-spin" />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {fetchStageText}
                  </span>
                </div>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                  {fetchProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-200 rounded-full"
                  style={{ width: `${fetchProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Unable to process link</span>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP B: RESULT CARD STATE */
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar with Video/Audio Tab and Back Button */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setResultTab('video')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                  resultTab === 'video'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-orange-500" />
                Video (MP4)
              </button>

              <button
                type="button"
                onClick={() => setResultTab('audio')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                  resultTab === 'audio'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-emerald-500" />
                Audio (MP3)
              </button>
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>

          {/* Media Header */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-800 shadow-sm">
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback image if remote host fails
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-white tracking-wider">
                HD
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
                {videoData.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  @{videoData.author}
                </span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Watermark Removed
                </span>
              </div>

              {/* Cover download direct helper */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() =>
                    startDownload('image', videoData.photoUrl || videoData.thumbnail, `kuaivideosdownloader_cover_${Date.now()}.jpg`, 'cover_image')
                  }
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  Download Cover (JPEG)
                </button>
              </div>
            </div>
          </div>

          {/* Active Download Progress Bar State */}
          {activeDownloadingId && (
            <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  {downloadStatusText}
                </span>
                <span className="font-bold text-orange-700 dark:text-orange-300 tabular-nums">
                  {downloadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-orange-200 dark:bg-orange-900/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-150 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* QUALITY GRIDS */}
          {resultTab === 'video' ? (
            /* Video 2x2 Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                <span>Select MP4 Video Quality:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Clean MP4 Stream</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {videoData.qualities.video.map((q) => {
                  const isCurrentActive = activeDownloadingId === q.label;
                  return (
                    <button
                      key={q.label}
                      onClick={() => startDownload('video', q.url, q.filename, q.label)}
                      disabled={!!activeDownloadingId}
                      className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-[0.98] ${
                        q.badge
                          ? 'border-orange-300 dark:border-orange-700/60 bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/20 dark:to-neutral-900 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      {q.badge && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/80 px-1.5 py-0.5 rounded-md">
                          {q.badge}
                        </span>
                      )}

                      <div>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                          {q.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                          {q.type} · {q.resolution}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          Download
                        </span>
                        {isCurrentActive ? (
                          <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Audio 2x2 Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                <span>Select MP3 Audio Bitrate:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ 100% Playable MP3 Audio
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {videoData.qualities.audio.map((q) => {
                  const isCurrentActive = activeDownloadingId === q.label;
                  return (
                    <button
                      key={q.label}
                      onClick={() =>
                        startDownload('audio', videoData.audioUrl || videoData.videoUrl, q.filename, q.label)
                      }
                      disabled={!!activeDownloadingId}
                      className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-[0.98] ${
                        q.badge
                          ? 'border-emerald-300 dark:border-emerald-700/60 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-neutral-900 shadow-sm'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      {q.badge && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-md">
                          {q.badge}
                        </span>
                      )}

                      <div>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 block">
                          {q.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                          {q.format} · Stereo
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Extract MP3
                        </span>
                        {isCurrentActive ? (
                          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        ) : (
                          <Music className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reset / Start Over Centered Action */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Download another video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
