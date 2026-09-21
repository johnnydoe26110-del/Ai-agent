export type SocialPlatformId = 
  | 'youtube'
  | 'tiktok'
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'threads';

export interface SocialPlatformConfig {
  id: SocialPlatformId;
  name: string;
  formatName: string; // e.g., 'YouTube Shorts', 'TikTok', 'Instagram Reels'
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  maxDurationSec: number;
  maxTitleLength: number;
  maxCaptionLength: number;
  recommendedAspect: '9:16' | '1:1' | '16:9';
  handlePrefix: string;
  defaultPrivacy: 'public' | 'unlisted' | 'private';
}

export interface ConnectedAccount {
  platformId: SocialPlatformId;
  username: string;
  displayName: string;
  avatarUrl: string;
  isConnected: boolean;
  dailyQuotaUsed: number;
  dailyQuotaMax: number;
  tokenExpiresAt: string;
  followerCount: string;
}

export type PlatformUploadState = 
  | 'idle'
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

export interface PlatformUploadStatus {
  platformId: SocialPlatformId;
  state: PlatformUploadState;
  progress: number; // 0 to 100
  bytesUploaded: number;
  totalBytes: number;
  speedMBs: number; // e.g., 4.2 MB/s
  stageText: string; // e.g., 'Uploading chunk 3/8', 'Transcoding H.264', 'Verifying Copyright'
  publishedUrl?: string;
  postId?: string;
  errorMessage?: string;
  errorCode?: string;
  completedAt?: number;
  startedAt?: number;
}

export type JobOverallStatus = 
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'partially_failed'
  | 'failed'
  | 'paused';

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'unlisted' | 'private';
  aspectRatio: string;
  durationSeconds: number;
  fileSizeBytes: number;
  fileName: string;
  previewUrl: string;
  thumbnailUrl?: string;
}

export interface UploadJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  video: VideoMetadata;
  targetPlatforms: SocialPlatformId[];
  platformStatuses: Record<SocialPlatformId, PlatformUploadStatus>;
  overallStatus: JobOverallStatus;
  overallProgress: number; // 0 - 100
  speedMBs: number;
  etaSeconds: number;
  errorMessage?: string;
}

export interface AppNotification {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  jobId?: string;
  platformId?: SocialPlatformId;
  read: boolean;
  actionLabel?: string;
}

export interface USAPeakTiming {
  bestEstTime: string;
  bestPstTime: string;
  bestCstTime: string;
  targetDemographic: string;
  reachMultiplier: string;
  timeUntilOptimalMinutes: number;
  optimalDateIso: string;
  isPeakRightNow: boolean;
  platformBreakdowns: {
    platformId: SocialPlatformId;
    peakHoursEST: string;
    algorithmReason: string;
  }[];
}

export interface GamingClip {
  id: string;
  game: string;
  gameCategory: string;
  title: string;
  streamer: string;
  sourcePlatform: 'Twitch' | 'YouTube Gaming' | 'TikTok Gaming' | 'Kick' | 'Reddit';
  viralScore: number; // e.g. 97
  durationSeconds: number;
  clipStartSec: number;
  clipEndSec: number;
  videoUrl: string;
  thumbnailUrl: string;
  viewsCount: string;
  hookSummary: string;
  catchyTitle: string;
  viralCaption: string;
  hashtags: string[];
  usaTiming: USAPeakTiming;
}

export interface ScheduledAgentPost {
  id: string;
  clip: GamingClip;
  targetPlatforms: SocialPlatformId[];
  scheduledTimestamp: number;
  status: 'scheduled' | 'broadcasting' | 'completed' | 'cancelled';
  autoPilot: boolean;
}

