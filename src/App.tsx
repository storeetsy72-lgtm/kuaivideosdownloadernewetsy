import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SingleTab } from './components/SingleTab';
import { BatchTab } from './components/BatchTab';
import { HistoryTab } from './components/HistoryTab';
import { ReviewsWidget } from './components/ReviewsWidget';
import { SaveToPhoneModal } from './components/SaveToPhoneModal';
import { CreatorServicesModal } from './components/CreatorServicesModal';
import { ReviewModal } from './components/ReviewModal';
import { DownloadHistoryItem, ReviewItem, ReviewAggregate } from './types';
import { Link2, Layers, History } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // History state synced with localStorage
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kuaivideosdownloader_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
    }
    return [];
  });

  // Reviews state synced from backend
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [aggregate, setAggregate] = useState<ReviewAggregate>({
    rating: 4.9,
    reviewCount: 1250,
    fiveStar: 1180,
    fourStar: 60,
    threeStar: 8,
    twoStar: 1,
    oneStar: 1
  });

  // Modals state management for the 3-step sequential flow
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Fetch live reviews and aggregate score from backend
  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.reviews) setReviews(data.data.reviews);
          if (data.data.aggregate) setAggregate(data.data.aggregate);
        }
      })
      .catch((err) => console.warn('Could not load reviews:', err));
  }, []);

  // Save history to localStorage
  const saveHistory = (newItems: DownloadHistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem('kuaivideosdownloader_history', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  // Called whenever user clicks any download button
  const handleTriggerDownload = (item: DownloadHistoryItem) => {
    // 1. Add item to history (limit to 30 items)
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
    saveHistory(updated);

    // 2. Sequential Retention & Promo Modals Flow
    const phoneScreenShown = localStorage.getItem('phone_screen_modal_shown') === 'true';
    const userHasRated = localStorage.getItem('user_has_rated') === 'true';

    // Delay modal slightly so user sees the native download bar start immediately
    setTimeout(() => {
      if (!phoneScreenShown) {
        // Step 1: Show Phone Screen Modal
        setShowPhoneModal(true);
      } else {
        // Step 2: Show Creator Services Promo
        setShowCreatorModal(true);
      }
    }, 1200);
  };

  // Step 1 modal close handler -> proceeds to Step 2
  const handleClosePhoneModal = () => {
    localStorage.setItem('phone_screen_modal_shown', 'true');
    setShowPhoneModal(false);
    // Proceed to Step 2: Creator Services Modal
    setTimeout(() => {
      setShowCreatorModal(true);
    }, 400);
  };

  // Step 2 modal close/proceed handler -> proceeds to Step 3
  const handleCloseCreatorModal = () => {
    setShowCreatorModal(false);
    const userHasRated = localStorage.getItem('user_has_rated') === 'true';
    if (!userHasRated) {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 400);
    }
  };

  // Step 3 review submitted
  const handleReviewSubmitted = (data: any) => {
    if (data?.newReview) {
      setReviews((prev) => [data.newReview, ...prev]);
    }
    if (data?.aggregate) {
      setAggregate(data.aggregate);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-orange-500/20 selection:text-orange-600 transition-colors">
      <div className="w-full max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Navigation & Brand Header */}
        <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />

        {/* Main Card Container */}
        <main className="w-full bg-white dark:bg-neutral-900 rounded-[28px] border border-neutral-200/90 dark:border-neutral-800 shadow-xl shadow-neutral-200/40 dark:shadow-none p-6 sm:p-8 flex flex-col items-center">
          {/* Main Segmented Pill Tabs Header */}
          <div className="w-full max-w-sm flex items-center p-1 bg-neutral-100/90 dark:bg-neutral-800/80 rounded-2xl mb-8 border border-neutral-200/80 dark:border-neutral-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 ${
                activeTab === 'single'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Single</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 ${
                activeTab === 'batch'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-500" />
              <span>Batch</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-150 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>History</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Views */}
          <div className="w-full">
            {activeTab === 'single' && (
              <SingleTab onTriggerDownload={handleTriggerDownload} />
            )}

            {activeTab === 'batch' && (
              <BatchTab onTriggerDownload={handleTriggerDownload} />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                history={history}
                onClearHistory={handleClearHistory}
                onNavigateToSingle={() => setActiveTab('single')}
              />
            )}
          </div>

          {/* Live Reviews Widget & Marquee Ticker */}
          <ReviewsWidget
            aggregate={aggregate}
            reviews={reviews}
            onOpenReviewModal={() => setShowReviewModal(true)}
          />
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

      {/* Sequential Modals */}
      <SaveToPhoneModal
        isOpen={showPhoneModal}
        onClose={handleClosePhoneModal}
      />

      <CreatorServicesModal
        isOpen={showCreatorModal}
        onClose={handleCloseCreatorModal}
        onProceed={handleCloseCreatorModal}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
