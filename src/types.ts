export interface VideoQuality {
  label: string;
  resolution: string;
  type: string;
  url: string;
  badge: string | null;
  filename: string;
}

export interface AudioQuality {
  label: string;
  format: string;
  bitrate: string;
  badge: string | null;
  filename: string;
}

export interface VideoData {
  title: string;
  author: string;
  avatar?: string;
  thumbnail: string;
  photoUrl: string;
  videoUrl: string;
  audioUrl?: string;
  duration?: number;
  qualities: {
    video: VideoQuality[];
    audio: AudioQuality[];
  };
  originalUrl: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  type: 'video' | 'audio' | 'image';
  qualityLabel: string;
  downloadUrl: string;
  filename: string;
  timestamp: number;
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ReviewAggregate {
  rating: number;
  reviewCount: number;
  fiveStar?: number;
  fourStar?: number;
  threeStar?: number;
  twoStar?: number;
  oneStar?: number;
}
