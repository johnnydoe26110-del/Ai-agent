import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Layers, 
  Zap, 
  Users, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Maximize2,
  Activity,
  Bot,
  Sparkles
} from 'lucide-react';
import { useUploadQueue } from '../context/UploadQueueContext';
import { AndroidNotificationBanner } from './AndroidNotificationBanner';
import { soundService } from '../services/sound';

export type AppNavTab = 'uploader' | 'agent' | 'queue' | 'accounts';

interface AndroidFrameProps {
  currentTab: AppNavTab;
  onTabChange: (tab: AppNavTab) => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onTabChange,
  children
}) => {
  const { 
    jobs, 
    notifications, 
    soundEnabled, 
    toggleSound 
  } = useUploadQueue();

  const [currentTime, setCurrentTime] = useState('9:41');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Keep Android clock in sync
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeUploadsCount = jobs.filter(j => 
    ['queued', 'uploading', 'processing'].includes(j.overallStatus)
  ).length;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start sm:p-4 md:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Device View Switcher for Developer / Preview Convenience */}
      <header className="w-full max-w-md sm:max-w-xl md:max-w-2xl flex items-center justify-between py-2 px-3 mb-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-200">Android Social Broadcaster</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-neutral-200 text-neutral-400 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Phone Frame Toggle */}
          <button
            id="btn-toggle-phone-frame"
            onClick={() => {
              setIsPhoneFrame(!isPhoneFrame);
              soundService.playTick();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-neutral-200 text-neutral-400 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3 h-3" /> Expand View
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-indigo-400" /> Phone Frame
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Android Phone Bezel or Fluid View */}
      <main className={`relative flex flex-col bg-neutral-950 transition-all duration-300 overflow-hidden ${
        isPhoneFrame
          ? 'w-full max-w-[430px] h-[92vh] max-h-[880px] rounded-[48px] border-[8px] border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-neutral-700/50'
          : 'w-full max-w-2xl h-[92vh] rounded-3xl border border-neutral-800 shadow-2xl'
      }`}>
        {/* Android Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-neutral-300 text-xs font-semibold shrink-0 select-none bg-neutral-950/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <span className="tracking-tight font-bold">{currentTime}</span>
            {activeUploadsCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/15 px-1.5 py-0.2 rounded-full">
                <Activity className="w-2.5 h-2.5 animate-spin" /> Uploading
              </span>
            )}
          </div>

          {/* Android Punch-hole Camera */}
          {isPhoneFrame && (
            <div className="w-4 h-4 rounded-full bg-black border-2 border-neutral-800/80 shadow-inner -ml-2" />
          )}

          <div className="flex items-center gap-2 text-neutral-400">
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">92%</span>
              <Battery className="w-4 h-4 fill-neutral-300 text-neutral-300" />
            </div>
          </div>
        </div>

        {/* Android Top App Bar */}
        <div className="h-14 px-4 border-b border-neutral-800/80 flex items-center justify-between shrink-0 bg-neutral-950/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h1 className="text-xs font-extrabold tracking-tight text-neutral-100 flex items-center gap-1.5">
                Multi-Cast Social
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/15 px-1.5 py-0.2 rounded">
                  AI Scout
                </span>
              </h1>
              <p className="text-[10px] text-neutral-400 leading-none">
                Simultaneous One-Click Broadcast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick AI Agent Tab Switch Button */}
            <button
              id="btn-header-agent-pill"
              onClick={() => {
                onTabChange('agent');
                soundService.playTick();
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentTab === 'agent'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Agent</span>
            </button>

            {/* Quick Queue Status Pill */}
            <button
              id="btn-header-queue-pill"
              onClick={() => {
                onTabChange('queue');
                soundService.playTick();
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeUploadsCount > 0
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Queue</span>
              {activeUploadsCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {activeUploadsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Android Notification Banner Container */}
        <AndroidNotificationBanner />

        {/* Main Content Viewport */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

        {/* Android Bottom Navigation Bar */}
        <nav aria-label="Bottom Navigation" className="h-16 px-2 border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-around shrink-0 z-30">
          {/* Tab 1: 1-Click Upload */}
          <button
            id="tab-btn-uploader"
            onClick={() => {
              onTabChange('uploader');
              soundService.playTick();
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'uploader'
                ? 'text-indigo-400 font-bold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              currentTab === 'uploader' ? 'bg-indigo-500/20' : ''
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[9px] leading-none">1-Click</span>
          </button>

          {/* Tab 2: AI Agent (Gaming Clips & USA Peak Timing) */}
          <button
            id="tab-btn-agent"
            onClick={() => {
              onTabChange('agent');
              soundService.playTick();
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative ${
              currentTab === 'agent'
                ? 'text-purple-400 font-bold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all relative ${
              currentTab === 'agent' ? 'bg-purple-500/25 shadow-sm shadow-purple-500/30' : ''
            }`}>
              <Bot className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </div>
            <span className="text-[9px] leading-none flex items-center gap-0.5">
              AI Agent
            </span>
          </button>

          {/* Tab 3: Upload Queue */}
          <button
            id="tab-btn-queue"
            onClick={() => {
              onTabChange('queue');
              soundService.playTick();
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer ${
              currentTab === 'queue'
                ? 'text-indigo-400 font-bold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all relative ${
              currentTab === 'queue' ? 'bg-indigo-500/20' : ''
            }`}>
              <Layers className="w-5 h-5" />
              {activeUploadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-md animate-bounce">
                  {activeUploadsCount}
                </span>
              )}
            </div>
            <span className="text-[9px] leading-none">Queue</span>
          </button>

          {/* Tab 4: Accounts */}
          <button
            id="tab-btn-accounts"
            onClick={() => {
              onTabChange('accounts');
              soundService.playTick();
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'accounts'
                ? 'text-indigo-400 font-bold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              currentTab === 'accounts' ? 'bg-indigo-500/20' : ''
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[9px] leading-none">Accounts</span>
          </button>
        </nav>

        {/* Android Gesture Navigation Pill at Bottom */}
        {isPhoneFrame && (
          <div className="h-4 bg-neutral-950 flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-neutral-700 rounded-full" />
          </div>
        )}
      </main>
    </div>
  );
};
