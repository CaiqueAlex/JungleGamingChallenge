import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useTask } from '../hooks/useTasks'
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../hooks/useComments'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Textarea } from '../components/ui/textarea'
import { ArrowLeft, MessageSquare, Calendar, User, Send, Edit, Trash2, X, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCommentSchema, type CreateCommentData } from '../lib/schemas'
import { useAuth } from '../contexts/AuthContext'
import { z } from 'zod'

const taskDetailSearchSchema = z.object({
  id: z.string()
})

export const Route = createFileRoute('/task-detail')({
  component: TaskDetail,
  validateSearch: taskDetailSearchSchema
})

function TaskDetail() {
  const { id: taskId } = Route.useSearch()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: task, isLoading: taskLoading, error: taskError } = useTask(taskId)
  const { data: comments = [], isLoading: commentsLoading } = useComments(taskId)
  const createCommentMutation = useCreateComment()
  const updateCommentMutation = useUpdateComment()
  const deleteCommentMutation = useDeleteComment()

  // Estados para edição inline
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string>('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCommentData>({
    resolver: zodResolver(createCommentSchema)
  })

  console.log('🎯 TASK DETAIL:', { taskId, task, comments })

  const mapStatusFromBackend = (status: string) => {
    const mapping: Record<string, string> = {
      'TODO': '📋 Pendente',
      'IN_PROGRESS': '⚡ Em Progresso', 
      'DONE': '✅ Concluído'
    }
    return mapping[status] || status
  }

  const mapPriorityFromBackend = (priority: string) => {
    const mapping: Record<string, { label: string; color: string }> = {
      'LOW': { label: '🟢 Baixa', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
      'MEDIUM': { label: '🟡 Média', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
      'HIGH': { label: '🟠 Alta', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
      'URGENT': { label: '🔴 Urgente', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
    }
    return mapping[priority] || { label: priority, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
  }

  const onSubmitComment = async (data: CreateCommentData) => {
    try {
      await createCommentMutation.mutateAsync({
        taskId,
        content: data.content
      })
      
      toast.success('Comentário adicionado! 💬')
      reset()
    } catch (error) {
      console.error('❌ COMMENT ERROR:', error)
      toast.error('Erro ao adicionar comentário 😞')
    }
  }

  // ✏️ EDITAR COMENTÁRIO
  const startEditing = (commentId: string, content: string) => {
    console.log('🔧 START EDITING:', { commentId, content, taskId }) // DEBUG
    setEditingCommentId(commentId)
    setEditingContent(content)
  }

  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditingContent('')
  }

  const saveEdit = async (commentId: string) => {
    console.log('💾 SAVE EDIT:', { commentId, content: editingContent.trim(), taskId }) // DEBUG
    
    if (!editingContent.trim()) {
      toast.error('Comentário não pode estar vazio! 😅')
      return
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        content: editingContent.trim(),
        taskId // 🔥 GARANTIR QUE TASK ID ESTÁ SENDO PASSADO
      })
      
      toast.success('Comentário atualizado! ✏️')
      setEditingCommentId(null)
      setEditingContent('')
    } catch (error) {
      console.error('❌ UPDATE ERROR:', error)
      toast.error('Erro ao atualizar comentário 😞')
    }
  }

  // 🗑️ DELETAR COMENTÁRIO - CORRIGIDO
  const deleteComment = async (commentId: string) => {
    console.log('🗑️ DELETE COMMENT CALLED:', { commentId, taskId }) // DEBUG
    
    if (!confirm('🗑️ Tem certeza que deseja deletar este comentário?')) {
      return
    }

    // 🔥 VALIDAÇÃO DOS PARÂMETROS ANTES DA CHAMADA
    if (!commentId || !taskId) {
      console.error('❌ PARÂMETROS FALTANDO:', { commentId, taskId })
      toast.error('Erro: parâmetros inválidos')
      return
    }

    try {
      await deleteCommentMutation.mutateAsync({ 
        commentId, 
        taskId // 🔥 GARANTIR QUE TASK ID ESTÁ SENDO PASSADO
      })
      toast.success('Comentário deletado! 🗑️')
    } catch (error) {
      console.error('❌ DELETE ERROR:', error)
      toast.error('Erro ao deletar comentário 😞')
    }
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">⏳ Carregando tarefa...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (taskError || !task) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-white mb-4">Tarefa não encontrada</h2>
            <p className="text-gray-400 mb-6">ID: {taskId}</p>
            <Button onClick={() => navigate({ to: '/tasks' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às Tarefas
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  const priorityInfo = mapPriorityFromBackend(task.priority)

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ to: '/tasks' })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">🎯 DETALHES DA TAREFA</h1>
        </div>

        {/* Task Details */}
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-2xl mb-2">{task.title}</CardTitle>
                <p className="text-gray-300 text-base leading-relaxed">
                  {task.description}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {mapStatusFromBackend(task.status)}
                </Badge>
                <Badge className={priorityInfo.color}>
                  {priorityInfo.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Criado em: {new Date(task.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span>Owner: {task.ownerId?.slice(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-lg">Comentários</CardTitle>
              <Badge variant="outline" className="ml-auto">
                {comments.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form de novo comentário */}
            <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-3">
              <div>
                <Textarea
                  placeholder="Adicione um comentário..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                  rows={3}
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={createCommentMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
              </Button>
            </form>

            {/* Lista de comentários */}
            <div className="border-t border-white/10 pt-4">
              {commentsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro! 💬</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-3 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {comment.authorName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">
                                {comment.authorName || user?.username || 'Usuário'}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(comment.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            
                            {/* 🔧 BOTÕES DE AÇÃO - só aparecem se for do usuário atual */}
                            {(comment.userId === user?.id || comment.authorId === user?.id) && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(comment.id, comment.content)}
                                  disabled={editingCommentId === comment.id}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteComment(comment.id)} // 🔥 PASSAR SÓ O COMMENT ID
                                  disabled={deleteCommentMutation.isPending}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* 📝 CONTEÚDO DO COMENTÁRIO ou EDITOR */}
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="bg-white/10 border-white/20 text-white text-sm resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(comment.id)} // 🔥 PASSAR SÓ O COMMENT ID
                                  disabled={updateCommentMutation.isPending || !editingContent.trim()}
                                  className="h-6 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Salvar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="h-6 text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}