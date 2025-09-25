import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTaskStore } from '../stores/taskStore'
import type { CreateTaskApiData } from '../lib/schemas'
import { mapStatusFromBackend, mapPriorityFromBackend, mapStatusToBackend, mapPriorityToBackend } from '../lib/mappers'
import type { Task as FrontendTask } from '../stores/taskStore'
import { useWebSocket } from './useWebSocket' 

export interface BackendTask {
  id: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  taskAssignees: any[]
  comments: any[]
  history?: any[]
}

const convertBackendToFrontend = (backendTask: BackendTask): FrontendTask => ({
  id: backendTask.id,
  title: backendTask.title,
  description: backendTask.description,
  status: mapStatusFromBackend(backendTask.status),
  priority: mapPriorityFromBackend(backendTask.priority),
  createdAt: backendTask.createdAt,
  updatedAt: backendTask.updatedAt,
  userId: backendTask.ownerId
})

export interface UpdateTaskData {
  id: string
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

export function useTasks(filters?: Record<string, any>) {
  const { token } = useAuth()
  const { setTasks, setLoading } = useTaskStore()
  
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: async () => {
      if (!token) throw new Error('No token')
      setLoading(true)
      
      const response: any = await apiService.getTasks(token)
      console.log('📊 API RESPONSE TYPE:', typeof response, response)
      
      let backendTasks: BackendTask[] = []
      
      if (Array.isArray(response)) {
        backendTasks = response
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        backendTasks = response.data
      } else {
        console.warn('⚠️ API não retornou array válido:', response)
        backendTasks = []
      }
      
      const frontendTasks = backendTasks.map(convertBackendToFrontend)
      
      setTasks(frontendTasks)
      setLoading(false)
      return frontendTasks
    },
    enabled: !!token,
    staleTime: 30 * 1000,
  })
}

export function useTask(taskId: string) {
  const { token } = useAuth()
  
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: async (): Promise<BackendTask> => {
      const backendTask = await apiService.getTask(taskId, token!)
      return backendTask as BackendTask
    },
    enabled: !!token && !!taskId,
  })
}

export function useCreateTask() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const { addTask } = useTaskStore()
  const { sendMessage } = useWebSocket() 
  
  return useMutation({
    mutationFn: async (data: CreateTaskApiData): Promise<BackendTask> => {
      const result = await apiService.createTask(data, token!)
      return result as BackendTask
    },
    onSuccess: (backendTask: BackendTask) => {
      const frontendTask = convertBackendToFrontend(backendTask)
      addTask(frontendTask)
      
      sendMessage({
        type: 'TASK_CREATED',
        data: {
          id: backendTask.id,
          title: backendTask.title,
          description: backendTask.description,
          priority: backendTask.priority,
          ownerName: 'Você'
        }
      })
      
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    }
  })
}

export function useUpdateTask() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const { updateTask } = useTaskStore()
  const { sendMessage } = useWebSocket() 
  
  return useMutation({
    mutationFn: async (data: UpdateTaskData): Promise<BackendTask> => {
      const { id, ...updateFields } = data
      
      const backendData: any = {
        title: updateFields.title,
        description: updateFields.description,
        status: updateFields.status ? mapStatusToBackend(updateFields.status) : undefined,
        priority: updateFields.priority ? mapPriorityToBackend(updateFields.priority) : undefined,
      }
      
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined) {
          delete backendData[key]
        }
      })
      
      console.log('🔄 BACKEND DATA (sem ID):', backendData) 
      
      const result = await apiService.updateTask(id, backendData, token!)
      return result as BackendTask
    },
    onSuccess: (backendTask: BackendTask) => {
      const frontendTask = convertBackendToFrontend(backendTask)
      updateTask(frontendTask.id, frontendTask)
      
      sendMessage({
        type: 'TASK_UPDATED',
        data: {
          id: backendTask.id,
          title: backendTask.title,
          status: backendTask.status
        }
      })
      
      queryClient.setQueryData(taskKeys.detail(frontendTask.id), backendTask)
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    }
  })
}

export function useDeleteTask() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const { deleteTask } = useTaskStore()
  const { sendMessage } = useWebSocket()
  
  return useMutation({
    mutationFn: (taskId: string) => apiService.deleteTask(taskId, token!),
    onSuccess: (_, taskId) => {
      const deletedTask = useTaskStore.getState().tasks.find(t => t.id === taskId)
      
      deleteTask(taskId)
      
      if (deletedTask) {
        sendMessage({
          type: 'TASK_DELETED',
          data: {
            id: taskId,
            title: deletedTask.title
          }
        })
      }
      
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    }
  })
}

export type { FrontendTask as Task, BackendTask }