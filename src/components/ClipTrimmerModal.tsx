import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Scissors, 
  Clock, 
  Zap, 
  Sparkles, 
  Check, 
  Volume2, 
  TrendingUp,
  Globe
} from 'lucide-react';
import { GamingClip, SocialPlatformId, VideoMetadata } from '../types';
import { useUploadQueue } from '../context/UploadQueueContext';
import { soundService } from '../services/sound';

interface ClipTrimmerModalProps {
  clip: GamingClip;
  isOpen: boolean;
  onClose: () => void;
  onBroadcastInitiated: () => void;
}

export const ClipTrimmerModal: React.FC<ClipTrimmerModalProps> = ({
  clip,
  isOpen,
  onClose,
  onBroadcastInitiated
}) => {
  const { enqueueJob, accounts } = useUploadQueue();
  const [isPlaying, setIsPlaying] = useState(false);
  const [startSec, setStartSec] = useState(clip.clipStartSec);
  const [endSec, setEndSec] = useState(clip.clipEndSec);
  const [title, setTitle] = useState(clip.catchyTitle);
  const [caption, setCaption] = useState(clip.viralCaption);
  const [subtitleStyle, setSubtitleStyle] = useState<'yellow' | 'cyan' | 'white'>('yellow');
  const [scheduleForPeak, setScheduleForPeak] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const clipDuration = Math.max(5, endSec - startSec);
  const connectedPlatformIds = accounts.filter(a => a.isConnected).map(a => a.platformId);

  const handleLaunch = () => {
    soundService.playStart();
    const videoMeta: VideoMetadata = {
      title,
      description: caption,
      tags: clip.hashtags,
      privacy: 'public',
      aspectRatio: '9:16 (Auto-Framed Gaming Short)',
      durationSeconds: clipDuration,
      fileSizeBytes: Math.floor(clipDuration * 750000), // ~20-30MB
      fileName: `${clip.game.toLowerCase().replace(/[^a-z0-9]/g, '_')}_viral_clip.mp4`,
      previewUrl: clip.videoUrl,
      thumbnailUrl: clip.thumbnailUrl
    };

    enqueueJob(videoMeta, connectedPlatformIds);
    onBroadcastInitiated();
    onClose();
  };

  return (
    <div 
      id="clip-trimmer-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-neutral-100 flex items-center gap-1.5">
                AI Smart Clipper & 9:16 Vertical Reframer
              </h3>
              <p className="text-[10px] text-neutral-400">
                {clip.game} • {clip.streamer} ({clip.sourcePlatform})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 9:16 Video Preview Frame */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
            <video
              ref={videoRef}
              src={clip.videoUrl}
              poster={clip.thumbnailUrl}
              className="h-full w-full object-contain"
              playsInline
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Simulated Animated Viral Hook Subtitles */}
            <div className="absolute top-4 left-3 right-3 flex justify-center pointer-events-none">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xl backdrop-blur-sm border ${
                subtitleStyle === 'yellow'
                  ? 'bg-amber-400 text-neutral-950 border-amber-300'
                  : subtitleStyle === 'cyan'
                    ? 'bg-cyan-400 text-neutral-950 border-cyan-300'
                    : 'bg-white text-neutral-950 border-neutral-200'
              }`}>
                {clip.game.toUpperCase()} • VIRAL MOMENT 🔥
              </span>
            </div>

            {/* Play/Pause Control */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) videoRef.current.pause();
                  else videoRef.current.play();
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 flex items-center justify-center text-white shadow-xl">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
              </div>
            </button>

            {/* Timing Pills */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 pointer-events-none">
              <span className="bg-black/80 text-[10px] font-mono px-2 py-0.5 rounded-full text-white">
                Clip: {startSec}s – {endSec}s ({clipDuration}s)
              </span>
              <span className="bg-purple-500/80 text-[10px] font-bold px-2 py-0.5 rounded-full text-white">
                9:16 Shorts
              </span>
            </div>
          </div>

          {/* Trimmer Range Controls */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
              <span className="flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5 text-purple-400" />
                Trim Timestamps (AI Hype Window Detected)
              </span>
              <span className="font-mono text-purple-300">{clipDuration}s Duration</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Clip Start Time</label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, endSec - 5)}
                  value={startSec}
                  onChange={(e) => setStartSec(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-[10px] font-mono text-neutral-400">{startSec}s</span>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Clip End Time</label>
                <input
                  type="range"
                  min={startSec + 5}
                  max={clip.durationSeconds}
                  value={endSec}
                  onChange={(e) => setEndSec(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-[10px] font-mono text-neutral-400">{endSec}s</span>
              </div>
            </div>
          </div>

          {/* Catchy Hook Title & Caption */}
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Viral Hook Title (Generated for US Engagement)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Caption & High-Retention CTA
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          </div>

          {/* USA Peak Timing Summary Box */}
          <div className="bg-gradient-to-r from-blue-950/30 via-indigo-950/30 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                USA Algorithmic Timing
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {clip.usaTiming.reachMultiplier}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Optimal prime time: <strong>{clip.usaTiming.bestEstTime}</strong> / <strong>{clip.usaTiming.bestPstTime}</strong>
            </p>
            <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-1">
              <TrendingUp className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Target: {clip.usaTiming.targetDemographic}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/90 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-2"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-clip-and-upload"
            onClick={handleLaunch}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            Clip & Post to All Channels ({connectedPlatformIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};
