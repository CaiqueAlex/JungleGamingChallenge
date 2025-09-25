import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';
import { Comment } from './tasks/entities/comment.entity';
import { TaskAssignee } from './tasks/entities/task-assignee.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'db'),
        port: configService.get('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'password'), 
        database: configService.get('POSTGRES_DB', 'jungle_challenge'), 
        entities: [Task, Comment, TaskAssignee],
        synchronize: true, //Criar tabelas automaticamente
        logging: true,
        autoLoadEntities: true,
      }),
    }),
    TasksModule,
  ],
})
export class AppModule {}