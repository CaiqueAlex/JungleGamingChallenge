import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  Query,
  Req, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  async list(
    @Req() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.service.getUserNotifications(req.user.sub, limit, offset);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contador de notificações não lidas' })
  async unreadCount(@Req() req: any) {
    const count = await this.service.getUnreadCount(req.user.sub);
    return { unreadCount: count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markRead(@Param('id') id: string, @Req() req: any) {
    const result = await this.service.markAsRead(id, req.user.sub);
    if (!result) {
      return { message: 'Notificação não encontrada' };
    }
    return { message: 'Notificação marcada como lida', notification: result };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async markAllRead(@Req() req: any) {
    await this.service.markAllAsRead(req.user.sub);
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar notificação' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const deleted = await this.service.deleteNotification(id, req.user.sub);
    if (!deleted) {
      return { message: 'Notificação não encontrada' };
    }
    return { message: 'Notificação deletada com sucesso' };
  }
}