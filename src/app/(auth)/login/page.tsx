import { redirect } from 'next/navigation';

import { getSession } from '@/features/account/controllers/get-session';

import { signInWithEmail, signInWithOAuth } from '../auth-actions';
import { AuthUI } from '../auth-ui';

import { AutoOAuthLogin } from './auto-oauth-login';

interface LoginPageProps {
  searchParams: Promise<{
    intent?: string;
    provider?: string;
    origin?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  // Auto-trigger OAuth if intent and provider are set
  const params = await searchParams;
  if (params.intent === 'oauth' && params.provider === 'google') {
    return <AutoOAuthLogin provider="google" signInWithOAuth={signInWithOAuth} origin={params.origin} />;
  }

  return (
    <section className='py-xl m-auto flex h-full max-w-lg items-center'>
      <AuthUI mode='login' signInWithOAuth={signInWithOAuth} signInWithEmail={signInWithEmail} />
    </section>
  );
}
