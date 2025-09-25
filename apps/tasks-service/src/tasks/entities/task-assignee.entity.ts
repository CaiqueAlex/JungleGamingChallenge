import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_assignees')
export class TaskAssignee {
  @PrimaryColumn({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Task, (task) => task.taskAssignees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  // @ManyToOne(() => User, (user) => user.assignedTasks, {
  //   createForeignKeyConstraints: false,
  // })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  user?: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
  };
}