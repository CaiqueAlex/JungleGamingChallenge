import { DataSource } from 'typeorm';
import * as path from 'path';
import { TaskAssignee } from './tasks/entities/task-assignee.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'jungle_challenge',
  entities: [
    TaskAssignee,
    path.join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});

if (!process.env.TYPEORM_CLI) {
  AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err);
    });
}