import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getUser() {
  const supabase = await createSupabaseServerClient();

  // Get the current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Auth error:', authError);
    return null;
  }

  // Get the profile data for this user
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
  }

  return data;
}
