/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadQueueProvider } from './context/UploadQueueContext';
import { AndroidFrame, AppNavTab } from './components/AndroidFrame';
import { OneClickUploader } from './components/OneClickUploader';
import { UploadQueueView } from './components/UploadQueueView';
import { AccountsView } from './components/AccountsView';
import { GamingAgentView } from './components/GamingAgentView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppNavTab>('uploader');

  return (
    <UploadQueueProvider>
      <AndroidFrame
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      >
        {currentTab === 'uploader' && (
          <OneClickUploader 
            onUploadStarted={() => setCurrentTab('queue')} 
            onNavigateToAgent={() => setCurrentTab('agent')}
          />
        )}

        {currentTab === 'agent' && (
          <GamingAgentView 
            onNavigateToQueue={() => setCurrentTab('queue')}
          />
        )}

        {currentTab === 'queue' && (
          <UploadQueueView 
            onNavigateToCompose={() => setCurrentTab('uploader')} 
          />
        )}

        {currentTab === 'accounts' && (
          <AccountsView />
        )}
      </AndroidFrame>
    </UploadQueueProvider>
  );
}
