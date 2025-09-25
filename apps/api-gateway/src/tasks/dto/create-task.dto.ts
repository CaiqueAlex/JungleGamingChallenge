import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @ApiPropertyOptional({ description: 'Due date in ISO format' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Array of user IDs to assign', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[];
}