'use client';

import { useState } from 'react';

interface BottomNavProps {
  view: 'graph' | 'list';
  onViewChange: (view: 'graph' | 'list') => void;
  onAddClick: () => void;
}

export default function BottomNav({ view, onViewChange, onAddClick }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* List View */}
        <button
          onClick={() => onViewChange('list')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            view === 'list'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-xs font-medium">List</span>
        </button>

        {/* Add Link (Floating Button) */}
        <button
          onClick={onAddClick}
          className="flex items-center justify-center w-14 h-14 -mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all active:scale-95"
          aria-label="Add Link"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Graph View */}
        <button
          onClick={() => onViewChange('graph')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            view === 'graph'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-xs font-medium">Graph</span>
        </button>
      </div>
    </nav>
  );
}
