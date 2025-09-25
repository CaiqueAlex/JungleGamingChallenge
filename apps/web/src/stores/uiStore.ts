import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface UiStoreState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  modals: Record<string, boolean>
  openModal: (modalName: string) => void
  closeModal: (modalName: string) => void
  toggleModal: (modalName: string) => void
  
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiStoreState>()(
  devtools(
    (set, get) => ({
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7)
        const newToast = { ...toast, id }
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }), false, 'addToast')
        
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, toast.duration || 5000)
        }
      },
      
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id)
        }), false, 'removeToast'),
      
      isLoading: false,
      setIsLoading: (loading) =>
        set({ isLoading: loading }, false, 'setIsLoading'),
      
      modals: {},
      openModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: true }
        }), false, 'openModal'),
      
      closeModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: false }
        }), false, 'closeModal'),
      
      toggleModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: !state.modals[modalName] }
        }), false, 'toggleModal'),
      
      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),
      
      setSidebarOpen: (open) =>
        set({ isSidebarOpen: open }, false, 'setSidebarOpen')
    }),
    { name: 'ui-store' }
  )
)