import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { ListTodo, Search, MessageCircle } from "lucide-react"
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  
  const features = [
    { icon: ListTodo, title: "Organização", desc: "Gerencie suas tarefas" },
    { icon: Search, title: "Busca Avançada", desc: "Encontre rapidamente" },
    { icon: MessageCircle, title: "Comentários", desc: "Colabore em equipe" }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex items-center justify-center min-h-screen p-4"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl w-full"
        >
          <Card gradient hover className="mb-8">
            <CardHeader className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center"
              >
                <ListTodo className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Task Manager
              </h1>
              
              <p className="text-xl text-gray-200 mb-8">
                Organize suas tarefas de forma inteligente
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
                  >
                    <feature.icon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => navigate({ to: '/login' })}
                >
                  Entrar
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full" 
                  onClick={() => navigate({ to: '/register' })}
                >
                  Criar conta
                </Button>
                <Button 
                  variant="ghost" 
                  size="default"
                  className="w-full" 
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  Explorar como visitante
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}