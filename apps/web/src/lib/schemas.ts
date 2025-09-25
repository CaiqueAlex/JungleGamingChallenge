import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

export const updateTaskSchema = createTaskSchema.partial()

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentário é obrigatório')
    .max(300, 'Comentário deve ter no máximo 300 caracteres'),
})

export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type CreateCommentData = z.infer<typeof createCommentSchema>

export type FrontendTaskStatus = 'pending' | 'in_progress' | 'completed'
export type FrontendTaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type BackendTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type BackendTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface CreateTaskApiData {
  title: string
  description: string
  priority: BackendTaskPriority
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName?: string
  taskId: string
  createdAt: string
  updatedAt?: string
}