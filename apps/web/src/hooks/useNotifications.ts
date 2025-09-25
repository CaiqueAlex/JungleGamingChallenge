import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  timestamp: string
  read: boolean
  data?: any
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications.slice(0, 49)],
          unreadCount: state.unreadCount + 1
        }))
      },

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification =>
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      })),

      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id)
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: notification && !notification.read 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount
        }
      }),

      clearNotifications: () => set({
        notifications: [],
        unreadCount: 0
      })
    }),
    { name: 'notification-store' }
  )
)

export function useNotifications() {
  const store = useNotificationStore()
  
  const addSuccess = (title: string, message?: string, data?: any) => {
    store.addNotification({ type: 'success', title, message, data })
  }

  const addError = (title: string, message?: string, data?: any) => {
    store.addNotification({ type: 'error', title, message, data })
  }

  const addInfo = (title: string, message?: string, data?: any) => {
    store.addNotification({ type: 'info', title, message, data })
  }

  const addWarning = (title: string, message?: string, data?: any) => {
    store.addNotification({ type: 'warning', title, message, data })
  }

  return {
    ...store,
    addSuccess,
    addError,
    addInfo,
    addWarning,
  }
}