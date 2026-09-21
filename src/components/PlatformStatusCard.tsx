import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Flame, 
  Share2, 
  Twitter, 
  Youtube, 
  Instagram, 
  Linkedin, 
  AtSign,
  AlertCircle
} from 'lucide-react';
import { PlatformUploadStatus, SocialPlatformId } from '../types';
import { PLATFORMS_CONFIG } from '../services/mockData';
import { soundService } from '../services/sound';

interface PlatformStatusCardProps {
  status: PlatformUploadStatus;
  jobId: string;
  onRetry: (platformId: SocialPlatformId) => void;
}

export const PlatformStatusCard: React.FC<PlatformStatusCardProps> = ({
  status,
  jobId,
  onRetry
}) => {
  const [copied, setCopied] = useState(false);
  const config = PLATFORMS_CONFIG[status.platformId];

  const getPlatformIcon = (id: SocialPlatformId) => {
    switch (id) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'tiktok':
        return <Flame className="w-4 h-4 text-cyan-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'x':
        return <Twitter className="w-4 h-4 text-neutral-200" />;
      case 'facebook':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-sky-500" />;
      case 'threads':
        return <AtSign className="w-4 h-4 text-zinc-300" />;
      default:
        return null;
    }
  };

  const handleCopyLink = () => {
    if (!status.publishedUrl) return;
    navigator.clipboard?.writeText(status.publishedUrl);
    setCopied(true);
    soundService.playTick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={`platform-status-${jobId}-${status.platformId}`}
      className={`rounded-2xl border p-3 transition-all ${
        status.state === 'failed' 
          ? 'bg-rose-950/20 border-rose-900/50' 
          : status.state === 'completed'
            ? 'bg-emerald-950/15 border-emerald-900/40'
            : status.state === 'uploading'
              ? 'bg-neutral-900/90 border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-sm'
              : status.state === 'processing'
                ? 'bg-neutral-900/90 border-amber-500/40 ring-1 ring-amber-500/20'
                : 'bg-neutral-900/60 border-neutral-800'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
            {getPlatformIcon(status.platformId)}
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-neutral-100 truncate">
              {config.formatName}
            </h5>
            <span className="text-[10px] text-neutral-400 block -mt-0.5">
              {config.recommendedAspect} • max {config.maxDurationSec}s
            </span>
          </div>
        </div>

        {/* State Badge */}
        <div className="shrink-0 flex items-center gap-1.5">
          {status.state === 'queued' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700">
              <Clock className="w-3 h-3" /> Queued
            </span>
          )}

          {status.state === 'uploading' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              {status.progress}%
            </span>
          )}

          {status.state === 'processing' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Processing
            </span>
          )}

          {status.state === 'completed' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live
            </span>
          )}

          {status.state === 'failed' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
              <XCircle className="w-3 h-3 text-rose-400" /> Failed
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (Visible during uploading and processing) */}
      {(status.state === 'uploading' || status.state === 'processing') && (
        <div className="space-y-1.5 my-2">
          <div className="w-full bg-neutral-800/90 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                status.state === 'processing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span className="truncate pr-2 font-mono">
              {status.stageText}
            </span>
            {status.speedMBs > 0 && status.state === 'uploading' && (
              <span className="font-mono text-indigo-300 shrink-0 font-medium">
                {status.speedMBs} MB/s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Success View with Direct Links */}
      {status.state === 'completed' && (
        <div className="mt-2 pt-2 border-t border-emerald-900/30 flex items-center justify-between gap-2">
          <div className="text-[10px] text-neutral-400 flex items-center gap-1 truncate font-mono">
            <span className="text-emerald-400 font-semibold">{status.postId}</span>
            <span>• 100% delivered</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id={`btn-copy-${jobId}-${status.platformId}`}
              onClick={handleCopyLink}
              title="Copy share link"
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Link'}
            </button>

            {status.publishedUrl && (
              <a
                id={`btn-view-${jobId}-${status.platformId}`}
                href={status.publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                View Post <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error View with Specific Platform Retry */}
      {status.state === 'failed' && (
        <div className="mt-2 pt-2 border-t border-rose-900/30 space-y-2">
          <div className="flex items-start gap-1.5 text-[11px] text-rose-300/90 leading-tight">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2">
              {status.errorMessage || 'Unknown social media API dispatch error'}
            </p>
          </div>

          <div className="flex items-center justify-end">
            <button
              id={`btn-retry-${jobId}-${status.platformId}`}
              onClick={() => onRetry(status.platformId)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3 h-3" /> Retry This Platform
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
