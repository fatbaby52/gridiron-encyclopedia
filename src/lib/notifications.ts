import { getSupabaseServerClient } from '@/lib/supabase-server'
import type { NotificationType } from '@/types/community'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link_url: params.linkUrl ?? null,
      is_read: false,
    })
    .select()
    .single()

  if (error) return null
  return data
}
