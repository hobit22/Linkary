'use client';

import { useEffect, useState } from 'react';
import { api, Link, GraphData } from '@/lib/api';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import AddLinkForm from '@/components/AddLinkForm';
import LinkList from '@/components/LinkList';

export default function Home() {
  const [links, setLinks] = useState<Link[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'graph' | 'list'>('graph');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linksData, graphDataResult] = await Promise.all([
        api.getLinks(),
        api.getGraphData(),
      ]);
      setLinks(linksData);
      setGraphData(graphDataResult);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNodeClick = (node: any) => {
    if (node.url) {
      window.open(node.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Linkary
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView('graph')}
                className={`px-4 py-2 rounded-md ${
                  view === 'graph'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Graph View
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                List View
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your personal knowledge library
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddLinkForm onLinkAdded={fetchData} />

            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Stats
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>Total Links: {links.length}</div>
                <div>Categories: {new Set(links.map(l => l.category)).size}</div>
                <div>Tags: {new Set(links.flatMap(l => l.tags)).size}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
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
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  All Links
                </h2>
                <LinkList links={links} onLinkDeleted={fetchData} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
