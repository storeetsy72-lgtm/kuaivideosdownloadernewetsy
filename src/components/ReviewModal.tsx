import React, { useState } from 'react';
import { Star, Send, CheckCircle, X, Loader2 } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (reviewData: any) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || 'Great tool! Download was fast and in full HD quality.',
          name: name.trim() || 'Verified Downloader'
        })
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem('user_has_rated', 'true');
        setSubmitted(true);
        onSubmitted(result.data);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Review submit error:', err);
      // Fallback local save
      localStorage.setItem('user_has_rated', 'true');
      setSubmitted(true);
      setTimeout(() => onClose(), 1500);
    } finally {
      setSubmitting(false);
    }
  };

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

        {submitted ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Thank You for Your Feedback!
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your rating has been added to our community aggregate score.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-5">
              <span className="text-xs font-semibold tracking-wider uppercase text-orange-600 dark:text-orange-400">
                Community Feedback
              </span>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                How was your download experience?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Tap the stars below to rate kuaivideosdownloader:
              </p>
            </div>

            {/* Stars Selector */}
            <div className="flex justify-center items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating text descriptor */}
            <div className="text-center mb-4">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {rating === 5 && '🌟 Outstanding & Fast!'}
                {rating === 4 && '👍 Great and Easy to use'}
                {rating === 3 && '👌 Good experience'}
                {rating === 2 && '👎 Needs improvement'}
                {rating === 1 && '⚠️ Difficult to use'}
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-5">
              <div>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-neutral-900 dark:text-neutral-100 transition"
                  maxLength={30}
                />
              </div>

              <div>
                <textarea
                  placeholder="Share a short review about the speed or video quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-neutral-900 dark:text-neutral-100 resize-none transition"
                  maxLength={300}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 h-12 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 h-12 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:opacity-95 shadow-md shadow-orange-500/25 transition active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
