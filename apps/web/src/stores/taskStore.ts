  import { create } from 'zustand'
  import { devtools } from 'zustand/middleware'

  export interface Task {
    id: string
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high' | 'urgent' 
    createdAt: string
    updatedAt: string
    userId: string
  }

  interface TaskStore {
    tasks: Task[]
    isLoading: boolean
    filters: {
      status: string
      priority: string
      search: string
    }
    setTasks: (tasks: Task[]) => void
    addTask: (task: Task) => void
    updateTask: (id: string, task: Partial<Task>) => void
    deleteTask: (id: string) => void
    setLoading: (loading: boolean) => void
    setFilters: (filters: Partial<TaskStore['filters']>) => void
    clearFilters: () => void
    filteredTasks: () => Task[]
  }

  export const useTaskStore = create<TaskStore>()(
    devtools(
      (set, get) => ({
        tasks: [],
        isLoading: false,
        filters: {
          status: 'all',
          priority: 'all',
          search: ''
        },

        setTasks: (tasks) => {
          const validTasks = Array.isArray(tasks) ? tasks : []
          console.log('📋 SETTING TASKS:', validTasks)
          set({ tasks: validTasks })
        },
        
        addTask: (task) => set((state) => ({ 
          tasks: [...state.tasks, task] 
        })),
        
        updateTask: (id, updatedTask) => set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id ? { ...task, ...updatedTask } : task
          )
        })),
        
        deleteTask: (id) => set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),
        
        setLoading: (isLoading) => set({ isLoading }),
        
        setFilters: (newFilters) => set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),
        
        clearFilters: () => set({
          filters: { status: 'all', priority: 'all', search: '' }
        }),

        filteredTasks: () => {
          const { tasks, filters } = get()
          
          if (!Array.isArray(tasks)) {
            console.warn('⚠️ TASKS IS NOT ARRAY:', tasks)
            return []
          }
          
          return tasks.filter((task) => {
            const matchesStatus = filters.status === 'all' || task.status === filters.status
            const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
            const matchesSearch = !filters.search || 
              task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
              task.description.toLowerCase().includes(filters.search.toLowerCase())
            
            return matchesStatus && matchesPriority && matchesSearch
          })
        }
      }),
      { name: 'task-store' }
    )
  )