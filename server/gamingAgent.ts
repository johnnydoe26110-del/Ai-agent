import { GoogleGenAI } from '@google/genai';
import { GamingClip, USAPeakTiming } from '../src/types';

// Curated playable gaming video streams (high quality, reliable, royalty-free gaming action)
const GAMING_VIDEO_POOLS = [
  {
    game: 'GTA VI / Open World',
    category: 'Stunts & Chaos',
    streamer: 'KaizenDrifts',
    sourcePlatform: 'Twitch' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    viewsCount: '1.4M views',
    durationSeconds: 38,
    clipStartSec: 8,
    clipEndSec: 36
  },
  {
    game: 'Valorant',
    category: 'Radiant Clutch',
    streamer: 'TenZ_Highlights',
    sourcePlatform: 'YouTube Gaming' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    viewsCount: '890K views',
    durationSeconds: 32,
    clipStartSec: 5,
    clipEndSec: 31
  },
  {
    game: 'Elden Ring / Souls',
    category: 'Impossible Boss Cheese',
    streamer: 'IronParryGod',
    sourcePlatform: 'TikTok Gaming' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    viewsCount: '2.1M views',
    durationSeconds: 40,
    clipStartSec: 10,
    clipEndSec: 38
  },
  {
    game: 'Minecraft Hardcore',
    category: 'Buzzer-Beater Clutch',
    streamer: 'PixelSurviver',
    sourcePlatform: 'Twitch' as const,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80',
    viewsCount: '3.4M views',
    durationSeconds: 28,
    clipStartSec: 4,
    clipEndSec: 26
  }
];

export function computeUSAPeakTimings(): USAPeakTiming {
  const now = new Date();
  // Get current hour in EST (UTC - 4 in daylight saving / -5 in winter)
  const estHours = (now.getUTCHours() - 4 + 24) % 24;
  
  // Peak USA short-form video engagement for gaming:
  // 6:30 PM - 9:45 PM EST (18:30 - 21:45) -> 3:30 PM - 6:45 PM PST
  const isPeakRightNow = estHours >= 18 && estHours <= 22;

  let minutesUntilOptimal = 0;
  if (!isPeakRightNow) {
    if (estHours < 18) {
      minutesUntilOptimal = (18 - estHours) * 60 - now.getUTCMinutes();
    } else {
      minutesUntilOptimal = (24 - estHours + 18) * 60 - now.getUTCMinutes();
    }
  }

  const optimalDate = new Date(now.getTime() + Math.max(0, minutesUntilOptimal) * 60000);

  return {
    bestEstTime: '7:15 PM EST (New York)',
    bestCstTime: '6:15 PM CST (Chicago)',
    bestPstTime: '4:15 PM PST (Los Angeles)',
    targetDemographic: 'USA Gen-Z & Millennial Gamers (Peak After-School / Post-Work Mobile Screen Time)',
    reachMultiplier: '3.2x Algorithmic Velocity Surge',
    timeUntilOptimalMinutes: Math.max(0, minutesUntilOptimal),
    optimalDateIso: optimalDate.toISOString(),
    isPeakRightNow,
    platformBreakdowns: [
      {
        platformId: 'tiktok',
        peakHoursEST: '7:00 PM – 9:30 PM EST',
        algorithmReason: 'US TikTok algorithm prioritizes high immediate completion rate during evening couch scrolling.'
      },
      {
        platformId: 'youtube',
        peakHoursEST: '6:30 PM – 9:00 PM EST',
        algorithmReason: 'YouTube Shorts feed velocity spikes when East Coast and West Coast students & workers overlap.'
      },
      {
        platformId: 'instagram',
        peakHoursEST: '8:00 PM – 10:00 PM EST',
        algorithmReason: 'Instagram Reels engagement index reaches daily peak when users relax at night.'
      },
      {
        platformId: 'x',
        peakHoursEST: '6:00 PM – 8:30 PM EST',
        algorithmReason: 'Gaming Twitter / X discussions peak right after pro esports scrims and evening matches.'
      }
    ]
  };
}

