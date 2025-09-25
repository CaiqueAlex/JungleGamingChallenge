import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';

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
        password: configService.get('POSTGRES_PASSWORD', 'password'), // 🔥 MUDANÇA
        database: configService.get('POSTGRES_DB', 'jungle_challenge'), // 🔥 MUDANÇA
        entities: [Notification],
        synchronize: true,
        logging: false,
        autoLoadEntities: true,
      }),
    }),
    NotificationsModule,
  ],
})
export class AppModule {}