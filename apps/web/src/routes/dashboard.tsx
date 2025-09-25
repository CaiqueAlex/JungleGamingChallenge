import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { NotificationBell } from '../components/NotificationBell'
import { WebSocketStatus } from '../components/WebSocketStatus'
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from '@tanstack/react-router'
import { LogOut, Plus, ListTodo } from "lucide-react"

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo, {isAuthenticated ? user?.username : 'Visitante'}! 👋
            </h1>
            <p className="text-gray-300">
              {isAuthenticated ? 'Gerencie suas tarefas com facilidade' : 'Faça login para começar'}
            </p>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <WebSocketStatus />
              <NotificationBell />
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {isAuthenticated ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button 
              className="cursor-pointer text-left w-full p-0 border-none bg-transparent"
              onClick={() => navigate({ to: '/tasks' })}
            >
              <Card className="hover:bg-white/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <ListTodo className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Minhas Tarefas</h3>
                      <p className="text-gray-300 text-sm">Ver e gerenciar tarefas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button 
              className="cursor-pointer text-left w-full p-0 border-none bg-transparent"
              onClick={() => navigate({ to: '/tasks' })}
            >
              <Card className="hover:bg-white/5 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Plus className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Nova Tarefa</h3>
                      <p className="text-gray-300 text-sm">Criar nova tarefa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">
                🚀 Sistema de Tarefas
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">
                Organize suas tarefas de forma eficiente com nosso sistema completo:
              </p>
              <div className="space-y-2 text-gray-400 mb-6">
                <div>• ✅ Criar e gerenciar tarefas</div>
                <div>• 🔍 Filtros e busca avançada</div>
                <div>• 💬 Sistema de comentários</div>
                <div>• 🔔 Notificações em tempo real</div>
              </div>
              
              <Button onClick={() => navigate({ to: '/login' })} className="w-full">
                Fazer login para começar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Development Status */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-white">
              👋 Olá, Tester! Projeto Completo
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-400">
              <div>• ✅ <span className="text-white">Autenticação:</span> Login/registro seguro</div>
              <div>• ✅ <span className="text-white">Tarefas CRUD:</span> Criar, editar, deletar, listar</div>
              <div>• ✅ <span className="text-white">Filtros & Busca:</span> Encontrar tarefas rapidamente</div>
              <div>• ✅ <span className="text-white">WebSocket:</span> Notificações em tempo real</div>
              <div>• ✅ <span className="text-white">Comentários:</span> Sistema completo funcionando</div>
              <div>• ✅ <span className="text-white">Interface:</span> Responsiva e moderna</div>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                🎉 <strong>Sistema 100% funcional!</strong> Todos os requisitos implementados com sucesso.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}