import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: string,
    type: string,
    title: string,
    content: string,
    metadata?: any
  ): Promise<Notification> {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      content,
      metadata,
      read: false,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    
    this.gateway.sendNotificationToUser(userId, {
      id: savedNotification.id,
      type: savedNotification.type,
      title: savedNotification.title,
      content: savedNotification.content,
      metadata: savedNotification.metadata,
      timestamp: savedNotification.createdAt,
      read: false
    });

    this.logger.log(`✅ Notificação criada para user: ${userId}`);
    return savedNotification;
  }

  async createNotificationForMultipleUsers(
    userIds: string[],
    type: string,
    title: string,
    content: string,
    metadata?: any
  ): Promise<Notification[]> {
    if (!userIds.length) return [];

    const validUserIds = userIds.filter(id => id && id.trim());
    
    if (!validUserIds.length) {
      this.logger.warn('Nenhum userId válido fornecido');
      return [];
    }

    const notifications = validUserIds.map(userId =>
      this.notificationRepository.create({
        userId,
        type,
        title,
        content,
        metadata,
        read: false,
      }),
    );

    const savedNotifications = await this.notificationRepository.save(notifications);
    
    const notificationData = savedNotifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content,
      metadata: n.metadata,
      timestamp: n.createdAt,
      read: false
    }));

    this.gateway.sendNotificationToUsers(validUserIds, {
      type: 'notification.new',
      notifications: notificationData,
    });

    this.logger.log(`✅ ${savedNotifications.length} notificações criadas para users: ${validUserIds.join(', ')}`);
    return savedNotifications;
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      notifications,
      total,
      unreadCount: await this.getUnreadCount(userId),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) return null;

    notification.read = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
    return result.affected > 0;
  }
}