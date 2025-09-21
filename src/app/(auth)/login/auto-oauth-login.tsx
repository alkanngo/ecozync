'use client';

import { useEffect } from 'react';

import { ActionResponse } from '@/types/action-response';

interface AutoOAuthLoginProps {
  provider: 'google';
  signInWithOAuth: (provider: 'github' | 'google', origin?: string) => Promise<ActionResponse>;
  origin?: string;
}

export function AutoOAuthLogin({ provider, signInWithOAuth, origin }: AutoOAuthLoginProps) {
  useEffect(() => {
    const handleOAuth = async () => {
      try {
        await signInWithOAuth(provider, origin);
      } catch (error) {
        console.error('OAuth login failed:', error);
        // Redirect to regular login on failure
        window.location.href = '/login';
      }
    };

    // Trigger OAuth login automatically
    handleOAuth();
  }, [provider, signInWithOAuth, origin]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-text-primary mb-2 font-outfit">
          Signing you in with Google...
        </h2>
        <p className="text-text-secondary font-mono">
          Please wait while we redirect you to Google
        </p>
      </div>
    </div>
  );
}
