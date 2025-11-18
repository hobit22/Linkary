/**
 * Frontend constants and utility functions.
 */

import { Category } from './api';

/**
 * Get all category values as an array.
 */
export function getCategoryValues(): string[] {
  return Object.values(Category);
}

/**
 * Get category color for visualization.
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    [Category.ARTICLE]: '#10b981',        // green
    [Category.TUTORIAL]: '#f59e0b',       // orange
    [Category.DOCUMENTATION]: '#ec4899',  // pink
    [Category.TOOL]: '#8b5cf6',           // purple
    [Category.VIDEO]: '#ef4444',          // red
    [Category.REPOSITORY]: '#3b82f6',     // blue
    [Category.RESEARCH]: '#14b8a6',       // teal
    [Category.NEWS]: '#f97316',           // orange-red
    [Category.REFERENCE]: '#06b6d4',      // cyan
    [Category.OTHER]: '#94a3b8',          // gray
  };
  return colors[category] || colors[Category.OTHER];
}

/**
 * Validate if a string is a valid URL.
 */
export function isValidURL(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
