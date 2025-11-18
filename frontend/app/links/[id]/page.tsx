'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Link } from '@/lib/api';

export default function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    notes: '',
  });

  useEffect(() => {
    fetchLink();
  }, [id]);

  const fetchLink = async () => {
    try {
      setLoading(true);
      const data = await api.getLink(id);
      setLink(data);
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        notes: data.notes,
      });
    } catch (error) {
      console.error('Failed to fetch link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!link) return;

    try {
      await api.updateLink(link._id, formData);
      await fetchLink();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update link:', error);
      alert('Failed to update link');
    }
  };

  const handleDelete = async () => {
    if (!link) return;

    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await api.deleteLink(link._id);
        router.push('/');
      } catch (error) {
        console.error('Failed to delete link:', error);
        alert('Failed to delete link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Link not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Linkary
            </button>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Preview Image */}
          {link.image && (
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700">
              <img
                src={link.image}
                alt={link.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-8">
            {/* Favicon + Title */}
            <div className="flex items-start gap-3 mb-4">
              {link.favicon && (
                <img
                  src={link.favicon}
                  alt=""
                  className="w-8 h-8 mt-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Title"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {link.title || link.url}
                  </h1>
                )}
              </div>
            </div>

            {/* URL */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline mb-6 block"
            >
              {link.url} ↗
            </a>

            {/* Category & Tags */}
            <div className="mb-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                {editing ? (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Article">Article</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Tool">Tool</option>
                    <option value="Video">Video</option>
                    <option value="Repository">Repository</option>
                    <option value="Research">Research</option>
                    <option value="News">News</option>
                    <option value="Reference">Reference</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                    {link.category}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {link.tags.length > 0 ? (
                      link.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">No tags</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {editing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  {link.description || 'No description available'}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Notes
              </label>
              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add your personal notes here..."
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {link.notes || 'No notes yet. Click Edit to add notes.'}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Created: {new Date(link.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(link.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