export async function scoutGamingClipsWithGemini(queryTopic?: string): Promise<GamingClip[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const timing = computeUSAPeakTimings();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are an elite Autonomous AI Gaming Content Scout and Viral Video Clipper specializing in USA gaming audiences.
Topic / Query requested: "${queryTopic || 'Trending viral gaming clutch moments 2026'}"

Identify 4 viral short-form gaming clip concepts from Twitch, YouTube Gaming, or TikTok (e.g. GTA VI crazy stunt, Valorant 1v5 Ace, Elden Ring boss parry, Minecraft clutch).
For each clip provide:
- game: Game name (e.g. GTA VI, Valorant, Elden Ring, Minecraft)
- gameCategory: Category (e.g. Radiant 1v5 Ace, Physics Glitch, World Record)
- title: Scene description
- streamer: Streamer or creator name
- sourcePlatform: "Twitch" or "YouTube Gaming" or "TikTok Gaming" or "Kick"
- viralScore: Integer between 91 and 99
- hookSummary: A 1-sentence breakdown of why this clip hooks viewers in the first 2 seconds
- catchyTitle: An all-caps, irresistible click-worthy hook title for US audiences (under 70 chars)
- viralCaption: A punchy 2-3 sentence caption with high-comment question call-to-action
- hashtags: 6 trending hashtags without # symbol (e.g. ["gaming", "shorts", "clutch", "twitch", "gamer"])

Format strictly as JSON array matching:
[
  {
    "game": "...",
    "gameCategory": "...",
    "title": "...",
    "streamer": "...",
    "sourcePlatform": "Twitch",
    "viralScore": 98,
    "hookSummary": "...",
    "catchyTitle": "...",
    "viralCaption": "...",
    "hashtags": ["..."]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4).map((item, idx) => {
            const pool = GAMING_VIDEO_POOLS[idx % GAMING_VIDEO_POOLS.length];
            return {
              id: `clip_${idx}_${Date.now()}`,
              game: item.game || pool.game,
              gameCategory: item.gameCategory || pool.category,
              title: item.title || 'Incredible Gaming Moment',
              streamer: item.streamer || pool.streamer,
              sourcePlatform: (item.sourcePlatform as GamingClip['sourcePlatform']) || pool.sourcePlatform,
              viralScore: item.viralScore || Math.floor(92 + Math.random() * 7),
              durationSeconds: pool.durationSeconds,
              clipStartSec: pool.clipStartSec,
              clipEndSec: pool.clipEndSec,
              videoUrl: pool.videoUrl,
              thumbnailUrl: pool.thumbnailUrl,
              viewsCount: `${(1.2 + Math.random() * 2.5).toFixed(1)}M views`,
              hookSummary: item.hookSummary || 'Pattern interrupt in first 1.5 seconds triggers extreme curiosity.',
              catchyTitle: item.catchyTitle || 'NO WAY HE HIT THIS SHOT! 🤯',
              viralCaption: item.viralCaption || 'Is this the cleanest clutch you have seen all week? Rate this 1-10 in the comments! 👇',
              hashtags: Array.isArray(item.hashtags) ? item.hashtags : ['gaming', 'clutch', 'shorts', 'reels', 'gamer'],
              usaTiming: timing
            };
          });
        }
      }
    } catch (err) {
      console.warn('Gemini AI Gaming Scout fallback to curated data:', err);
    }
  }

  // Fallback high-impact curated gaming moments
  return [
    {
      id: 'clip_gta_01',
      game: 'GTA VI',
      gameCategory: 'Physics Stunt & Flight',
      title: 'Impossible Skydiving Motorcycle Landing on Yacht',
      streamer: 'KaizenDrifts',
      sourcePlatform: 'Twitch',
      viralScore: 98,
      durationSeconds: 38,
      clipStartSec: 8,
      clipEndSec: 36,
      videoUrl: GAMING_VIDEO_POOLS[0].videoUrl,
      thumbnailUrl: GAMING_VIDEO_POOLS[0].thumbnailUrl,
      viewsCount: '2.8M views',
      hookSummary: 'Instant visual spectacle: motorcyle jumping out of a cargo plane at 10,000 feet directly into Vice City waters.',
      catchyTitle: 'HE ACTUALLY PULLED OFF THE IMPOSSIBLE GTA 6 STUNT! 🤯🏍️',
      viralCaption: 'After 400 attempts, Kaizen finally landed the Vice City cargo jump. Was this pure skill or 100% luck? Tell me below! 👇',
      hashtags: ['gta6', 'gaming', 'stunt', 'shorts', 'twitchclips', 'vicecity'],
      usaTiming: timing
    },
    {
      id: 'clip_val_02',
      game: 'Valorant',
      gameCategory: 'Radiant 1v5 Clutch',
      title: '0.02s Defuse with 1 HP Sheriff Only Ace',
      streamer: 'TenZ_Highlights',
      sourcePlatform: 'YouTube Gaming',
      viralScore: 96,
      durationSeconds: 32,
      clipStartSec: 5,
      clipEndSec: 31,
      videoUrl: GAMING_VIDEO_POOLS[1].videoUrl,
      thumbnailUrl: GAMING_VIDEO_POOLS[1].thumbnailUrl,
      viewsCount: '1.9M views',
      hookSummary: 'Immediate high-stakes heartbeat sound and 1 HP health bar triggers intense suspense.',
      catchyTitle: '1 HP SHERIFF 1v5 CLUTCH WITH 0.02s ON THE CLOCK 🎯⚡',
      viralCaption: 'This Radiant player defied all laws of FPS physics. Could your duo ever hit a flick this filthy? Tag them right now!',
      hashtags: ['valorant', 'clutch', 'radiant', 'fps', 'gamingclip', 'reels'],
      usaTiming: timing
    },
    {
      id: 'clip_elden_03',
      game: 'Elden Ring',
      gameCategory: 'DLC Boss Mastery',
      title: 'Blindfolded Consort Radahn No-Hit Parry Finish',
      streamer: 'IronParryGod',
      sourcePlatform: 'TikTok Gaming',
      viralScore: 99,
      durationSeconds: 40,
      clipStartSec: 10,
      clipEndSec: 38,
      videoUrl: GAMING_VIDEO_POOLS[2].videoUrl,
      thumbnailUrl: GAMING_VIDEO_POOLS[2].thumbnailUrl,
      viewsCount: '3.4M views',
      hookSummary: 'Auditory parry chime sync and insane boss animation creates instant awe.',
      catchyTitle: 'BLINDFOLDED RADAHN NO-HIT IS BEYOND HUMAN REFLEXES ⚔️🔥',
      viralCaption: 'He did what took thousands of gamers 200+ hours without even looking at the monitor once. Absolute Soulsborne mastery!',
      hashtags: ['eldenring', 'bossfight', 'soulsborne', 'tiktokgaming', 'insaneclutch'],
      usaTiming: timing
    },
    {
      id: 'clip_mc_04',
      game: 'Minecraft',
      gameCategory: 'Hardcore 1000 Days',
      title: 'End Crystal Void Save with Water Bucket Clutch',
      streamer: 'PixelSurviver',
      sourcePlatform: 'Twitch',
      viralScore: 94,
      durationSeconds: 28,
      clipStartSec: 4,
      clipEndSec: 26,
      videoUrl: GAMING_VIDEO_POOLS[3].videoUrl,
      thumbnailUrl: GAMING_VIDEO_POOLS[3].thumbnailUrl,
      viewsCount: '1.7M views',
      hookSummary: 'Falling into the infinite void with 1 heart triggers acute viewer panic.',
      catchyTitle: 'HIS 1,000-DAY WORLD WAS 1 PIXEL AWAY FROM BEING DELETED! 😱',
      viralCaption: 'My heart literally stopped watching this live on Twitch. The single greatest bucket save in Minecraft history? Drop your thoughts!',
      hashtags: ['minecraft', 'minecraftclutch', 'hardcore', 'gamingforyou', 'shorts'],
      usaTiming: timing
    }
  ];
}
