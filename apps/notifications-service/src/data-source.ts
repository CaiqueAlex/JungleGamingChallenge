import { DataSource } from 'typeorm';
import { Notification } from './notifications/entities/notification.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'db',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'challenge',
  entities: [Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});