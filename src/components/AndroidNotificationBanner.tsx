import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, X, ExternalLink, RefreshCw } from 'lucide-react';
import { useUploadQueue } from '../context/UploadQueueContext';
import { PLATFORMS_CONFIG } from '../services/mockData';

export const AndroidNotificationBanner: React.FC = () => {
  const { 
    headsUpNotification, 
    dismissHeadsUp, 
    notifications, 
    clearAllNotifications,
    markNotificationRead,
    retryPlatform,
    setActiveJobId 
  } = useUploadQueue();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Floating Android Heads-Up Notification Banner */}
      {headsUpNotification && (
        <div 
          id="android-heads-up-banner"
          className="absolute top-12 left-3 right-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 shadow-2xl rounded-2xl p-3.5 text-neutral-100 flex items-start gap-3">
            <div className="mt-0.5">
              {getIcon(headsUpNotification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Social Broadcaster • Just now
                </span>
                <button
                  id="btn-dismiss-headsup"
                  onClick={dismissHeadsUp}
                  className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-neutral-100 truncate">
                {headsUpNotification.title}
              </h4>
              <p className="text-[11px] text-neutral-300 leading-snug mt-0.5 line-clamp-2">
                {headsUpNotification.message}
              </p>

              {/* Action Buttons inside notification */}
              <div className="flex items-center gap-2 mt-2">
                {headsUpNotification.jobId && (
                  <button
                    id="btn-headsup-view-queue"
                    onClick={() => {
                      if (headsUpNotification.jobId) {
                        setActiveJobId(headsUpNotification.jobId);
                      }
                      dismissHeadsUp();
                    }}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    View in Queue
                  </button>
                )}
                {headsUpNotification.platformId && headsUpNotification.jobId && headsUpNotification.type === 'error' && (
                  <button
                    id="btn-headsup-retry"
                    onClick={() => {
                      if (headsUpNotification.jobId && headsUpNotification.platformId) {
                        retryPlatform(headsUpNotification.jobId, headsUpNotification.platformId);
                      }
                      dismissHeadsUp();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-0.5 bg-rose-500/15 rounded-md border border-rose-500/30"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Platform
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Drawer Modal */}
      {isDrawerOpen && (
        <div 
          id="android-notification-drawer"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 animate-in fade-in"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden mt-10">
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-neutral-100">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    id="btn-clear-all-notifs"
                    onClick={clearAllNotifications}
                    className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  id="btn-close-notif-drawer"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No notifications yet</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    Upload progress updates and alerts will show here
                  </p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    id={`notif-card-${notif.id}`}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      notif.read 
                        ? 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300' 
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.jobId && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notif.jobId) {
                                  setActiveJobId(notif.jobId);
                                  setIsDrawerOpen(false);
                                }
                              }}
                              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                            >
                              Open Job <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                            {notif.platformId && notif.type === 'error' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notif.jobId && notif.platformId) {
                                    retryPlatform(notif.jobId, notif.platformId);
                                  }
                                }}
                                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                              >
                                <RefreshCw className="w-2.5 h-2.5" /> Retry {PLATFORMS_CONFIG[notif.platformId]?.name}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
