import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Video, 
  Activity, 
  Share2,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useUploadQueue } from '../context/UploadQueueContext';
import { PlatformStatusCard } from './PlatformStatusCard';
import { soundService } from '../services/sound';

interface UploadQueueViewProps {
  onNavigateToCompose: () => void;
}

export const UploadQueueView: React.FC<UploadQueueViewProps> = ({ onNavigateToCompose }) => {
  const { 
    jobs, 
    isQueuePaused, 
    pauseQueue, 
    resumeQueue, 
    clearCompletedJobs, 
    cancelJob, 
    retryPlatform, 
    retryEntireJob,
    testErrorSimulation,
    setTestErrorSimulation
  } = useUploadQueue();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [copiedAllJobId, setCopiedAllJobId] = useState<string | null>(null);

  const filteredJobs = jobs.filter(job => {
    if (filter === 'active') {
      return job.overallStatus === 'queued' || job.overallStatus === 'uploading' || job.overallStatus === 'processing' || job.overallStatus === 'paused';
    }
    if (filter === 'completed') {
      return job.overallStatus === 'completed';
    }
    if (filter === 'failed') {
      return job.overallStatus === 'failed' || job.overallStatus === 'partially_failed';
    }
    return true;
  });

  const activeCount = jobs.filter(j => ['queued', 'uploading', 'processing', 'paused'].includes(j.overallStatus)).length;
  const completedCount = jobs.filter(j => j.overallStatus === 'completed').length;
  const failedCount = jobs.filter(j => ['failed', 'partially_failed'].includes(j.overallStatus)).length;

  const handleCopyAllLinks = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const links = Object.values(job.platformStatuses)
      .filter(s => s.publishedUrl)
      .map(s => `${s.platformId.toUpperCase()}: ${s.publishedUrl}`)
      .join('\n');

    if (links) {
      navigator.clipboard?.writeText(links);
      setCopiedAllJobId(jobId);
      soundService.playSuccess();
      setTimeout(() => setCopiedAllJobId(null), 2500);
    }
  };

  return (
    <div id="upload-queue-container" className="flex flex-col h-full overflow-y-auto pb-24">
      {/* Top Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                Upload Queue & Live Status
                {activeCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                )}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Tracking real-time parallel streams & platform pipelines
              </p>
            </div>
          </div>

          {/* Queue Global Actions */}
          <div className="flex items-center gap-1.5">
            {isQueuePaused ? (
              <button
                id="btn-resume-queue"
                onClick={resumeQueue}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                title="Resume Queue"
              >
                <Play className="w-3 h-3 fill-amber-300" /> Resume
              </button>
            ) : (
              <button
                id="btn-pause-queue"
                onClick={pauseQueue}
                disabled={activeCount === 0}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 px-2.5 py-1.5 rounded-xl border border-neutral-700 transition-all cursor-pointer"
                title="Pause Queue"
              >
                <Pause className="w-3 h-3" /> Pause
              </button>
            )}

            {completedCount > 0 && (
              <button
                id="btn-clear-completed"
                onClick={clearCompletedJobs}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                title="Clear completed uploads"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-neutral-400 font-medium block">Active</span>
            <span className="text-sm font-bold text-indigo-400">{activeCount}</span>
          </div>
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-neutral-400 font-medium block">Live Done</span>
            <span className="text-sm font-bold text-emerald-400">{completedCount}</span>
          </div>
          <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-2 text-center">
            <span className="text-[10px] text-neutral-400 font-medium block">Issues</span>
            <span className="text-sm font-bold text-rose-400">{failedCount}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex gap-1">
            {[
              { id: 'all', label: `All (${jobs.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
              { id: 'failed', label: `Failed (${failedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Test Error Simulation Toggle */}
          <button
            id="btn-toggle-error-sim"
            onClick={() => {
              setTestErrorSimulation(!testErrorSimulation);
              soundService.playTick();
            }}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              testErrorSimulation 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                : 'bg-neutral-800/50 text-neutral-400 border-neutral-700/60 hover:text-neutral-300'
            }`}
            title="Toggle to simulate network/API errors on upcoming uploads to test retry and alerts"
          >
            <Zap className={`w-3 h-3 ${testErrorSimulation ? 'text-rose-400 fill-rose-400' : ''}`} />
            {testErrorSimulation ? 'Error Mode: ON' : 'Test Errors'}
          </button>
        </div>

        {testErrorSimulation && (
          <div className="mt-2 bg-rose-950/30 border border-rose-900/50 rounded-lg p-2 text-[10px] text-rose-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>Error simulation enabled. New uploads will simulate API failure on select channels to demonstrate real-time alerts and retry.</span>
          </div>
        )}
      </div>

      {/* Main Jobs List */}
      <div className="p-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-neutral-900/40 rounded-3xl border border-neutral-800/60 my-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-500 mx-auto mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-200 mb-1">
              {filter === 'all' ? 'Queue is Empty' : `No ${filter} uploads found`}
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4">
              Select a video and broadcast to your connected social channels simultaneously with 1 click.
            </p>
            <button
              id="btn-empty-start-upload"
              onClick={onNavigateToCompose}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
            >
              Start 1-Click Upload <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          filteredJobs.map(job => {
            const hasFailed = job.overallStatus === 'failed' || job.overallStatus === 'partially_failed';
            const isFinished = job.overallStatus === 'completed';
            const isProcessing = job.overallStatus === 'uploading' || job.overallStatus === 'processing';

            return (
              <div
                key={job.id}
                id={`queue-job-card-${job.id}`}
                className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3.5 transition-all hover:border-neutral-700/80"
              >
                {/* Job Header */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail / Video icon */}
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/70 shrink-0 relative">
                    {job.video.thumbnailUrl ? (
                      <img
                        src={job.video.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[9px] font-mono px-1 rounded text-neutral-200">
                      {job.video.durationSeconds}s
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-semibold text-neutral-400">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {(job.video.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                      </span>

                      {/* Overall Status Badge */}
                      {job.overallStatus === 'queued' && (
                        <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                          Queued
                        </span>
                      )}
                      {job.overallStatus === 'uploading' && (
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                          <Activity className="w-3 h-3 animate-pulse" /> Uploading {job.overallProgress}%
                        </span>
                      )}
                      {job.overallStatus === 'processing' && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          Processing
                        </span>
                      )}
                      {job.overallStatus === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Published
                        </span>
                      )}
                      {hasFailed && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" /> Needs Attention
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-neutral-100 line-clamp-2 leading-snug">
                      {job.video.title}
                    </h4>

                    {/* Overall Progress bar */}
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isFinished 
                              ? 'bg-emerald-500' 
                              : hasFailed 
                                ? 'bg-rose-500' 
                                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                          }`}
                          style={{ width: `${job.overallProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{job.targetPlatforms.length} social platforms targeted</span>
                        {isProcessing && job.etaSeconds > 0 && (
                          <span className="text-indigo-400 font-mono">
                            ETA ~{job.etaSeconds}s
                          </span>
                        )}
                        {isFinished && (
                          <span className="text-emerald-400 font-semibold">
                            All channels live
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Real-Time Status Cards */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Platform Breakdown ({job.targetPlatforms.length})</span>
                    <span className="text-[10px] text-neutral-500">Live Status Tracking</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {job.targetPlatforms.map(platformId => {
                      const platStatus = job.platformStatuses[platformId];
                      if (!platStatus) return null;
                      return (
                        <PlatformStatusCard
                          key={platformId}
                          status={platStatus}
                          jobId={job.id}
                          onRetry={(plat) => retryPlatform(job.id, plat)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Job Action Footer */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <button
                    id={`btn-cancel-job-${job.id}`}
                    onClick={() => cancelJob(job.id)}
                    className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors p-1"
                  >
                    Remove from Queue
                  </button>

                  <div className="flex items-center gap-2">
                    {hasFailed && (
                      <button
                        id={`btn-retry-all-${job.id}`}
                        onClick={() => retryEntireJob(job.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-all cursor-pointer active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Failed Channels
                      </button>
                    )}

                    {isFinished && (
                      <button
                        id={`btn-copy-all-${job.id}`}
                        onClick={() => handleCopyAllLinks(job.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                      >
                        {copiedAllJobId === job.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied All Links!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy All Links
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
