import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('tasks.create')
  async create(@Payload() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern('tasks.findAll')
  async findAll(@Payload() data: { page?: number; size?: number; userId?: string }) {
    return this.tasksService.findAll(data.page, data.size, data.userId);
  }

  @MessagePattern('tasks.findOne')
  async findOne(@Payload() id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern('tasks.update')
  async update(@Payload() data: { id: string; updateTaskDto: UpdateTaskDto; userId: string }) {
    return this.tasksService.update(data.id, data.updateTaskDto, data.userId);
  }

  @MessagePattern('tasks.remove')
  async remove(@Payload() data: { id: string; userId: string }) {
    return this.tasksService.remove(data.id, data.userId);
  }

  @MessagePattern('tasks.createComment')
  async createComment(@Payload() createCommentDto: CreateCommentDto) {
    return this.tasksService.createComment(createCommentDto);
  }

  @MessagePattern('tasks.findComments')
  async findComments(@Payload() data: { taskId: string; page?: number; size?: number }) {
    return this.tasksService.findComments(data.taskId, data.page, data.size);
  }

  @MessagePattern('tasks.updateComment')
  async updateComment(@Payload() data: { commentId: string; content: string; userId: string }) {
    return this.tasksService.updateComment(data.commentId, data.content, data.userId);
  }

  @MessagePattern('tasks.deleteComment')
  async deleteComment(@Payload() data: { commentId: string; userId: string }) {
    return this.tasksService.deleteComment(data.commentId, data.userId);
  }
}