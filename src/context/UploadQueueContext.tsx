import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  SocialPlatformId, 
  UploadJob, 
  PlatformUploadStatus, 
  JobOverallStatus, 
  VideoMetadata, 
  AppNotification,
  ConnectedAccount
} from '../types';
import { INITIAL_ACCOUNTS, MOCK_POTENTIAL_ERRORS, PLATFORMS_CONFIG } from '../services/mockData';
import { soundService } from '../services/sound';

interface UploadQueueContextType {
  jobs: UploadJob[];
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
  isQueuePaused: boolean;
  testErrorSimulation: boolean;
  setTestErrorSimulation: (enabled: boolean) => void;
  notifications: AppNotification[];
  headsUpNotification: AppNotification | null;
  accounts: ConnectedAccount[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  enqueueJob: (video: VideoMetadata, targetPlatforms: SocialPlatformId[]) => string;
  retryPlatform: (jobId: string, platformId: SocialPlatformId) => void;
  retryEntireJob: (jobId: string) => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  cancelJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  dismissHeadsUp: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  toggleAccountConnection: (platformId: SocialPlatformId) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

const UploadQueueContext = createContext<UploadQueueContextType | undefined>(undefined);

const STORAGE_KEY_JOBS = 'simult_social_uploader_jobs_v1';
const STORAGE_KEY_ACCOUNTS = 'simult_social_uploader_accounts_v1';

export const UploadQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [jobs, setJobs] = useState<UploadJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JOBS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isQueuePaused, setIsQueuePaused] = useState(false);
  const [testErrorSimulation, setTestErrorSimulation] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [headsUpNotification, setHeadsUpNotification] = useState<AppNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Active timers / intervals mapped by `${jobId}_${platformId}`
  const activeSimulations = useRef<Record<string, number>>({});

  // Sync state to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [jobs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }, [accounts]);

  // Request browser Notification API permission if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setHeadsUpNotification(newNotification);

    // Audio & Haptic response
    if (notification.type === 'success') {
      soundService.playSuccess();
    } else if (notification.type === 'error' || notification.type === 'warning') {
      soundService.playError();
    }

