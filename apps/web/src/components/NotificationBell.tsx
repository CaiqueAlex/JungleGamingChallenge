import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuHeader,
  DropdownMenuItem, 
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { useNotifications } from '../hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'

const typeIcons = {
  success: '✅',
  error: '❌', 
  info: 'ℹ️',
  warning: '⚠️'
}

const typeColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400', 
  warning: 'text-yellow-400'
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date().getTime()
  const time = new Date(timestamp).getTime()
  const diff = Math.floor((now - time) / 1000)
  
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearNotifications 
  } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-800">
        <DropdownMenuHeader className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">Notificações</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-gray-400 hover:text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                Marcar todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="text-xs text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </DropdownMenuHeader>

        <ScrollArea className="max-h-96">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DropdownMenuItem 
                    className={`flex items-start gap-3 p-4 cursor-pointer border-l-2 ${
                      !notification.read 
                        ? 'bg-gray-800/50 border-l-blue-500' 
                        : 'border-l-transparent'
                    } hover:bg-gray-800`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span className={typeColors[notification.type]}>
                        {typeIcons[notification.type]}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm leading-tight">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-gray-400 text-xs mt-1 leading-tight">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="flex-shrink-0 w-6 h-6 p-0 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </DropdownMenuItem>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}