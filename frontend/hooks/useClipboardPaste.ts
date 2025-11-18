import { useEffect } from 'react';
import { api, Category, getErrorMessage } from '@/lib/api';

interface UseClipboardPasteProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

const isValidURL = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export function useClipboardPaste({ onSuccess, onError }: UseClipboardPasteProps) {
  const addLinkFromClipboard = async (url: string) => {
    if (!isValidURL(url)) return;

    try {
      await api.createLink({
        url,
        tags: [],
        category: Category.OTHER,
        notes: '',
      });

      onSuccess();
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && isValidURL(pastedText)) {
        e.preventDefault();
        await addLinkFromClipboard(pastedText);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return { addLinkFromClipboard };
}
