import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Search, X } from 'lucide-react'
import { useTaskStore } from '../stores/taskStore'

export function TaskFilters() {
  const { filters, setFilters, clearFilters } = useTaskStore()

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar tarefas..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => setFilters({ status: value })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="in_progress">Em Progresso</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority}
        onValueChange={(value) => setFilters({ priority: value })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="low">Baixa</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}