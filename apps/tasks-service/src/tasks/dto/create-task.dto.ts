import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { TaskPriority } from '../../common/enums/task-priority.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds?: string[];

  @IsUUID('4')
  ownerId: string;
}