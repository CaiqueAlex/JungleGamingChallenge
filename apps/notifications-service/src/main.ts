import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Logger } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { ConfigService } from '@nestjs/config'

const logger = new Logger('NotificationsService-Main')

async function bootstrap() {
  logger.log('🔥 Configurando microservice RabbitMQ...')
  
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    }
  })

  app.useWebSocketAdapter(new IoAdapter(app))

  const configService = app.get(ConfigService)

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@rabbitmq:5672'
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  })

  logger.log('🔥 Iniciando microservices...')
  await app.startAllMicroservices()
  logger.log('✅ Microservices iniciados com sucesso!')

  const port = configService.get<number>('NOTIFICATIONS_PORT') || 3004
  await app.listen(port)
  
  logger.log(`🚀 Notifications Service rodando na porta ${port}`)
  logger.log(`📚 Swagger disponível em http://localhost:${port}/api/docs`)
  logger.log(`🔌 WebSocket disponível em http://localhost:${port}`)
  logger.log(`🔗 RabbitMQ conectado em: ${rabbitmqUrl}`) 
  logger.log('🔥 Aguardando eventos do RabbitMQ...')
}

bootstrap()