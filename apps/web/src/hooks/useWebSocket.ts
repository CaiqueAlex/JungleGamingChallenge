import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from './useNotifications'
import { io, Socket } from 'socket.io-client'

interface WebSocketMessage {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'TASK_COMMENT' | 'USER_NOTIFICATION'
  data: any
  userId?: string
  timestamp: string
}

export function useWebSocket() {
  const { user, token, isAuthenticated } = useAuth()
  const { addSuccess, addError, addInfo } = useNotifications()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const isConnecting = useRef(false)
  const maxReconnectAttempts = 3

  const connect = () => {
    if (!isAuthenticated || !token || !user?.id) {
      return
    }

    if (socketRef.current?.connected || isConnecting.current) {
      return 
    }

    try {
      isConnecting.current = true 
      setConnectionStatus('connecting')
      console.log('🔌 WebSocket: Connecting...')
      
      const socket = io('http://localhost:3004', {
        auth: { token },
        query: { 
          token,
          userId: user.id 
        },
        transports: ['websocket'],
        forceNew: true,
        timeout: 5000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        isConnecting.current = false 
        console.log('✅ WebSocket: Connected!')
      })

      socket.on('notification', (message: WebSocketMessage) => {
        handleMessage(message)
      })

      socket.on('disconnect', (reason) => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        isConnecting.current = false 
        console.log(`❌ WebSocket: Disconnected: ${reason}`)
        
        if (isAuthenticated && reason !== 'io client disconnect' && reason !== 'io server disconnect') {
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const timeout = 2000 + (reconnectAttempts.current * 1000)
            console.log(`🔄 WebSocket: Reconnecting in ${timeout}ms...`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current += 1
              connect()
            }, timeout)
          }
        }
      })

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket: Connection error:', error)
        setConnectionStatus('error')
        isConnecting.current = false 
      })

    } catch (error) {
      console.error('❌ WebSocket: Failed to create connection:', error)
      setConnectionStatus('error')
      isConnecting.current = false 
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
    isConnecting.current = false
    console.log('🔌 WebSocket: Disconnected')
  }

  const handleMessage = (message: WebSocketMessage) => {
    const { type, data } = message

    switch (type) {
      case 'TASK_CREATED':
        addSuccess(
          `🆕 Nova tarefa: "${data.title}"`, 
          `Por ${data.ownerName || 'Usuário'}`,
          { taskId: data.id }
        )
        break

      case 'TASK_UPDATED':
        addInfo(
          `✏️ Tarefa atualizada: "${data.title}"`, 
          `Status: ${data.status}`,
          { taskId: data.id }
        )
        break

      case 'TASK_DELETED':
        addError(
          `🗑️ Tarefa deletada: "${data.title}"`, 
          'Tarefa removida do sistema',
          { taskId: data.id }
        )
        break

      case 'TASK_COMMENT':
        addInfo(
          `💬 Novo comentário em "${data.taskTitle}"`, 
          `${data.authorName}: ${data.content.substring(0, 50)}...`,
          { taskId: data.taskId }
        )
        break

      case 'USER_NOTIFICATION':
        addInfo(data.title, data.message, data.data)
        break

      default:
        console.log('📨 Unknown message type:', type)
    }
  }

  const sendMessage = (message: Partial<WebSocketMessage>) => {
    if (socketRef.current?.connected) {
      const fullMessage = {
        ...message,
        userId: user?.id,
        timestamp: new Date().toISOString()
      }
      socketRef.current.emit('message', fullMessage)
      return true
    } else {
      console.warn('⚠️ WebSocket: Cannot send message, not connected')
      return false
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.id && token && !socketRef.current?.connected && !isConnecting.current) {
      connect()
    } else if (!isAuthenticated) {
      disconnect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [isAuthenticated, user?.id, token])

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
  }
}