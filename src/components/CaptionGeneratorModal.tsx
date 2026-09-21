import React, { useState } from 'react';
import { Sparkles, X, Check, RefreshCw, Hash, ArrowRight, Lightbulb } from 'lucide-react';
import { CaptionSuggestion } from '../../server/gemini';
import { soundService } from '../services/sound';

interface CaptionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onApplyCaption: (suggestion: CaptionSuggestion) => void;
  selectedPlatforms: string[];
}

export const CaptionGeneratorModal: React.FC<CaptionGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentTitle,
  onApplyCaption,
  selectedPlatforms
}) => {
  const [topic, setTopic] = useState(currentTitle || '5 AI Tools Every Creator Needs in 2026');
  const [tone, setTone] = useState<'viral' | 'punchy' | 'professional' | 'storytelling'>('viral');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CaptionSuggestion[]>([]);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const fetchCaptions = async () => {
    soundService.playTick();
    setLoading(true);
    setAppliedId(null);
    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Exciting short video',
          tone,
          platforms: selectedPlatforms
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        soundService.playSuccess();
      }
    } catch (err) {
      console.error('Caption suggestion error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when opened if empty
  React.useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchCaptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      id="caption-generator-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                Catchy Caption & Hook Generator
                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Optimized for high retention on Shorts, Reels & TikTok
              </p>
            </div>
          </div>
          <button
            id="btn-close-caption-modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
              Video Topic / Core Hook
            </label>
            <div className="flex gap-2">
              <input
                id="input-caption-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. My morning productivity routine..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
              <button
                id="btn-regenerate-captions"
                onClick={fetchCaptions}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all shrink-0 cursor-pointer shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Crafting...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <span className="text-[11px] text-neutral-400 font-medium block mb-1.5">
              Hook Style / Vibe:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'viral', label: '🔥 Viral' },
                { id: 'punchy', label: '⚡ Punchy' },
                { id: 'professional', label: '💼 Insights' },
                { id: 'storytelling', label: '📖 Story' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id as typeof tone)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer ${
                    tone === t.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-300 font-medium">
                Analyzing viral patterns for {selectedPlatforms.length} platforms...
              </p>
              <p className="text-[11px] text-neutral-500">
                Generating click-worthy titles, retention hooks & hashtags
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-10 text-center text-neutral-500">
              <Lightbulb className="w-7 h-7 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-xs">Type a topic and tap Generate to create catchy captions</p>
            </div>
          ) : (
            suggestions.map(sug => {
              const isApplied = appliedId === sug.id;
              return (
                <div
                  key={sug.id}
                  id={`suggestion-card-${sug.id}`}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isApplied
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Hook reason pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {sug.tone}
                    </span>
                    <span className="text-[10px] text-neutral-400 italic">
                      💡 {sug.hookReason}
                    </span>
                  </div>

                  {/* Title Hook */}
                  <h4 className="text-xs font-bold text-neutral-100 leading-snug mb-1.5">
                    {sug.title}
                  </h4>

                  {/* Caption Body */}
                  <p className="text-[11px] text-neutral-300 leading-relaxed mb-2.5">
                    {sug.caption}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {sug.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Apply Button */}
                  <button
                    id={`btn-apply-caption-${sug.id}`}
                    onClick={() => {
                      setAppliedId(sug.id);
                      soundService.playSuccess();
                      onApplyCaption(sug);
                      setTimeout(() => {
                        onClose();
                      }, 400);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" /> Applied to Video!
                      </>
                    ) : (
                      <>
                        Apply This Hook & Caption <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
