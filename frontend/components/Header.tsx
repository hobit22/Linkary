'use client';

import { useAuth } from '@/hooks/useAuth';
import UserMenu from './UserMenu';
import GoogleLoginButton from './GoogleLoginButton';

interface HeaderProps {
  view: 'graph' | 'list';
  onViewChange: (view: 'graph' | 'list') => void;
  showViewSwitcher?: boolean;
}

export default function Header({ view, onViewChange, showViewSwitcher = true }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Linkary
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isAuthenticated ? 'Paste URL (Ctrl+V / Cmd+V) to add instantly' : 'Your Knowledge Library'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {showViewSwitcher && isAuthenticated && (
              <div className="flex gap-2">
                <button
                  onClick={() => onViewChange('graph')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'graph'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Graph View
                </button>
                <button
                  onClick={() => onViewChange('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  List View
                </button>
              </div>
            )}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="scale-90">
                <GoogleLoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
