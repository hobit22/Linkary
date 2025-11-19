'use client';

import { useState, useEffect, useCallback } from 'react';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import LinkList from '@/components/LinkList';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AddLinkModal from '@/components/AddLinkModal';
import Notification from '@/components/Notification';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import SearchBar from '@/components/SearchBar';
import FilterPanel, { FilterOptions } from '@/components/FilterPanel';
import { useClipboardPaste } from '@/hooks/useClipboardPaste';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import { useDevice } from '@/hooks/useDevice';
import { api, Link, GraphData, PaginatedResponse } from '@/lib/api';

export default function Home() {
  const [view, setView] = useState<'graph' | 'list'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notification, showNotification } = useNotification();
  const { isMobile } = useDevice();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at_desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<Link>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all links once for filter options (tags, categories)
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAllLinks = async () => {
      try {
        const allLinksData = await api.getLinks();
        setAllLinks(allLinksData);
      } catch (error) {
        console.error('Failed to fetch all links for filters:', error);
      }
    };

    fetchAllLinks();
  }, [isAuthenticated]);

  // Fetch data with search and filters
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [searchResults, graphDataResult] = await Promise.all([
        api.searchLinks({
          q: searchQuery || undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          category: filters.category || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sortBy: filters.sortBy || 'created_at_desc',
          page: currentPage,
          pageSize: 20,
        }),
        api.getGraphData(),
      ]);
      setPaginatedData(searchResults);
      setGraphData(graphDataResult);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchQuery, filters, currentPage, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useClipboardPaste({
    onSuccess: async () => {
      showNotification('Link added successfully!');
      // Refetch both search results and all links for filter options
      fetchData();
      try {
        const allLinksData = await api.getLinks();
        setAllLinks(allLinksData);
      } catch (error) {
        console.error('Failed to update allLinks:', error);
      }
    },
    onError: (message) => showNotification(message),
  });

  const handleNodeClick = (node: any) => {
    if (node.id) {
      window.location.href = `/links/${node.id}`;
    }
  };

  // Extract unique tags and categories for filter panel
  const availableTags = Array.from(new Set(allLinks.flatMap((l) => l.tags))).sort();
  const availableCategories = Array.from(new Set(allLinks.map((l) => l.category))).sort();

  const stats = {
    totalLinks: paginatedData.total,
    categories: availableCategories.length,
    tags: availableTags.length,
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
  };

  const handleSearch = () => {
    setSearchQuery(searchInputValue);
  };

  const handleSearchClear = () => {
    setSearchInputValue('');
    setSearchQuery('');
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters =
    searchQuery ||
    filters.tags.length > 0 ||
    filters.category ||
    filters.dateFrom ||
    filters.dateTo;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      <Notification message={notification} />
      <Header view={view} onViewChange={setView} />

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : view === 'graph' ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
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
            {/* Search Bar */}
            <div className="mb-4 flex justify-center">
              <SearchBar
                value={searchInputValue}
                onChange={handleSearchInputChange}
                onSearch={handleSearch}
                onClear={handleSearchClear}
              />
            </div>

            {/* Filter Panel and Links Grid */}
            <div className="lg:grid lg:grid-cols-[280px,1fr] lg:gap-6">
              {/* Filter Panel - Sidebar on desktop */}
              <aside className="lg:sticky lg:top-4 lg:self-start">
                <FilterPanel
                  availableTags={availableTags}
                  availableCategories={availableCategories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </aside>

              {/* Main Content */}
              <div>
                {/* Header with Stats */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {hasActiveFilters ? 'Search Results' : 'All Links'}
                  </h2>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {hasActiveFilters ? (
                      <>Found {paginatedData.total} link{paginatedData.total !== 1 ? 's' : ''}</>
                    ) : (
                      <>{stats.totalLinks} links{!isMobile && ` · ${stats.categories} categories · ${stats.tags} tags`}</>
                    )}
                  </div>
                </div>

                {/* Links List */}
                {paginatedData.items.length > 0 ? (
                  <LinkList
                    links={paginatedData.items}
                    onLinkDeleted={fetchData}
                    totalCount={paginatedData.total}
                    currentPage={paginatedData.page}
                    totalPages={paginatedData.totalPages}
                    onPageChange={handlePageChange}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {hasActiveFilters
                      ? 'No links match your search criteria'
                      : 'No links yet. Add your first link to get started!'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile/Tablet only) */}
      {isAuthenticated && (
        <BottomNav
          view={view}
          onViewChange={setView}
          onAddClick={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Link Modal */}
      <AddLinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLinkAdded={() => {
          showNotification('Link added successfully!');
          fetchData();
        }}
      />
    </div>
  );
}
