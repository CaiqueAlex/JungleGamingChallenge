import {
  ViewEntity,
  DataSource,
  ViewColumn,
  OneToMany,
} from 'typeorm';
import { TaskAssignee } from './task-assignee.entity';

@ViewEntity({
  name: 'users_view',
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('"id"')
      .addSelect('"email"')
      .addSelect('"username"')
      .addSelect('"createdAt"')
      .addSelect('"updatedAt"')
      .from('users', 'users'),
})
export class User {
  @ViewColumn()
  id: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  username: string;

  @ViewColumn()
  createdAt: Date;

  @ViewColumn()
  updatedAt: Date;

  @OneToMany(() => TaskAssignee, (assignee) => assignee.user)
  assignedTasks: TaskAssignee[];
}