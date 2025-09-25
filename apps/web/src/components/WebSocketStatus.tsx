import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { motion } from 'framer-motion'
import { useWebSocket } from '../hooks/useWebSocket'

export function WebSocketStatus() {
  const { connectionStatus } = useWebSocket()

  const statusConfig = {
    connected: {
      icon: Wifi,
      label: 'Conectado',
      className: 'bg-green-500/10 text-green-400 border-green-500/20',
      animate: { scale: [1, 1.05, 1] }
    },
    connecting: {
      icon: Loader2,
      label: 'Conectando...',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      animate: { rotate: 360 }
    },
    disconnected: {
      icon: WifiOff,
      label: 'Desconectado', 
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      animate: {}
    },
    error: {
      icon: WifiOff,
      label: 'Erro',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      animate: { x: [-2, 2, -2, 2, 0] }
    }
  }

  const config = statusConfig[connectionStatus]
  const Icon = config.icon

  return (
    <motion.div
      animate={config.animate}
      transition={{ 
        duration: connectionStatus === 'connecting' ? 1 : 0.3,
        repeat: connectionStatus === 'connecting' ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      <Badge className={`${config.className} flex items-center gap-1.5 text-xs`}>
        <Icon className={`w-3 h-3 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    </motion.div>
  )
}