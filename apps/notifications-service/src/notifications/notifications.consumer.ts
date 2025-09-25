import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { Controller } from '@nestjs/common';

@Controller()
@Injectable()
export class NotificationsConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(private readonly notificationsService: NotificationsService) {
    this.logger.log('🚀 NotificationsConsumer construtor executado!');
  }

  async onModuleInit() {
    this.logger.log('🔥 NotificationsConsumer MODULE INIT - Handlers prontos!');
    this.logger.log('🔥 HANDLERS DISPONÍVEIS:');
    this.logger.log('   - task.created');
    this.logger.log('   - task.updated');  
    this.logger.log('   - task.status.changed');
    this.logger.log('   - task.comment.created');
    this.logger.log('   - task.deleted');
  }

  @EventPattern('task.created')
  async handleTaskCreated(@Payload() data: any) {
    this.logger.log(`🔥🔥🔥 TASK.CREATED HANDLER CHAMADO!`);
    this.logger.log(`🔥 DATA RECEBIDA: ${JSON.stringify(data)}`);
    
    try {
      const { taskId, ownerId, assigneeIds = [], title } = data;
      const usersToNotify = [ownerId, ...assigneeIds].filter(Boolean);

      this.logger.log(`🔥 USERS TO NOTIFY: ${JSON.stringify(usersToNotify)}`);

      const result = await this.notificationsService.createNotificationForMultipleUsers(
        usersToNotify, 
        'task.created',
        '📝 Nova Tarefa Criada',
        `A tarefa "${title}" foi criada e atribuída a você.`,
        { taskId, title }
      );

      this.logger.log(`🔥 SUCCESS: ${result.length} notificações criadas`);
      return { success: true, created: result.length };
    } catch (error) {
      this.logger.error(`🔥 ERRO: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('task.comment.created')
  async handleCommentCreated(@Payload() data: any) {
    this.logger.log(`🔥🔥🔥 TASK.COMMENT.CREATED HANDLER CHAMADO!`);
    this.logger.log(`🔥 DATA: ${JSON.stringify(data)}`);
    
    try {
      const { taskId, commentId, userId, content, assigneeIds = [], ownerId } = data;
      const usersToNotify = [ownerId, ...assigneeIds].filter(id => id !== userId); // N notificar quem comentou

      this.logger.log(`🔥 USERS TO NOTIFY: ${JSON.stringify(usersToNotify)}`);

      if (usersToNotify.length === 0) {
        this.logger.log('🔥 NENHUM USER PARA NOTIFICAR');
        return { success: true, created: 0 };
      }

      const result = await this.notificationsService.createNotificationForMultipleUsers(
        usersToNotify,
        'task.comment.created',
        '💬 Novo Comentário',
        `Novo comentário: "${content.substring(0, 50)}..."`,
        { taskId, commentId, content }
      );

      this.logger.log(`🔥 SUCCESS: ${result.length} notificações criadas`);
      return { success: true, created: result.length };
    } catch (error) {
      this.logger.error(`🔥 ERRO: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('task.updated')
  async handleTaskUpdated(@Payload() data: any) {
    this.logger.log(`🔥🔥🔥 TASK.UPDATED HANDLER CHAMADO!`);
    this.logger.log(`🔥 DATA: ${JSON.stringify(data)}`);
    
    try {
      const { taskId, userId, assigneeIds = [], changes } = data;

      const result = await this.notificationsService.createNotificationForMultipleUsers(
        assigneeIds,
        'task.updated',
        '✏️ Tarefa Atualizada', 
        `A tarefa foi atualizada: ${Object.keys(changes).join(', ')}`,
        { taskId, changes, updatedBy: userId }
      );

      this.logger.log(`🔥 SUCCESS: ${result.length} notificações criadas`);
      return { success: true, created: result.length };
    } catch (error) {
      this.logger.error(`🔥 ERRO: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('task.status.changed')
  async handleTaskStatusChanged(@Payload() data: any) {
    this.logger.log(`🔥🔥🔥 TASK.STATUS.CHANGED HANDLER CHAMADO!`);
    
    try {
      const { taskId, userId, previousStatus, newStatus, assigneeIds = [] } = data;

      const result = await this.notificationsService.createNotificationForMultipleUsers(
        assigneeIds,
        'task.status.changed',
        '🔄 Status da Tarefa Alterado',
        `Status mudou de "${previousStatus}" para "${newStatus}"`,
        { taskId, previousStatus, newStatus, changedBy: userId }
      );

      this.logger.log(`🔥 SUCCESS: ${result.length} notificações criadas`);
      return { success: true, created: result.length };
    } catch (error) {
      this.logger.error(`🔥 ERRO: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('task.deleted')
  async handleTaskDeleted(@Payload() data: any) {
    this.logger.log(`🔥🔥🔥 TASK.DELETED HANDLER CHAMADO!`);
    
    try {
      const { taskId, userId, title, assigneeIds = [] } = data;

      const result = await this.notificationsService.createNotificationForMultipleUsers(
        assigneeIds,
        'task.deleted',
        '🗑️ Tarefa Removida',
        `A tarefa "${title}" foi removida`,
        { taskId, title, deletedBy: userId }
      );

      this.logger.log(`🔥 SUCCESS: ${result.length} notificações criadas`);
      return { success: true, created: result.length };
    } catch (error) {
      this.logger.error(`🔥 ERRO: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('test.ping')
  async handleTestPing(@Payload() data: any) {
    this.logger.log(`🎯 TEST PING RECEBIDO: ${JSON.stringify(data)}`);
    return { pong: true, timestamp: new Date() };
  }
}