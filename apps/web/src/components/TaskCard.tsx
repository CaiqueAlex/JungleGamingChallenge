import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { Task } from '../stores/taskStore'
import { motion } from 'framer-motion'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30'
}

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  urgent: 'bg-red-600/30 text-red-300 border-red-600/40'
}

const statusLabels = {
  pending: '📋 Pendente',
  in_progress: '⚡ Em Progresso', 
  completed: '✅ Concluído'
}

const priorityLabels = {
  low: '🟢 Baixa',
  medium: '🟡 Média',
  high: '🟠 Alta',
  urgent: '🔴 Urgente'
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewDetails = () => {
    console.log('🔍 NAVEGANDO PARA DETALHES COM QUERY:', task.id)
    navigate({ 
      to: '/task-detail',
      search: { id: task.id }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="hover:bg-white/5 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white truncate flex-1 mr-2">
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}> {/* 🔥 USAR ONCLICK */}
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onEdit(task)}
                  disabled={isDeleting}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-400"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          <div className="text-xs text-gray-400">
            Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}