    // System browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      } catch {
        // ignore
      }
    }

    // Auto-dismiss heads-up banner after 6 seconds
    setTimeout(() => {
      setHeadsUpNotification(current => current?.id === newNotification.id ? null : current);
    }, 6000);
  }, []);

  const dismissHeadsUp = useCallback(() => {
    setHeadsUpNotification(null);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setHeadsUpNotification(null);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundService.setSoundEnabled(next);
      return next;
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled(prev => {
      const next = !prev;
      soundService.setHapticsEnabled(next);
      return next;
    });
  }, []);

  const toggleAccountConnection = useCallback((platformId: SocialPlatformId) => {
    soundService.playTick();
    setAccounts(prev => prev.map(acc => {
      if (acc.platformId === platformId) {
        const nextState = !acc.isConnected;
        addNotification({
          type: nextState ? 'info' : 'warning',
          title: `${PLATFORMS_CONFIG[platformId].name} Account`,
          message: nextState ? `Connected as ${acc.username}` : `Disconnected from ${acc.username}`,
          platformId
        });
        return { ...acc, isConnected: nextState };
      }
      return acc;
    }));
  }, [addNotification]);

  // Simulate platform upload lifecycle
  const runPlatformUpload = useCallback((
    jobId: string, 
    platformId: SocialPlatformId, 
    totalBytes: number,
    shouldSimulateFailure: boolean
  ) => {
    const key = `${jobId}_${platformId}`;
    if (activeSimulations.current[key]) {
      window.clearInterval(activeSimulations.current[key]);
    }

    // Step 1: Initializing
    setJobs(prevJobs => prevJobs.map(j => {
      if (j.id !== jobId) return j;
      const existing = j.platformStatuses[platformId];
      return {
        ...j,
        platformStatuses: {
          ...j.platformStatuses,
          [platformId]: {
            ...existing,
            state: 'uploading',
            progress: 2,
            stageText: 'Handshaking & initializing chunk session...',
            startedAt: Date.now(),
            errorMessage: undefined
          }
        }
      };
    }));

    let currentProgress = 2;
    const intervalTime = 250 + Math.floor(Math.random() * 150); // slight variance

    const timerId = window.setInterval(() => {
      // Check if paused
      if (isQueuePaused) return;

      currentProgress += 3 + Math.floor(Math.random() * 7);

      if (currentProgress < 85) {
        // Uploading stage
        const speedMBs = +(3.5 + Math.random() * 4.8).toFixed(1);
        const uploadedBytes = Math.min(totalBytes, Math.floor((currentProgress / 100) * totalBytes));
        const chunkNum = Math.ceil((currentProgress / 100) * 8);

        setJobs(prev => prev.map(job => {
          if (job.id !== jobId) return job;
          const plat = job.platformStatuses[platformId];
          if (!plat || plat.state === 'failed') return job;

          return {
            ...job,
            platformStatuses: {
              ...job.platformStatuses,
              [platformId]: {
                ...plat,
                state: 'uploading',
                progress: currentProgress,
                bytesUploaded: uploadedBytes,
                speedMBs,
                stageText: `Uploading chunk ${chunkNum}/8 (${(uploadedBytes / 1024 / 1024).toFixed(1)} MB)`
              }
            }
          };
        }));
      } else if (currentProgress < 100) {
        // Processing stage
        const processingStages = [
          'Transcoding vertical 1080x1920 (H.264)',
          'Verifying audio copyright & Content ID',
          'Generating 9:16 preview thumbnails',
          'Finalizing social container & tags'
        ];
        const stageIndex = Math.floor(((currentProgress - 85) / 15) * processingStages.length);
        const stageText = processingStages[Math.min(stageIndex, processingStages.length - 1)];

        setJobs(prev => prev.map(job => {
          if (job.id !== jobId) return job;
          const plat = job.platformStatuses[platformId];
          if (!plat) return job;

          return {
            ...job,
            platformStatuses: {
              ...job.platformStatuses,
              [platformId]: {
                ...plat,
                state: 'processing',
                progress: currentProgress,
                bytesUploaded: totalBytes,
                stageText
              }
            }
          };
        }));
      } else {
        // Completed or Failed
        window.clearInterval(timerId);
        delete activeSimulations.current[key];

        if (shouldSimulateFailure) {
          const errorsList = MOCK_POTENTIAL_ERRORS[platformId] || ['Upload connection reset by peer (504 Gateway Timeout)'];
          const randomErr = errorsList[Math.floor(Math.random() * errorsList.length)];

          setJobs(prev => prev.map(job => {
            if (job.id !== jobId) return job;
            const plat = job.platformStatuses[platformId];
            return {
              ...job,
              platformStatuses: {
                ...job.platformStatuses,
                [platformId]: {
                  ...plat,
                  state: 'failed',
                  progress: 88,
                  stageText: 'Upload rejected by API',
                  errorMessage: randomErr,
                  errorCode: 'ERR_UPLOAD_FAIL'
                }
              }
            };
          }));

          addNotification({
            type: 'error',
            title: `${PLATFORMS_CONFIG[platformId].formatName} Failed`,
            message: randomErr,
            jobId,
            platformId,
            actionLabel: 'Retry'
          });
        } else {
          // Success!
          const randomHash = Math.random().toString(36).substring(2, 10);
          const urls: Record<SocialPlatformId, string> = {
            youtube: `https://youtube.com/shorts/${randomHash}`,
            tiktok: `https://tiktok.com/@alex_rivers/video/73948190${Math.floor(Math.random()*900+100)}`,
            instagram: `https://instagram.com/reel/${randomHash.toUpperCase()}/`,
            x: `https://x.com/alexrivers_tech/status/183920192837${Math.floor(Math.random()*90+10)}`,
            facebook: `https://facebook.com/reel/${randomHash}`,
            linkedin: `https://linkedin.com/feed/update/urn:li:ugcPost:719827361${Math.floor(Math.random()*900+100)}`,
            threads: `https://threads.net/@alexrivers.reels/post/${randomHash}`
          };

          setJobs(prev => prev.map(job => {
            if (job.id !== jobId) return job;
            const plat = job.platformStatuses[platformId];
            return {
              ...job,
              platformStatuses: {
                ...job.platformStatuses,
                [platformId]: {
                  ...plat,
                  state: 'completed',
                  progress: 100,
                  stageText: 'Published & Live on platform',
                  publishedUrl: urls[platformId],
                  postId: 'POST_' + randomHash.toUpperCase(),
                  completedAt: Date.now()
                }
              }
            };
          }));

          // Increment daily quota for account
          setAccounts(prev => prev.map(acc => {
            if (acc.platformId === platformId) {
              return {
                ...acc,
                dailyQuotaUsed: Math.min(acc.dailyQuotaMax, acc.dailyQuotaUsed + 1)
              };
            }
            return acc;
          }));
        }
      }
    }, intervalTime);

    activeSimulations.current[key] = timerId;
  }, [isQueuePaused, addNotification]);

  // Recalculate overall job status whenever individual platform statuses update
  useEffect(() => {
    setJobs(prevJobs => prevJobs.map(job => {
      const statuses = Object.values(job.platformStatuses);
      if (statuses.length === 0) return job;

      const totalProgress = statuses.reduce((sum, s) => sum + s.progress, 0);
      const overallProgress = Math.round(totalProgress / statuses.length);

      const allCompleted = statuses.every(s => s.state === 'completed');
      const allDoneOrFailed = statuses.every(s => s.state === 'completed' || s.state === 'failed');
      const anyUploading = statuses.some(s => s.state === 'uploading');
      const anyProcessing = statuses.some(s => s.state === 'processing');
      const anyFailed = statuses.some(s => s.state === 'failed');

      let newStatus: JobOverallStatus = job.overallStatus;

      if (allCompleted) {
        newStatus = 'completed';
      } else if (allDoneOrFailed && anyFailed) {
        const anySucceeded = statuses.some(s => s.state === 'completed');
        newStatus = anySucceeded ? 'partially_failed' : 'failed';
      } else if (anyProcessing) {
        newStatus = 'processing';
      } else if (anyUploading) {
        newStatus = 'uploading';
      }

      // Calculate aggregated speed and eta
      const activeSpeeds = statuses.filter(s => s.state === 'uploading').map(s => s.speedMBs || 0);
      const totalSpeed = activeSpeeds.reduce((a, b) => a + b, 0);
      const remainingProgress = 100 - overallProgress;
      const etaSeconds = totalSpeed > 0 ? Math.max(1, Math.round((remainingProgress / 100) * 12)) : 0;

      // Trigger completion notification if transitioned to completed
      if (job.overallStatus !== 'completed' && newStatus === 'completed') {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          addNotification({
            type: 'success',
            title: '1-Click Broadcast Successful! 🚀',
            message: `"${job.video.title}" is now published across all ${job.targetPlatforms.length} social platforms.`,
            jobId: job.id
          });
        }, 100);
      } else if (
        (job.overallStatus !== 'partially_failed' && job.overallStatus !== 'failed') &&
        (newStatus === 'partially_failed' || newStatus === 'failed')
      ) {
        const failedCount = statuses.filter(s => s.state === 'failed').length;
        setTimeout(() => {
          addNotification({
            type: 'warning',
            title: `Upload Finished with Warnings`,
            message: `${failedCount} of ${job.targetPlatforms.length} platforms encountered an issue. Tap to review or retry.`,
            jobId: job.id,
            actionLabel: 'Review'
          });
        }, 100);
      }

      return {
        ...job,
        overallStatus: newStatus,
        overallProgress,
        speedMBs: +totalSpeed.toFixed(1),
        etaSeconds,
        updatedAt: Date.now()
      };
    }));
  }, [addNotification]);

  // Main Enqueue Function: Initiates simultaneous upload to all target platforms with 1 click
  const enqueueJob = useCallback((video: VideoMetadata, targetPlatforms: SocialPlatformId[]): string => {
    soundService.playStart();
    const jobId = 'job_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    const platformStatuses: Record<SocialPlatformId, PlatformUploadStatus> = {} as Record<SocialPlatformId, PlatformUploadStatus>;

    targetPlatforms.forEach(platId => {
      platformStatuses[platId] = {
        platformId: platId,
        state: 'queued',
        progress: 0,
        bytesUploaded: 0,
        totalBytes: video.fileSizeBytes,
        speedMBs: 0,
        stageText: 'Waiting in upload queue...'
      };
    });

    const newJob: UploadJob = {
      id: jobId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      video,
      targetPlatforms,
      platformStatuses,
      overallStatus: 'queued',
      overallProgress: 0,
      speedMBs: 0,
      etaSeconds: 15
    };

    setJobs(prev => [newJob, ...prev]);
    setActiveJobId(jobId);

    addNotification({
      type: 'info',
      title: 'Added to Upload Queue',
      message: `Broadcasting "${video.title.slice(0, 32)}..." to ${targetPlatforms.length} platforms simultaneously.`,
      jobId
    });

    // Start all platform uploads concurrently after short queue staging
    targetPlatforms.forEach((platId, idx) => {
      // If test error simulation is enabled, pick 1 platform (e.g. TikTok or X) to simulate realistic API failure
      const shouldFail = testErrorSimulation && (idx === 1 || idx === 3);

      setTimeout(() => {
        runPlatformUpload(jobId, platId, video.fileSizeBytes, shouldFail);
      }, 300 + idx * 120); // slight stagger for authentic parallel stream sockets
    });

    return jobId;
  }, [testErrorSimulation, addNotification, runPlatformUpload]);

  // Retry single platform
  const retryPlatform = useCallback((jobId: string, platformId: SocialPlatformId) => {
    soundService.playStart();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    addNotification({
      type: 'info',
      title: `Retrying ${PLATFORMS_CONFIG[platformId].name}`,
      message: 'Re-initiating upload chunk stream...',
      jobId,
      platformId
    });

    runPlatformUpload(jobId, platformId, job.video.fileSizeBytes, false); // Don't fail on retry
  }, [jobs, addNotification, runPlatformUpload]);

  // Retry entire failed job
  const retryEntireJob = useCallback((jobId: string) => {
    soundService.playStart();
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    job.targetPlatforms.forEach(platId => {
      const stat = job.platformStatuses[platId];
      if (!stat || stat.state === 'failed') {
        runPlatformUpload(jobId, platId, job.video.fileSizeBytes, false);
      }
    });

    addNotification({
      type: 'info',
      title: 'Retrying All Failed Channels',
      message: `Re-broadcasting to failed social platforms for "${job.video.title.slice(0, 24)}..."`,
      jobId
    });
  }, [jobs, addNotification, runPlatformUpload]);

  const pauseQueue = useCallback(() => {
    soundService.playTick();
    setIsQueuePaused(true);
    addNotification({
      type: 'warning',
      title: 'Upload Queue Paused',
      message: 'Active video chunk streams paused. Tap resume anytime.'
    });
  }, [addNotification]);

  const resumeQueue = useCallback(() => {
    soundService.playTick();
    setIsQueuePaused(false);
    addNotification({
      type: 'info',
      title: 'Upload Queue Resumed',
      message: 'Resuming simultaneous social video streams.'
    });
  }, [addNotification]);

  const cancelJob = useCallback((jobId: string) => {
    soundService.playTick();
    // Clear any running timers
    Object.keys(activeSimulations.current).forEach(key => {
      if (key.startsWith(jobId)) {
        window.clearInterval(activeSimulations.current[key]);
        delete activeSimulations.current[key];
      }
    });

    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (activeJobId === jobId) {
      setActiveJobId(null);
    }

    addNotification({
      type: 'info',
      title: 'Upload Canceled',
      message: 'The queued video upload job was removed.'
    });
  }, [activeJobId, addNotification]);

  const clearCompletedJobs = useCallback(() => {
    soundService.playTick();
    setJobs(prev => prev.filter(j => j.overallStatus !== 'completed'));
    addNotification({
      type: 'info',
      title: 'Queue Cleaned',
      message: 'Removed finished video uploads from queue history.'
    });
  }, [addNotification]);

  return (
    <UploadQueueContext.Provider
      value={{
        jobs,
        activeJobId,
        setActiveJobId,
        isQueuePaused,
        testErrorSimulation,
        setTestErrorSimulation,
        notifications,
        headsUpNotification,
        accounts,
        soundEnabled,
        hapticsEnabled,
        enqueueJob,
        retryPlatform,
        retryEntireJob,
        pauseQueue,
        resumeQueue,
        cancelJob,
        clearCompletedJobs,
        dismissHeadsUp,
        markNotificationRead,
        clearAllNotifications,
        toggleAccountConnection,
        toggleSound,
        toggleHaptics
      }}
    >
      {children}
    </UploadQueueContext.Provider>
  );
};

export const useUploadQueue = () => {
  const ctx = useContext(UploadQueueContext);
  if (!ctx) {
    throw new Error('useUploadQueue must be used within an UploadQueueProvider');
  }
  return ctx;
};
