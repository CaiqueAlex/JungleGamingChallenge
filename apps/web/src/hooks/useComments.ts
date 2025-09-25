import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from './useWebSocket'
import type { CreateCommentData } from '../lib/schemas'

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName?: string
  userId: string
  taskId: string
  createdAt: string
  updatedAt?: string
}

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string) => [...commentKeys.lists(), taskId] as const,
}

export function useComments(taskId: string) {
  const { token } = useAuth()
  
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: async (): Promise<Comment[]> => {
      if (!token || !taskId) return []
      
      const response = await apiService.getTaskComments(taskId, token)
      console.log('💬 COMMENTS RESPONSE:', response)
      
      const comments = Array.isArray(response) ? response : (response.data || [])
      return comments
    },
    enabled: !!token && !!taskId,
    staleTime: 30 * 1000,
  })
}

export function useCreateComment() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const { sendMessage } = useWebSocket()
  
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }): Promise<Comment> => {
      const result = await apiService.createComment(taskId, content, token!)
      return result as Comment
    },
    onSuccess: (newComment: Comment, { taskId }) => {
      queryClient.setQueryData(commentKeys.list(taskId), (oldComments: Comment[] = []) => [
        newComment,
        ...oldComments
      ])
      
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
      
      sendMessage({
        type: 'TASK_COMMENT',
        data: {
          taskId,
          commentId: newComment.id,
          content: newComment.content,
          authorName: user?.username || 'Usuário',
          taskTitle: 'Tarefa'
        }
      })
    }
  })
}

export function useUpdateComment() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ commentId, content, taskId }: { 
      commentId: string, 
      content: string, 
      taskId: string 
    }): Promise<Comment> => {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar comentário')
      }
      
      return response.json()
    },
    onSuccess: (updatedComment, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
    }
  })
}

export function useDeleteComment() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ commentId, taskId }: { 
      commentId: string, 
      taskId: string 
    }): Promise<void> => {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao deletar comentário')
      }
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
    }
  })
}