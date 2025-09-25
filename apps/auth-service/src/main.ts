import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService-Main');
  const rabbitmqUrl = process.env.RABBITMQ_URL;

  if (!rabbitmqUrl) {
    logger.error('RABBITMQ_URL environment variable is not defined!');
    throw new Error('RABBITMQ_URL environment variable is not defined!');
  }

  logger.log(`Attempting to connect to RabbitMQ...`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'auth_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen();
  logger.log('✅ Auth microservice is successfully listening on "auth_queue"');
}
bootstrap();