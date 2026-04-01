import { supabase } from './supabase'

export async function createNotification(userId, type, title, body, metadata = {}) {
  if (!userId) return
  try {
    await supabase.from('notifications').insert({ user_id: userId, type, title, body, metadata })
  } catch { /* non-critical */ }
}

export async function sendNotificationEmail(to, subject, title, body, ctaText, ctaUrl) {
  try {
    await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, title, body, ctaText, ctaUrl }),
    })
  } catch { /* non-critical */ }
}
