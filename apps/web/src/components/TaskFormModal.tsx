import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, type CreateTaskData, type CreateTaskApiData } from '../lib/schemas'
import { useCreateTask, useUpdateTask, type Task } from '../hooks/useTasks'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { 
  mapStatusFromBackend, 
  mapStatusToBackend,
  mapPriorityToBackend, 
  mapPriorityFromBackend 
} from '../lib/mappers'

interface TaskFormModalProps {
  trigger: React.ReactNode | null
  task?: Task | null
  onClose?: () => void 
}

export function TaskFormModal({ trigger, task, onClose }: TaskFormModalProps) {
  const [open, setOpen] = useState(!!task) 
  const { user } = useAuth()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const form = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium'
    }
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        status: task.status, 
        priority: task.priority 
      })
      setOpen(true)
    } else {
      form.reset({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      })
    }
  }, [task, form])

  const handleClose = () => {
    setOpen(false)
    form.reset()
    if (onClose) onClose() 
  }

  const onSubmit = async (data: CreateTaskData) => {
    try {
      console.log('📝 FRONTEND DATA:', data)
      
      if (!user?.id) {
        toast.error('Usuário não autenticado!')
        return
      }
      
      if (task) {
        const updateData = {
          id: task.id,
          title: data.title,
          description: data.description,
          status: data.status, 
          priority: data.priority 
        }
        
        console.log('✏️ UPDATING TASK:', updateData)
        
        await updateTaskMutation.mutateAsync(updateData)
        toast.success('Tarefa atualizada com sucesso! ✏️')
      } else {
        const apiData: CreateTaskApiData = {
          title: data.title,
          description: data.description,
          priority: mapPriorityToBackend(data.priority)
        }
        
        console.log('🚀 API DATA:', apiData)
        
        await createTaskMutation.mutateAsync(apiData)
        toast.success('Tarefa criada com sucesso! 🚀')
      }
      
      handleClose()
    } catch (error) {
      console.error('❌ SUBMIT ERROR:', error)
      toast.error(`Erro ao ${task ? 'atualizar' : 'criar'} tarefa 😞`)
    }
  }

  if (!trigger && !task) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {task ? '✏️ Editar Tarefa' : '🚀 Nova Tarefa'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {task ? 'Modifique os dados da tarefa abaixo.' : 'Preencha os dados para criar uma nova tarefa.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Título *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o título da tarefa..."
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva sua tarefa..."
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Status {task ? '*' : '(apenas visual)'}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="pending" className="text-white hover:bg-gray-700">
                        📋 Pendente
                      </SelectItem>
                      <SelectItem value="in_progress" className="text-white hover:bg-gray-700">
                        ⚡ Em Progresso
                      </SelectItem>
                      <SelectItem value="completed" className="text-white hover:bg-gray-700">
                        ✅ Concluído
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Prioridade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low" className="text-white hover:bg-gray-700">
                        🟢 Baixa
                      </SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-gray-700">
                        🟡 Média
                      </SelectItem>
                      <SelectItem value="high" className="text-white hover:bg-gray-700">
                        🟠 Alta
                      </SelectItem>
                      <SelectItem value="urgent" className="text-white hover:bg-gray-700">
                        🔴 Urgente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                onClick={handleClose} 
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="flex-1"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              >
                {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                  <>⏳ Salvando...</>
                ) : (
                  <>{task ? '✏️ Atualizar' : '🚀 Criar'}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}