import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_history')
export class TaskHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  taskId: string;

  @Column('uuid')
  userId: string;

  @Column()
  action: string;

  @Column('jsonb')
  changes: Record<string, any>;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @CreateDateColumn()
  createdAt: Date;
}