// ref: https://github.com/vercel/next.js/blob/canary/examples/with-supabase/app/auth/callback/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getURL } from '@/utils/get-url';

const siteUrl = getURL();

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', error, errorDescription);
    
    // If it's a database error, redirect to calculator with a helpful message
    if (errorDescription?.includes('Database error')) {
      return NextResponse.redirect(`${siteUrl}/calculator?error=signup_failed&message=Please%20try%20again%20or%20contact%20support`);
    }
    
    return NextResponse.redirect(`${siteUrl}/login?error=${error}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`);
  }

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Auth exchange error:', authError);
        return NextResponse.redirect(`${siteUrl}/login?error=auth_failed&message=${encodeURIComponent(authError.message)}`);
      }

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('User fetch error:', userError);
        return NextResponse.redirect(`${siteUrl}/login?error=user_fetch_failed`);
      }

      if (!user?.id) {
        console.error('No user ID after authentication');
        return NextResponse.redirect(`${siteUrl}/login?error=no_user_id`);
      }

      console.log('OAuth success for user:', user.id);
      
      // Handle different origins for post-auth routing
      const origin = requestUrl.searchParams.get('origin');
      if (origin === 'calculator') {
        return NextResponse.redirect(`${siteUrl}/dashboard?welcome=true`);
      } else if (origin === 'homepage') {
        return NextResponse.redirect(`${siteUrl}/dashboard?source=homepage`);
      }

      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(`${siteUrl}/dashboard`);
    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error);
      return NextResponse.redirect(`${siteUrl}/login?error=unexpected_error`);
    }
  }

  return NextResponse.redirect(siteUrl);
}
