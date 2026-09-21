import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Flame, 
  Share2, 
  Twitter, 
  Youtube, 
  Instagram, 
  Linkedin, 
  AtSign, 
  RefreshCw, 
  KeyRound, 
  ShieldCheck,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useUploadQueue } from '../context/UploadQueueContext';
import { PLATFORMS_CONFIG } from '../services/mockData';
import { SocialPlatformId } from '../types';

export const AccountsView: React.FC = () => {
  const { accounts, toggleAccountConnection } = useUploadQueue();

  const getPlatformIcon = (id: SocialPlatformId) => {
    switch (id) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'tiktok': return <Flame className="w-5 h-5 text-cyan-400" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'x': return <Twitter className="w-5 h-5 text-neutral-200" />;
      case 'facebook': return <Share2 className="w-5 h-5 text-blue-500" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-sky-500" />;
      case 'threads': return <AtSign className="w-5 h-5 text-zinc-300" />;
      default: return null;
    }
  };

  return (
    <div id="accounts-view-container" className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100">
              Connected Social Accounts
            </h2>
            <p className="text-[11px] text-neutral-400">
              OAuth 2.0 authorized channels & daily upload quotas
            </p>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold text-neutral-200 mb-0.5">Simultaneous Multi-Post Token Vault</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            All access tokens are refreshed automatically. Publishing requests authenticate directly with official platform APIs.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map(account => {
          const config = PLATFORMS_CONFIG[account.platformId];
          const quotaPercent = Math.round((account.dailyQuotaUsed / account.dailyQuotaMax) * 100);

          return (
            <div
              key={account.platformId}
              id={`account-card-${account.platformId}`}
              className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-3 transition-all hover:border-neutral-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-800 flex items-center justify-center relative">
                    {getPlatformIcon(account.platformId)}
                    {account.isConnected && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-neutral-100">
                        {config.name}
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        ({config.formatName})
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      @{account.username} • <span className="text-neutral-300 font-semibold">{account.followerCount} followers</span>
                    </p>
                  </div>
                </div>

                <button
                  id={`btn-toggle-account-${account.platformId}`}
                  onClick={() => toggleAccountConnection(account.platformId)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    account.isConnected
                      ? 'bg-neutral-800 text-neutral-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-neutral-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {account.isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Quota Progress */}
              {account.isConnected && (
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-neutral-500" />
                      Token valid: {account.tokenExpiresAt}
                    </span>
                    <span>
                      Daily Quota: <strong className="text-neutral-200">{account.dailyQuotaUsed} / {account.dailyQuotaMax}</strong> uploads
                    </span>
                  </div>

                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        quotaPercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
