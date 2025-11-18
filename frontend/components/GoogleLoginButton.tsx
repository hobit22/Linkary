'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const errorMsg = 'No credential received from Google';
      console.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      await login(credentialResponse.credential);
      onSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to login with Google';
      console.error('Login failed:', errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    const errorMsg = 'Google login failed';
    console.error(errorMsg);
    onError?.(errorMsg);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
    />
  );
}
