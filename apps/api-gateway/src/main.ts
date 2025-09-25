import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validação
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Swagger Configs
  const config = new DocumentBuilder()
    .setTitle('Jungle Gaming - Task Management API')
    .setDescription('API para sistema de gestão de tarefas colaborativo')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('tasks', 'Gestão de tarefas')
    .addTag('comments', 'Comentários em tarefas')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  
  console.log(`API Gateway is running on: http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
}
bootstrap();