import React from 'react';
import { Star, ShieldCheck, MessageSquarePlus, Quote } from 'lucide-react';
import { ReviewItem, ReviewAggregate } from '../types';

interface ReviewsWidgetProps {
  aggregate: ReviewAggregate;
  reviews: ReviewItem[];
  onOpenReviewModal: () => void;
}

export const ReviewsWidget: React.FC<ReviewsWidgetProps> = ({
  aggregate,
  reviews,
  onOpenReviewModal
}) => {
  // Duplicate reviews for smooth endless marquee scrolling
  const displayReviews = [...reviews, ...reviews];

  return (
    <div className="w-full mt-10 pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
      {/* Top summary header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {aggregate.rating.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">
                {aggregate.reviewCount.toLocaleString()} verified ratings
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Free
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReviewModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/60 transition shadow-sm active:scale-95"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-orange-500" />
          Write a Review
        </button>
      </div>

      {/* Marquee ticker */}
      <div className="relative overflow-hidden w-full py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee gap-4">
          {displayReviews.map((rev, index) => (
            <div
              key={`${rev.id}-${index}`}
              className="w-[280px] sm:w-[320px] p-4 rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex flex-col justify-between shrink-0 text-left select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[150px]">
                    {rev.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ✓ Verified User
                </span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
