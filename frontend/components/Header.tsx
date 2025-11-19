'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDevice } from '@/hooks/useDevice';
import UserMenu from './UserMenu';
import GoogleLoginButton from './GoogleLoginButton';

interface HeaderProps {
  view: 'graph' | 'list';
  onViewChange: (view: 'graph' | 'list') => void;
  showViewSwitcher?: boolean;
}

export default function Header({ view, onViewChange, showViewSwitcher = true }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const { isMobile } = useDevice();

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Linkary
            </h1>
            {!isMobile && (
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {isAuthenticated ? 'Paste URL (Ctrl+V / Cmd+V) to add instantly' : 'Your Knowledge Library'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop View Switcher */}
            {showViewSwitcher && isAuthenticated && !isMobile && (
              <div className="hidden lg:flex gap-2">
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
              <div className="scale-75 sm:scale-90">
                <GoogleLoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
