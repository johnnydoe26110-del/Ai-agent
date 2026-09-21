import { SocialPlatformConfig, ConnectedAccount, VideoMetadata } from '../types';

export const PLATFORMS_CONFIG: Record<string, SocialPlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    formatName: 'YouTube Shorts',
    color: '#FF0000',
    bgColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    borderColor: 'border-red-500',
    icon: 'Youtube',
    maxDurationSec: 60,
    maxTitleLength: 100,
    maxCaptionLength: 5000,
    recommendedAspect: '9:16',
    handlePrefix: '@',
    defaultPrivacy: 'public'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    formatName: 'TikTok Video',
    color: '#00F2FE',
    bgColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    borderColor: 'border-cyan-400',
    icon: 'Flame',
    maxDurationSec: 600,
    maxTitleLength: 150,
    maxCaptionLength: 2200,
    recommendedAspect: '9:16',
    handlePrefix: '@',
    defaultPrivacy: 'public'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    formatName: 'Instagram Reels',
    color: '#E1306C',
    bgColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    borderColor: 'border-pink-500',
    icon: 'Instagram',
    maxDurationSec: 90,
    maxTitleLength: 100,
    maxCaptionLength: 2200,
    recommendedAspect: '9:16',
    handlePrefix: '@',
    defaultPrivacy: 'public'
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    formatName: 'X Video Post',
    color: '#F3F4F6',
    bgColor: 'bg-neutral-800 text-neutral-100 border-neutral-700',
    borderColor: 'border-neutral-500',
    icon: 'Twitter',
    maxDurationSec: 140,
    maxTitleLength: 280,
    maxCaptionLength: 280,
    recommendedAspect: '9:16',
    handlePrefix: '@',
    defaultPrivacy: 'public'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    formatName: 'Facebook Reels',
    color: '#1877F2',
    bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500',
    icon: 'Share2',
    maxDurationSec: 60,
    maxTitleLength: 120,
    maxCaptionLength: 2000,
    recommendedAspect: '9:16',
    handlePrefix: 'fb.me/',
    defaultPrivacy: 'public'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    formatName: 'LinkedIn Video',
    color: '#0A66C2',
    bgColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500',
    icon: 'Linkedin',
    maxDurationSec: 600,
    maxTitleLength: 150,
    maxCaptionLength: 3000,
    recommendedAspect: '9:16',
    handlePrefix: 'in/',
    defaultPrivacy: 'public'
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    formatName: 'Threads Clip',
    color: '#A3A3A3',
    bgColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    borderColor: 'border-zinc-500',
    icon: 'AtSign',
    maxDurationSec: 300,
    maxTitleLength: 100,
    maxCaptionLength: 500,
    recommendedAspect: '9:16',
    handlePrefix: '@',
    defaultPrivacy: 'public'
  }
};

export const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    platformId: 'youtube',
    username: 'CreatorStudioOfficial',
    displayName: 'Alex Rivers • Creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 4,
    dailyQuotaMax: 20,
    tokenExpiresAt: 'In 28 days',
    followerCount: '248K'
  },
  {
    platformId: 'tiktok',
    username: 'alex_rivers_official',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 3,
    dailyQuotaMax: 10,
    tokenExpiresAt: 'In 14 days',
    followerCount: '582K'
  },
  {
    platformId: 'instagram',
    username: 'alexrivers.reels',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 5,
    dailyQuotaMax: 25,
    tokenExpiresAt: 'In 60 days',
    followerCount: '319K'
  },
  {
    platformId: 'x',
    username: 'alexrivers_tech',
    displayName: 'Alex Rivers ⚡',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 7,
    dailyQuotaMax: 50,
    tokenExpiresAt: 'In 90 days',
    followerCount: '89.4K'
  },
  {
    platformId: 'facebook',
    username: 'alexriverscreator',
    displayName: 'Alex Rivers Media',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 2,
    dailyQuotaMax: 30,
    tokenExpiresAt: 'In 45 days',
    followerCount: '112K'
  },
  {
    platformId: 'linkedin',
    username: 'alex-rivers-tech',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 1,
    dailyQuotaMax: 15,
    tokenExpiresAt: 'In 30 days',
    followerCount: '44.8K'
  },
  {
    platformId: 'threads',
    username: 'alexrivers.reels',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isConnected: true,
    dailyQuotaUsed: 1,
    dailyQuotaMax: 30,
    tokenExpiresAt: 'In 60 days',
    followerCount: '95K'
  }
];

