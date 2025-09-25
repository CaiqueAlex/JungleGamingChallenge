import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { TaskHistory } from './entities/task-history.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, TaskHistory, TaskAssignee]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATIONS_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('RABBITMQ_URL') || 'amqp://admin:admin@rabbitmq:5672'] as string[],
            queue: 'notifications_queue',
            queueOptions: { durable: false },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}