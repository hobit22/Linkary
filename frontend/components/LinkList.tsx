'use client';

import { Link } from '@/lib/api';
import { api } from '@/lib/api';

interface LinkListProps {
  links: Link[];
  onLinkDeleted: () => void;
}

export default function LinkList({ links, onLinkDeleted }: LinkListProps) {
  const handleDelete = async (id: string) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <div
          key={link._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
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
                {link.title || link.url}
              </h3>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
              >
                {link.url}
              </a>
            </div>
          </div>

          {link.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {link.description}
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
              onClick={() => handleDelete(link._id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
