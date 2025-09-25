import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'mfc'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [
    NotificationsController,
    NotificationsConsumer,
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}