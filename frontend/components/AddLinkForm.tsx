'use client';

import { useState, useEffect } from 'react';
import { api, Category, getErrorMessage } from '@/lib/api';

interface AddLinkFormProps {
  onLinkAdded: () => void;
}

export default function AddLinkForm({ onLinkAdded }: AddLinkFormProps) {
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState<string>(Category.OTHER);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-submit link when valid URL is pasted
  const autoSubmitLink = async (url: string) => {
    if (!isValidURL(url)) return;

    setLoading(true);
    setError('');

    try {
      await api.createLink({
        url,
        tags: [],
        category: Category.OTHER,
        notes: '',
      });

      // Reset form
      setUrl('');
      setTags('');
      setCategory(Category.OTHER);
      setNotes('');

      onLinkAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Check clipboard on mount and paste event
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (isValidURL(text) && !url) {
          // Auto-submit on mount if clipboard has valid URL
          await autoSubmitLink(text);
        }
      } catch (err) {
        // Clipboard permission denied or not available
        console.debug('Clipboard access not available');
      }
    };

    checkClipboard();

    // Listen for paste events anywhere in the component
    const handlePaste = async (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && isValidURL(pastedText)) {
        e.preventDefault();
        // Auto-submit on paste
        await autoSubmitLink(pastedText);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const isValidURL = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createLink({
        url,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category,
        notes,
      });

      // Reset form
      setUrl('');
      setTags('');
      setCategory(Category.OTHER);
      setNotes('');

      onLinkAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isValidURL(text)) {
        await autoSubmitLink(text);
      } else {
        setError('Clipboard does not contain a valid URL');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to read from clipboard');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Add New Link</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Paste URL (Ctrl+V / Cmd+V) to add instantly
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL *
            </label>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              📋 Paste from clipboard
            </button>
          </div>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Or enter URL manually..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.entries(Category).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="javascript, tutorial, react"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add your notes here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Link'}
        </button>
      </div>
    </form>
  );
}
