import { supabase } from './supabase'

/**
 * Always upsert — never update — so saves work even when no row exists yet.
 * Use this everywhere instead of supabase.from('profiles').update().
 */
export async function saveProfile(userId, fields) {
  return supabase.from('profiles').upsert({ id: userId, ...fields }, { onConflict: 'id' })
}