export const SAMPLE_VIDEOS: VideoMetadata[] = [
  {
    title: '5 AI Tools You Should Use Every Day in 2026',
    description: 'Transforming workflow in under 60 seconds! Here are the 5 essential AI utilities that save me 15+ hours every week. Which one are you trying first? Drop a comment below! 🚀',
    tags: ['ai', 'productivity', 'tech', 'future', 'workflow'],
    privacy: 'public',
    aspectRatio: '9:16 (Vertical Short)',
    durationSeconds: 38,
    fileSizeBytes: 24600000, // ~24.6 MB
    fileName: 'ai_tools_quick_guide_v2.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
  },
  {
    title: 'Behind the Scenes: 4K Mobile Studio Setup Tour',
    description: 'Quick walkthrough of the minimal 4K mobile creator rig that fits inside a single backpack. Ring light, wireless mic, and ultra-fast SSD storage.',
    tags: ['creator', 'studio', 'gear', 'setup', 'vlog'],
    privacy: 'public',
    aspectRatio: '9:16 (Vertical Short)',
    durationSeconds: 45,
    fileSizeBytes: 31200000, // ~31.2 MB
    fileName: 'studio_rig_tour_vertical.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80'
  },
  {
    title: 'How to Hook Viewers in First 3 Seconds (Retention Hack)',
    description: 'Stop losing 70% of viewers before the first sentence finishes! Use the visual pattern interrupt technique.',
    tags: ['shorts', 'contentcreation', 'growth', 'algorithm', 'reels'],
    privacy: 'public',
    aspectRatio: '9:16 (Vertical Short)',
    durationSeconds: 27,
    fileSizeBytes: 18400000, // ~18.4 MB
    fileName: 'hook_technique_mastery.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=400&auto=format&fit=crop&q=80'
  }
];

export const MOCK_POTENTIAL_ERRORS: Record<string, string[]> = {
  youtube: [
    'Daily YouTube Shorts quota exceeded (10/10). Resets at 00:00 UTC.',
    'YouTube API Error 403: videoTitleContainsInvalidChars',
    'Audio copyright claim flagged during Google Content ID processing.'
  ],
  tiktok: [
    'TikTok Open API: Access token expired. Please re-authenticate your TikTok Creator account.',
    'TikTok Video upload failed: Bitrate exceeds max threshold (50 Mbps).',
    'Community Guidelines automated filter triggered for review.'
  ],
  instagram: [
    'Instagram Graph API: Rate limit reached for /user/media container endpoint.',
    'Instagram Reels: Aspect ratio validation mismatch. Expected 9:16.',
    'Instagram session expired. Please re-grant instagram_content_publish scope.'
  ],
  x: [
    'X API v2: Upload chunk timed out on media/upload INIT stage.',
    'X Post limit reached for media attachments today.',
    'X API: Media processing took longer than 60s timeout.'
  ],
  facebook: [
    'Facebook Pages API: Missing publish_video permission for Alex Rivers Media.',
    'Facebook Reels: Video chunk upload hash check failed.'
  ],
  linkedin: [
    'LinkedIn API: RegisterUpload request failed with status 429 Too Many Requests.',
    'LinkedIn video format validation rejected container.'
  ],
  threads: [
    'Threads API: Server response timeout during media transcode.',
    'Threads access token invalid.'
  ]
};
