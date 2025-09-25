import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { TaskHistory } from './entities/task-history.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskAssignee } from './entities/task-assignee.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(TaskHistory)
    private historyRepository: Repository<TaskHistory>,
    @InjectRepository(TaskAssignee)
    private taskAssigneeRepository: Repository<TaskAssignee>,
    @Inject('NOTIFICATIONS_CLIENT')
    private notificationsClient: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { assigneeIds, ...taskData } = createTaskDto;

    const task = this.taskRepository.create(taskData);
    const savedTask = await this.taskRepository.save(task);

    if (assigneeIds && assigneeIds.length > 0) {
      const newAssignees = assigneeIds.map((id) =>
        this.taskAssigneeRepository.create({ taskId: savedTask.id, userId: id }),
      );
      await this.taskAssigneeRepository.save(newAssignees);
    }

    await this.createHistory(savedTask.id, savedTask.ownerId, 'created', {
      task: savedTask,
    });

    try {
      this.notificationsClient.emit('task.created', {
        taskId: savedTask.id,
        ownerId: savedTask.ownerId,
        assigneeIds: assigneeIds || [],
        title: savedTask.title,
      });
    } catch (error) {
      console.error('❌ Failed to send task.created notification:', error);
    }

    return this.findOne(savedTask.id);
  }

  async findAll(page: number = 1, size: number = 10, userId?: string) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.taskAssignees', 'taskAssignee')
      .leftJoinAndSelect('task.comments', 'comment')
      .orderBy('task.createdAt', 'DESC');

    if (userId) {
      query.where('task.ownerId = :userId OR taskAssignee.userId = :userId', { userId });
    }

    const [tasks, total] = await query
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    for (const task of tasks) {
      if (task.taskAssignees && task.taskAssignees.length > 0) {
        const userIds = task.taskAssignees.map(ta => ta.userId);
        
        const users = await this.taskRepository.manager
          .createQueryBuilder()
          .select([
            'id',
            'email', 
            'username',
            '"createdAt"',
            '"updatedAt"'
          ])
          .from('users', 'users')
          .where('users.id IN (:...userIds)', { userIds })
          .getRawMany();

        task.taskAssignees = task.taskAssignees.map(assignee => ({
          ...assignee,
          user: users.find(user => user.id === assignee.userId)
        }));
      }
    }

    return {
      data: tasks,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['taskAssignees', 'comments', 'history'],
    });

    if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.taskAssignees && task.taskAssignees.length > 0) {
        const userIds = task.taskAssignees.map(ta => ta.userId);
        
        const users = await this.taskRepository.manager
        .createQueryBuilder()
        .select([
            'id',
            'email', 
            'username',
            '"createdAt"',
            '"updatedAt"'
        ])
        .from('users', 'users')
        .where('users.id IN (:...userIds)', { userIds })
        .getRawMany();

        task.taskAssignees = task.taskAssignees.map(assignee => ({
        ...assignee,
        user: users.find(user => user.id === assignee.userId)
        }));
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    const previousStatus = task.status;
    const { assigneeIds, ...updateData } = updateTaskDto;

    const changes: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (task[key] !== updateData[key]) {
        changes[key] = { from: task[key], to: updateData[key] };
      }
    });

    if (assigneeIds !== undefined) {
      const currentAssigneeIds = task.taskAssignees.map((ta) => ta.userId);
      const toAdd = assigneeIds.filter((newId) => !currentAssigneeIds.includes(newId));
      const toRemove = currentAssigneeIds.filter((oldId) => !assigneeIds.includes(oldId));

      if (toRemove.length > 0) {
        await this.taskAssigneeRepository.delete({ taskId: id, userId: In(toRemove) });
      }

      if (toAdd.length > 0) {
        const newAssignees = toAdd.map((newId) =>
          this.taskAssigneeRepository.create({ taskId: id, userId: newId }),
        );
        await this.taskAssigneeRepository.save(newAssignees);
      }

      if (toAdd.length > 0 || toRemove.length > 0) {
        changes.assignees = { from: currentAssigneeIds, to: assigneeIds };
      }
    }

    Object.assign(task, updateData);
    await this.taskRepository.save(task);

    const updatedTask = await this.findOne(id);

    if (Object.keys(changes).length > 0) {
      await this.createHistory(task.id, userId, 'updated', changes);

      try {
        this.notificationsClient.emit('task.updated', {
          taskId: updatedTask.id,
          userId,
          changes,
          assigneeIds: updatedTask.taskAssignees.map(ta => ta.userId),
        });

        if (previousStatus !== updatedTask.status) {
          this.notificationsClient.emit('task.status.changed', {
            taskId: updatedTask.id,
            userId,
            previousStatus,
            newStatus: updatedTask.status,
            assigneeIds: updatedTask.taskAssignees.map(ta => ta.userId),
          });
        }
      } catch (error) {
        console.error('❌ Failed to send task update notifications:', error);
      }
    }

    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    let task;
    try {
      task = await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: 'Task already deleted or does not exist' };
      }
      throw error;
    }

    try {
      this.notificationsClient.emit('task.deleted', {
        taskId: id,
        userId,
        title: task.title,
        assigneeIds: task.taskAssignees.map(ta => ta.userId),
      });
    } catch (error) {
      console.error('❌ Failed to send task.deleted notification:', error);
    }

    await this.taskRepository.remove(task);
    
    return { message: 'Task deleted successfully' };
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const task = await this.findOne(createCommentDto.taskId);

    const comment = this.commentRepository.create(createCommentDto);
    const savedComment = await this.commentRepository.save(comment);

    await this.createHistory(
      task.id,
      createCommentDto.userId,
      'comment_added',
      { commentId: savedComment.id, content: savedComment.content }
    );

    try {
      this.notificationsClient.emit('task.comment.created', {
        taskId: task.id,
        commentId: savedComment.id,
        userId: createCommentDto.userId,
        content: savedComment.content,
        assigneeIds: task.taskAssignees.map(ta => ta.userId),
        ownerId: task.ownerId,
      });
    } catch (error) {
      console.error('❌ Failed to send task.comment.created notification:', error);
    }

    return savedComment;
  }

  async findComments(taskId: string, page: number = 1, size: number = 10) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      data: comments,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async updateComment(commentId: string, content: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only update your own comments');
    }

    comment.content = content;
    const updatedComment = await this.commentRepository.save(comment);

    await this.createHistory(
      comment.taskId,
      userId,
      'comment_updated',
      { commentId, oldContent: comment.content, newContent: content }
    );

    try {
      this.notificationsClient.emit('task.comment.updated', {
        taskId: comment.taskId,
        commentId,
        userId,
        content,
      });
    } catch (error) {
      console.error('❌ Failed to send task.comment.updated notification:', error);
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    const taskId = comment.taskId;
    const content = comment.content;

    await this.commentRepository.remove(comment);

    await this.createHistory(
      taskId,
      userId,
      'comment_deleted',
      { commentId, content }
    );

    try {
      this.notificationsClient.emit('task.comment.deleted', {
        taskId,
        commentId,
        userId,
      });
    } catch (error) {
      console.error('❌ Failed to send task.comment.deleted notification:', error);
    }

    return { message: 'Comment deleted successfully' };
  }

  private async createHistory(
    taskId: string,
    userId: string,
    action: string,
    changes: Record<string, any>
  ): Promise<TaskHistory> {
    const history = this.historyRepository.create({
      taskId,
      userId,
      action,
      changes,
    });

    return this.historyRepository.save(history);
  }
}