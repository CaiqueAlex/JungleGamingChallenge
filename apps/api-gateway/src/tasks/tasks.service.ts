import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASKS_SERVICE') private tasksClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto & { ownerId: string }) {
    return lastValueFrom(
      this.tasksClient.send('tasks.create', createTaskDto)
    );
  }

  async findAll(page?: number, size?: number, userId?: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.findAll', { page, size, userId })
    );
  }

  async findOne(id: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.findOne', id)
    );
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.update', { id, updateTaskDto, userId })
    );
  }

  async remove(id: string, userId: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.remove', { id, userId })
    );
  }

  async createComment(createCommentDto: any) {
    return lastValueFrom(
      this.tasksClient.send('tasks.createComment', createCommentDto)
    );
  }

  async findComments(taskId: string, page?: number, size?: number) {
    return lastValueFrom(
      this.tasksClient.send('tasks.findComments', { taskId, page, size })
    );
  }

  async updateComment(commentId: string, content: string, userId: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.updateComment', { commentId, content, userId })
    );
  }

  async deleteComment(commentId: string, userId: string) {
    return lastValueFrom(
      this.tasksClient.send('tasks.deleteComment', { commentId, userId })
    );
  }
}