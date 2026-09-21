import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Flame, 
  Search, 
  RefreshCw, 
  Clock, 
  Play, 
  Pause, 
  Scissors, 
  Zap, 
  Globe, 
  TrendingUp, 
  Check, 
  Eye, 
  Share2,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { GamingClip, USAPeakTiming, VideoMetadata } from '../types';
import { useUploadQueue } from '../context/UploadQueueContext';
import { ClipTrimmerModal } from './ClipTrimmerModal';
import { soundService } from '../services/sound';

interface GamingAgentViewProps {
  onNavigateToQueue: () => void;
}

export const GamingAgentView: React.FC<GamingAgentViewProps> = ({ onNavigateToQueue }) => {
  const { enqueueJob, accounts } = useUploadQueue();

  const [clips, setClips] = useState<GamingClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [autoPilot, setAutoPilot] = useState(false);
  const [usaTimings, setUsaTimings] = useState<USAPeakTiming | null>(null);

  // Active playing clip preview
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  // Active clip trimmer modal
  const [activeTrimClip, setActiveTrimClip] = useState<GamingClip | null>(null);

  // Scheduled notification indicator
  const [scheduledClipId, setScheduledClipId] = useState<string | null>(null);

  const fetchClips = async (query?: string) => {
    soundService.playTick();
    setLoading(true);
    try {
      const res = await fetch('/api/agent/discover-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query || searchQuery || selectedCategory })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.clips)) {
        setClips(data.clips);
        if (data.clips[0]?.usaTiming) {
          setUsaTimings(data.clips[0].usaTiming);
        }
        soundService.playSuccess();
      }
    } catch (err) {
      console.error('Failed to discover clips:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimings = async () => {
    try {
      const res = await fetch('/api/agent/usa-timings');
      const data = await res.json();
      if (data.success && data.timings) {
        setUsaTimings(data.timings);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchClips();
    fetchTimings();
  }, []);

  const connectedPlatformIds = accounts.filter(a => a.isConnected).map(a => a.platformId);

  // 1-Click direct clip & simultaneous broadcast
  const handleDirectBroadcast = (clip: GamingClip) => {
    soundService.playStart();
    const clipDuration = clip.clipEndSec - clip.clipStartSec;
    const videoMeta: VideoMetadata = {
      title: clip.catchyTitle,
      description: clip.viralCaption,
      tags: clip.hashtags,
      privacy: 'public',
      aspectRatio: '9:16 (Auto-Framed Short)',
      durationSeconds: clipDuration,
      fileSizeBytes: Math.floor(clipDuration * 800000),
      fileName: `${clip.game.toLowerCase().replace(/[^a-z0-9]/g, '_')}_clip.mp4`,
      previewUrl: clip.videoUrl,
      thumbnailUrl: clip.thumbnailUrl
    };

    enqueueJob(videoMeta, connectedPlatformIds);
    onNavigateToQueue();
  };

  // Schedule for USA Peak
  const handleScheduleForPeak = (clip: GamingClip) => {
    soundService.playSuccess();
    setScheduledClipId(clip.id);

    // After 2.5s simulate auto-dispatch into the queue
    setTimeout(() => {
      handleDirectBroadcast(clip);
    }, 2500);
  };

  return (
    <div id="gaming-agent-container" className="flex flex-col h-full overflow-y-auto pb-28">
      {/* Top Agent Header & USA Live Timing Monitor */}
      <div className="p-4 border-b border-neutral-800 bg-gradient-to-b from-purple-950/40 via-neutral-900/50 to-neutral-900/70 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-neutral-100 flex items-center gap-1.5">
                AI Viral Gaming Agent
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded-full">
                  Scout Mode
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400">
                Finds web gaming clips, auto-clips 9:16 & times for peak USA reach
              </p>
            </div>
          </div>

          {/* Auto-Pilot Toggle */}
          <button
            id="btn-toggle-autopilot"
            onClick={() => {
              setAutoPilot(!autoPilot);
              soundService.playTick();
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              autoPilot
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/80 hover:text-neutral-200'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${autoPilot ? 'text-emerald-400' : ''}`} />
            <span>Auto-Pilot: {autoPilot ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>

        {/* USA Time Zone Radar Bar */}
        {usaTimings && (
          <div className="bg-neutral-950/80 border border-indigo-500/30 rounded-2xl p-2.5 mb-2.5 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-indigo-300 flex items-center gap-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                USA Peak Algorithm Timing Engine
              </span>
              <span className="font-extrabold text-emerald-400 bg-emerald-500/15 px-2 py-0.2 rounded-full border border-emerald-500/30">
                {usaTimings.reachMultiplier}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
              <div className="bg-neutral-900/90 rounded-lg py-1 px-1 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 font-bold block">NEW YORK (EST)</span>
                <span className="text-[11px] font-mono font-bold text-neutral-200">
                  {usaTimings.bestEstTime.split(' ')[0]} {usaTimings.bestEstTime.split(' ')[1]}
                </span>
              </div>
              <div className="bg-neutral-900/90 rounded-lg py-1 px-1 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 font-bold block">CHICAGO (CST)</span>
                <span className="text-[11px] font-mono font-bold text-neutral-200">
                  {usaTimings.bestCstTime.split(' ')[0]} {usaTimings.bestCstTime.split(' ')[1]}
                </span>
              </div>
              <div className="bg-neutral-900/90 rounded-lg py-1 px-1 border border-neutral-800">
                <span className="text-[9px] text-neutral-500 font-bold block">LOS ANGELES (PST)</span>
                <span className="text-[11px] font-mono font-bold text-neutral-200">
                  {usaTimings.bestPstTime.split(' ')[0]} {usaTimings.bestPstTime.split(' ')[1]}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
              <span className="truncate pr-1">
                🎯 {usaTimings.targetDemographic}
              </span>
              {usaTimings.isPeakRightNow ? (
                <span className="text-emerald-400 font-bold shrink-0 animate-pulse">
                  ● Peak Live Now
                </span>
              ) : (
                <span className="text-amber-300 font-mono shrink-0">
                  Next peak in ~{Math.round(usaTimings.timeUntilOptimalMinutes / 60)}h
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search & Topic Prompt Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              id="input-agent-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchClips(searchQuery)}
              placeholder="e.g. GTA 6 crazy stunts, Valorant 1v5 Ace..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <button
            id="btn-agent-scout-clips"
            onClick={() => fetchClips(searchQuery)}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-purple-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scouting...' : 'Scout Web'}
          </button>
        </div>

        {/* Game Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
          {['All', 'GTA VI', 'Valorant', 'Elden Ring', 'Minecraft', 'Fortnite', 'Warzone'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                fetchClips(cat === 'All' ? '' : cat);
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Discovered Clips Feed */}
      <div className="p-4 space-y-4">
        {loading && clips.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-300 font-semibold">
              Scouting Twitch, YouTube Gaming & TikTok algorithms...
            </p>
            <p className="text-[11px] text-neutral-500">
              Detecting high-retention clutches and computing USA peak broadcast timing
            </p>
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
            <p className="text-xs">No gaming clips found for this query. Tap "Scout Web" to refresh.</p>
          </div>
        ) : (
          clips.map((clip) => {
            const isPlaying = playingClipId === clip.id;
            const isScheduled = scheduledClipId === clip.id;

            return (
              <div
                key={clip.id}
                id={`gaming-clip-card-${clip.id}`}
                className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/90 rounded-3xl p-4 shadow-xl space-y-3 transition-all"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      {clip.game}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      via {clip.streamer} ({clip.sourcePlatform})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    <span>Viral Score: {clip.viralScore}/100</span>
                  </div>
                </div>

                {/* Video Preview Player */}
                <div className="relative aspect-[16/9] w-full bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                  <video
                    src={clip.videoUrl}
                    poster={clip.thumbnailUrl}
                    className="h-full w-full object-contain"
                    playsInline
                    loop
                    controls={isPlaying}
                  />

                  {!isPlaying && (
                    <button
                      onClick={() => setPlayingClipId(clip.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </button>
                  )}

                  {/* Video duration pill */}
                  <div className="absolute bottom-2 left-2 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-sm text-[10px] font-mono px-2 py-0.5 rounded-full text-white">
                      AI Clip: {clip.clipStartSec}s – {clip.clipEndSec}s ({clip.clipEndSec - clip.clipStartSec}s total)
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 pointer-events-none">
                    <span className="bg-purple-600/80 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full text-white">
                      9:16 Shorts Ready
                    </span>
                  </div>
                </div>

                {/* Catchy Hook Title */}
                <div>
                  <h3 className="text-xs font-black text-neutral-100 leading-snug">
                    {clip.catchyTitle}
                  </h3>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed line-clamp-2">
                    {clip.viralCaption}
                  </p>
                </div>

                {/* AI Viral Intelligence Breakdown */}
                <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-[10px] space-y-1">
                  <div className="flex items-center gap-1 text-purple-300 font-semibold">
                    <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>Viral Retention Trigger:</span>
                  </div>
                  <p className="text-neutral-400 leading-snug">
                    {clip.hookSummary}
                  </p>
                </div>

                {/* USA Recommended Timing Badge */}
                <div className="flex items-center justify-between text-[10px] text-indigo-300 bg-indigo-950/20 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    USA Peak Window: <strong>{clip.usaTiming.bestEstTime}</strong>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {clip.usaTiming.reachMultiplier}
                  </span>
                </div>

                {/* Clip Action Buttons */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    id={`btn-open-trimmer-${clip.id}`}
                    onClick={() => setActiveTrimClip(clip)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl border border-neutral-700 transition-all cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-purple-400" />
                    Refine Clip & Captions
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Schedule for USA Peak */}
                    <button
                      id={`btn-schedule-peak-${clip.id}`}
                      onClick={() => handleScheduleForPeak(clip)}
                      disabled={isScheduled}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      {isScheduled ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Queued for USA Peak!
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5" /> Post at USA Peak
                        </>
                      )}
                    </button>

                    {/* Instant Broadcast */}
                    <button
                      id={`btn-instant-broadcast-${clip.id}`}
                      onClick={() => handleDirectBroadcast(clip)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      Post Now ({connectedPlatformIds.length})
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trimmer Modal */}
      {activeTrimClip && (
        <ClipTrimmerModal
          clip={activeTrimClip}
          isOpen={!!activeTrimClip}
          onClose={() => setActiveTrimClip(null)}
          onBroadcastInitiated={onNavigateToQueue}
        />
      )}
    </div>
  );
};
