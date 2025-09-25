import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { Gamepad2, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react"
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from "../contexts/AuthContext"

export const Route = createFileRoute('/register')({
  component: Register,
})

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password) {
      setError("Preencha todos os campos")
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      await register(name, email, password)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
      console.error('Register error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 blur-xl" />
          
          <CardHeader className="text-center relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center"
            >
              <Gamepad2 className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Junte-se à aventura! 🚀
            </h1>
            <p className="text-gray-300">
              Crie sua conta e comece a jornada
            </p>
          </CardHeader>

          <CardContent className="relative space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center space-x-2 text-red-400"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </motion.div>

              {/* Email */}
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </motion.div>

              {/* Password */}
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Criando conta...</span>
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="text-center">
              <button 
                onClick={() => navigate({ to: '/login' })}
                className="text-green-400 hover:text-green-300 text-sm transition-colors"
              >
                Já tem conta? <span className="underline">Faça login</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}