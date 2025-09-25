import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Plus, ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { TaskFilters } from '../components/TaskFilters'
import { TaskCard } from '../components/TaskCard'
import { TaskFormModal } from '../components/TaskFormModal'
import { NotificationBell } from '../components/NotificationBell'
import { WebSocketStatus } from '../components/WebSocketStatus'
import { useTasks, useDeleteTask } from '../hooks/useTasks'
import { useTaskStore } from '../stores/taskStore'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Task } from '../stores/taskStore'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})

function TasksPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isLoading, error } = useTasks()
  const { filteredTasks } = useTaskStore()
  const deleteTaskMutation = useDeleteTask()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-300 mb-6">
              Você precisa estar logado para acessar suas tarefas.
            </p>
            <Button onClick={() => navigate({ to: '/login' })}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await deleteTaskMutation.mutateAsync(id)
        toast.success('Tarefa deletada com sucesso! 🗑️')
      } catch (error) {
        toast.error('Erro ao deletar tarefa 😞')
      }
    }
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Minhas Tarefas
              </h1>
              <p className="text-gray-300">
                {filteredTasks().length} tarefa(s) encontrada(s)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <WebSocketStatus />
            <NotificationBell />
            <TaskFormModal
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              }
            />
          </div>
        </div>

        {/* Filters */}
        <TaskFilters />

        {/* Content */}
        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-400 mb-4">Erro ao carregar tarefas</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 border-white/20">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : filteredTasks().length === 0 ? (
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-gray-300 mb-6">
                  Comece criando sua primeira tarefa!
                </p>
                <TaskFormModal
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Tarefa
                    </Button>
                  }
                />
              </motion.div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTasks().map((taskItem, index) => (
                <motion.div
                  key={taskItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard
                    task={taskItem}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Modal */}
        {editingTask && (
          <TaskFormModal
            key={editingTask.id}
            task={editingTask}
            trigger={null}
            onClose={() => setEditingTask(null)} 
          />
        )}
      </motion.div>
    </div>
  )
}