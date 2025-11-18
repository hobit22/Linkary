'use client';

import { useState } from 'react';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import LinkList from '@/components/LinkList';
import Header from '@/components/Header';
import Notification from '@/components/Notification';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useLinks } from '@/hooks/useLinks';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [view, setView] = useState<'graph' | 'list'>('list');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { links, graphData, loading: linksLoading, refetch } = useLinks();
  const { notification, showNotification } = useNotification();

  useClipboardPaste({
    onSuccess: () => {
      showNotification('Link added successfully!');
      refetch();
    },
    onError: (message) => showNotification(message),
  });

  const handleNodeClick = (node: any) => {
    if (node.id) {
      window.location.href = `/links/${node.id}`;
    }
  };

  const stats = {
    totalLinks: links.length,
    categories: new Set(links.map(l => l.category)).size,
    tags: new Set(links.flatMap(l => l.tags)).size,
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Notification message={notification} />
        <Header view={view} onViewChange={setView} showViewSwitcher={false} />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  // Show login UI if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Notification message={notification} />
        <Header view={view} onViewChange={setView} showViewSwitcher={false} />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-96 gap-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Linkary
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Sign in with Google to start organizing your links
              </p>
              <GoogleLoginButton
                onSuccess={() => showNotification('Successfully logged in!')}
                onError={(msg) => showNotification(msg)}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main app when authenticated
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Notification message={notification} />
      <Header view={view} onViewChange={setView} />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {linksLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : view === 'graph' ? (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Knowledge Graph
            </h2>
            {graphData.nodes.length > 0 ? (
              <KnowledgeGraph data={graphData} onNodeClick={handleNodeClick} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Add links to see your knowledge graph
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Links
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalLinks} links · {stats.categories} categories · {stats.tags} tags
              </div>
            </div>
            <LinkList links={links} onLinkDeleted={refetch} />
          </div>
        )}
      </main>
    </div>
  );
}
