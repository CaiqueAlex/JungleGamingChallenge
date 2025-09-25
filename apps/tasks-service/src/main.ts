import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const logger = new Logger('TasksService-Main')

async function bootstrap() {
  logger.log('🔥 Configurando microservice RabbitMQ...')
  
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    }
  })

  const configService = app.get(ConfigService)

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@rabbitmq:5672'
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl] as string[],
      queue: 'tasks_queue', 
      queueOptions: {
        durable: true, 
      },
    },
  })

  logger.log('🔥 Iniciando microservices...')
  await app.startAllMicroservices()
  logger.log('✅ Microservices iniciados com sucesso!')

  const port = configService.get<number>('TASKS_PORT') || 3003 
  await app.listen(port)
  
  logger.log(`🚀 Tasks Service rodando na porta ${port}`)
  logger.log(`📚 Swagger disponível em http://localhost:${port}/api/docs`)
  logger.log(`🔗 RabbitMQ conectado em: ${rabbitmqUrl}`)
  logger.log('🔥 Aguardando eventos do RabbitMQ na queue: tasks_queue')
}

bootstrap()