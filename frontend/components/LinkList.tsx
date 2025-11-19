'use client';

import { useRouter } from 'next/navigation';
import { Link } from '@/lib/api';
import { api } from '@/lib/api';

interface LinkListProps {
  links: Link[];
  onLinkDeleted: () => void;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
}

export default function LinkList({
  links,
  onLinkDeleted,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchQuery = '',
}: LinkListProps) {
  const router = useRouter();

  // Highlight search terms in text
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await api.deleteLink(id);
        onLinkDeleted();
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No links yet. Add your first link to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {links.map((link) => (
        <div
          key={link._id}
          onClick={() => router.push(`/links/${link._id}`)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-start gap-3">
            {link.favicon && (
              <img
                src={link.favicon}
                alt=""
                className="w-6 h-6 mt-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {highlightText(link.title || link.url, searchQuery)}
              </h3>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {link.url}
              </a>
            </div>
          </div>

          {link.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {highlightText(link.description, searchQuery)}
            </p>
          )}

          {link.image && (
            <img
              src={link.image}
              alt={link.title}
              className="mt-3 w-full h-32 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <div className="mt-3">
            <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {link.category}
            </span>
          </div>

          {link.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {link.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {link.notes && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
              {link.notes}
            </p>
          )}

          <div className="mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              {new Date(link.createdAt).toLocaleDateString()}
            </span>
            <button
              onClick={(e) => handleDelete(link._id, e)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 z-10 px-2 py-1 min-h-[44px] sm:min-h-0 -mr-2 sm:mr-0"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
