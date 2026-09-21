import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Flame, 
  Share2, 
  Twitter, 
  Youtube, 
  Instagram, 
  Linkedin, 
  AtSign, 
  Check, 
  Play, 
  Pause, 
  Camera, 
  Layers, 
  Zap, 
  Globe, 
  Lock, 
  EyeOff,
  Video as VideoIcon,
  HelpCircle,
  Plus
} from 'lucide-react';
import { SocialPlatformId, VideoMetadata } from '../types';
import { PLATFORMS_CONFIG, SAMPLE_VIDEOS } from '../services/mockData';
import { useUploadQueue } from '../context/UploadQueueContext';
import { CaptionGeneratorModal } from './CaptionGeneratorModal';
import { CaptionSuggestion } from '../../server/gemini';
import { soundService } from '../services/sound';

interface OneClickUploaderProps {
  onUploadStarted: () => void;
  onNavigateToAgent?: () => void;
}

export const OneClickUploader: React.FC<OneClickUploaderProps> = ({ 
  onUploadStarted,
  onNavigateToAgent 
}) => {
  const { enqueueJob, accounts } = useUploadQueue();

  // Selected Video State
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata>(SAMPLE_VIDEOS[0]);
  const [customFileLoaded, setCustomFileLoaded] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(SAMPLE_VIDEOS[0].title);
  const [description, setDescription] = useState(SAMPLE_VIDEOS[0].description);
  const [tags, setTags] = useState<string[]>(SAMPLE_VIDEOS[0].tags);
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');

  // Platforms Selection
  const connectedPlatformIds = accounts
    .filter(a => a.isConnected)
    .map(a => a.platformId);

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>(connectedPlatformIds);

  // Video preview player state
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Caption Generator Modal
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle single platform
  const togglePlatform = (id: SocialPlatformId) => {
    soundService.playTick();
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    soundService.playTick();
    if (selectedPlatforms.length === connectedPlatformIds.length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms([...connectedPlatformIds]);
    }
  };

  // Handle local file upload
  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, WebM, MOV)');
      return;
    }

    soundService.playStart();
    const objectUrl = URL.createObjectURL(file);
    const newVideoMeta: VideoMetadata = {
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      description: 'Uploaded directly from device storage. Multi-platform broadcast ready.',
      tags: ['shorts', 'reels', 'viral', 'creator'],
      privacy: 'public',
      aspectRatio: '9:16 (Auto-detected)',
      durationSeconds: 30,
      fileSizeBytes: file.size,
      fileName: file.name,
      previewUrl: objectUrl
    };

    setSelectedVideo(newVideoMeta);
    setTitle(newVideoMeta.title);
    setDescription(newVideoMeta.description);
    setTags(newVideoMeta.tags);
    setCustomFileLoaded(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyAiCaption = (suggestion: CaptionSuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.caption);
    setTags(suggestion.hashtags);
  };

  const handleAddTag = (newTag: string) => {
    const clean = newTag.replace('#', '').trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      soundService.playTick();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    soundService.playTick();
  };

  // 1-Click Launch Upload
  const handleInitiateUpload = () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social media platform.');
      return;
    }

    const payload: VideoMetadata = {
      ...selectedVideo,
      title: title.trim() || selectedVideo.title,
      description: description.trim(),
      tags,
      privacy
    };

    enqueueJob(payload, selectedPlatforms);
    onUploadStarted();
  };

  const getPlatformIcon = (id: SocialPlatformId) => {
    switch (id) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'tiktok': return <Flame className="w-4 h-4 text-cyan-400" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'x': return <Twitter className="w-4 h-4 text-neutral-200" />;
      case 'facebook': return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'linkedin': return <Linkedin className="w-4 h-4 text-sky-500" />;
      case 'threads': return <AtSign className="w-4 h-4 text-zinc-300" />;
      default: return null;
    }
  };

  return (
    <div id="one-click-uploader" className="flex flex-col h-full overflow-y-auto pb-28">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Hero Quick Start Banner */}
      <div className="p-4 border-b border-neutral-800 bg-gradient-to-b from-indigo-950/40 via-neutral-900/40 to-neutral-900/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
              Simultaneous Multi-Channel Broadcast
            </span>
          </div>
          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            1-Click Ready
          </span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Upload once, and let the parallel queue transcode & publish to all your social platforms simultaneously.
        </p>

        {/* AI Gaming Agent Callout Banner */}
        {onNavigateToAgent && (
          <div 
            id="banner-ai-gaming-agent"
            onClick={() => {
              soundService.playTick();
              onNavigateToAgent();
            }}
            className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-neutral-900 border border-purple-500/40 flex items-center justify-between gap-2.5 cursor-pointer hover:border-purple-400 transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-neutral-100 flex items-center gap-1.5">
                  AI Gaming Agent Mode
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
                    USA Peak Viral
                  </span>
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Find web gaming clips, auto-clip 9:16 & post at peak US times
                </p>
              </div>
            </div>
            <button
              className="text-[10px] font-bold text-white bg-purple-600 hover:bg-purple-500 px-2.5 py-1 rounded-lg shrink-0 shadow-sm"
            >
              Open Scout
            </button>
          </div>
        )}

        {/* Preloaded Sample Videos Selector */}
        <div className="mt-3 pt-3 border-t border-neutral-800/80">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
            ⚡ Quick Test Samples (Or drop your own file):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {SAMPLE_VIDEOS.map((sample, idx) => {
              const isChosen = selectedVideo.fileName === sample.fileName && !customFileLoaded;
              return (
                <button
                  key={idx}
                  id={`btn-sample-video-${idx}`}
                  onClick={() => {
                    setSelectedVideo(sample);
                    setTitle(sample.title);
                    setDescription(sample.description);
                    setTags(sample.tags);
                    setCustomFileLoaded(false);
                    soundService.playTick();
                  }}
                  className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isChosen
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/30'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{sample.title}</div>
                  <div className="text-[9px] text-neutral-500 mt-0.5 font-mono">
                    {sample.durationSeconds}s • {(sample.fileSizeBytes / 1024 / 1024).toFixed(0)}MB
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-4 space-y-4">
        {/* Video Preview & File Drop Area */}
        <div
          id="video-drop-area"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 transition-all overflow-hidden bg-neutral-900/90 shadow-xl ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-950/30 scale-[0.99]' 
              : 'border-neutral-800 hover:border-neutral-700'
          }`}
        >
          {/* Vertical Video Player Frame (9:16 preview container) */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={selectedVideo.previewUrl}
              poster={selectedVideo.thumbnailUrl}
              className="h-full w-full object-contain"
              playsInline
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Play/Pause Overlay */}
            <button
              id="btn-play-pause-video"
              onClick={() => {
                if (videoRef.current) {
                  if (isPlaying) {
                    videoRef.current.pause();
                  } else {
                    videoRef.current.play();
                  }
                }
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
              </div>
            </button>

            {/* Video spec pills */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/80 text-[10px] font-semibold text-neutral-200 px-2 py-0.5 rounded-full">
                9:16 Vertical
              </span>
              <span className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/80 text-[10px] font-mono text-neutral-200 px-2 py-0.5 rounded-full">
                {selectedVideo.durationSeconds}s
              </span>
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              <button
                id="btn-change-video-file"
                onClick={() => fileInputRef.current?.click()}
                className="bg-neutral-900/85 backdrop-blur-sm border border-neutral-700 hover:border-neutral-500 text-[10px] font-semibold text-neutral-200 hover:text-white px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-lg"
              >
                <Upload className="w-3 h-3" /> Change File
              </button>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="truncate pr-2">
              <span className="text-neutral-200 font-medium">{selectedVideo.fileName}</span>
              <span className="text-neutral-500 text-[10px] ml-1.5 font-mono">
                {(selectedVideo.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-400 hover:text-indigo-300 font-semibold shrink-0 cursor-pointer"
            >
              Browse device...
            </button>
          </div>
        </div>

        {/* Catchy Captions & Title Section */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-neutral-200">
              Video Title & Hook
            </label>

            {/* Suggest Catchy Captions Button */}
            <button
              id="btn-open-ai-captions"
              onClick={() => {
                soundService.playTick();
                setIsCaptionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Suggest Catchy Captions
            </button>
          </div>

          <div>
            <input
              id="input-video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Irresistible 3-second hook or title..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500/60 rounded-2xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none transition-colors"
            />
            <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1 px-1">
              <span>Optimized for Shorts & Reels algorithms</span>
              <span className={title.length > 90 ? 'text-amber-400' : ''}>
                {title.length}/100 chars
              </span>
            </div>
          </div>

          {/* Description / Caption */}
          <div>
            <label className="block text-xs font-bold text-neutral-200 mb-1">
              Description / Caption
            </label>
            <textarea
              id="textarea-video-caption"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add your caption, call to action, or context..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500/60 rounded-2xl p-3 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Tags & Hashtags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-neutral-200">
                Hashtags & Keywords
              </span>
              <span className="text-[10px] text-neutral-500">Tap to remove</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-indigo-500/25 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  #{tag} <span className="text-[9px] opacity-60">×</span>
                </button>
              ))}
            </div>

            {/* Quick Suggested Tags */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] text-neutral-500 shrink-0">Quick add:</span>
              {['viral', 'trending', 'algorithm', 'tech', 'productivity', 'shorts', 'reels'].map(suggested => {
                if (tags.includes(suggested)) return null;
                return (
                  <button
                    key={suggested}
                    onClick={() => handleAddTag(suggested)}
                    className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 px-2 py-0.5 rounded-md shrink-0 transition-colors cursor-pointer"
                  >
                    + #{suggested}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Dropdown */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">Default Visibility</span>
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              {[
                { id: 'public', label: 'Public', icon: Globe },
                { id: 'unlisted', label: 'Unlisted', icon: EyeOff },
                { id: 'private', label: 'Private', icon: Lock }
              ].map(opt => {
                const Icon = opt.icon;
                const isCur = privacy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPrivacy(opt.id as typeof privacy);
                      soundService.playTick();
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      isCur
                        ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Multi-Platform Channel Selector */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                Target Social Channels
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-500/30">
                  {selectedPlatforms.length}/{connectedPlatformIds.length}
                </span>
              </h3>
              <p className="text-[10px] text-neutral-400">
                Uploaded simultaneously using platform-optimized transcoding
              </p>
            </div>

            <button
              id="btn-toggle-select-all"
              onClick={toggleSelectAll}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/30 transition-all cursor-pointer"
            >
              {selectedPlatforms.length === connectedPlatformIds.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Grid of Platform Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {connectedPlatformIds.map(platId => {
              const config = PLATFORMS_CONFIG[platId];
              const isSelected = selectedPlatforms.includes(platId);
              const account = accounts.find(a => a.platformId === platId);

              return (
                <div
                  key={platId}
                  id={`platform-selector-${platId}`}
                  onClick={() => togglePlatform(platId)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-neutral-900 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-md'
                      : 'bg-neutral-950/60 border-neutral-800/80 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                      {getPlatformIcon(platId)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-100 truncate">
                        {config.formatName}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                        <span>{account ? `@${account.username}` : config.handlePrefix}</span>
                        {account && (
                          <span className="text-neutral-500">• {account.followerCount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-neutral-700 bg-neutral-900'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRIMARY 1-CLICK UPLOAD BUTTON */}
        <div className="pt-2">
          <button
            id="btn-simultaneous-broadcast"
            onClick={handleInitiateUpload}
            disabled={selectedPlatforms.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Zap className="w-5 h-5 fill-white animate-pulse" />
            Broadcast to {selectedPlatforms.length} Channels with 1 Click
          </button>
          <p className="text-[11px] text-center text-neutral-500 mt-2">
            Will automatically add to the active upload queue and stream simultaneously.
          </p>
        </div>
      </div>

      {/* Catchy Captions AI Modal */}
      <CaptionGeneratorModal
        isOpen={isCaptionModalOpen}
        onClose={() => setIsCaptionModalOpen(false)}
        currentTitle={title}
        onApplyCaption={handleApplyAiCaption}
        selectedPlatforms={selectedPlatforms}
      />
    </div>
  );
};
