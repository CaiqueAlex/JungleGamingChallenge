import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create({
      ...createTaskDto,
      ownerId: req.user.sub || req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.findAll(page, size, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.remove(id, userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.createComment({
      ...createCommentDto,
      taskId,
      userId,
    });
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get task comments with pagination' })
  findComments(
    @Param('id') taskId: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.tasksService.findComments(taskId, page, size);
  }

  @Put(':taskId/comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() updateData: { content: string },
    @Request() req: any,
  ) {
    console.log('🔧 UPDATE COMMENT ROUTE CALLED:', { taskId, commentId, content: updateData.content });
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.updateComment(commentId, updateData.content, userId);
  }

  @Delete(':taskId/comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    console.log('🗑️ DELETE COMMENT ROUTE CALLED:', { taskId, commentId });
    const userId = req.user?.sub || req.user?.id;
    return this.tasksService.deleteComment(commentId, userId);
  }
}