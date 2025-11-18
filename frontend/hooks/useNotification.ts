import { useState, useCallback } from 'react';

export function useNotification(duration = 3000) {
  const [notification, setNotification] = useState('');

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  }, [duration]);

  const clearNotification = useCallback(() => {
    setNotification('');
  }, []);

  return {
    notification,
    showNotification,
    clearNotification,
  };
}
