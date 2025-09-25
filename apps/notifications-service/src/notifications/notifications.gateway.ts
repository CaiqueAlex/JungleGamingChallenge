import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class NotificationsGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationsGateway.name)
  private connectedUsers = new Map<string, Socket>()

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Server initialized')
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.query.token as string
      const userId = client.handshake.query.userId as string

      this.logger.log(`🔌 Client attempting connection: ${client.id}`)
      
      if (!token) {
        this.logger.warn('❌ No token provided')
        client.disconnect()
        return
      }

      // Verificar JWT
      const payload = this.jwtService.verify(token)
      
      if (payload.sub !== userId) {
        this.logger.warn('❌ Invalid user ID')
        client.disconnect()
        return
      }

      this.connectedUsers.set(userId, client)
      client.data.userId = userId
      client.data.user = payload

      this.logger.log(`✅ User ${payload.username} connected: ${client.id}`)
      
      await client.join(`user:${userId}`)

      client.emit('connected', {
        message: 'WebSocket connection established',
        userId: userId
      })

    } catch (error) {
      this.logger.error('❌ Connection error:', error.message)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId
    if (userId) {
      this.connectedUsers.delete(userId)
      this.logger.log(`🔌 User ${userId} disconnected: ${client.id}`)
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification)
  }

  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit('notification', notification)
    })
  }

  broadcastNotification(notification: any) {
    this.server.emit('notification', notification)
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() })
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log('📨 Message received:', data)
  }
}