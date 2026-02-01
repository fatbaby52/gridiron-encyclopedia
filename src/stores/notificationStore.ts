import { create } from 'zustand'
import type { Notification } from '@/types/community'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean

  loadNotifications: (userId: string) => Promise<void>
  markRead: (ids: string[]) => Promise<void>
  pollUnread: (userId: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  loadNotifications: async (/* userId */) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        const data: Notification[] = json.data ?? []
        set({
          notifications: data,
          unreadCount: data.filter((n) => !n.isRead).length,
        })
      }
    } catch {
      // silent fail
    } finally {
      set({ loading: false })
    }
  },

  markRead: async (ids) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (res.ok) {
        set((s) => {
          const updated = s.notifications.map((n) =>
            ids.includes(n.id) ? { ...n, isRead: true } : n,
          )
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.isRead).length,
          }
        })
      }
    } catch {
      // silent fail
    }
  },

  pollUnread: async (/* userId */) => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true')
      if (res.ok) {
        const json = await res.json()
        const data: Notification[] = json.data ?? []
        set({ unreadCount: data.length })
      }
    } catch {
      // silent fail
    }
  },
}))
