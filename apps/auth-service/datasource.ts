import 'reflect-metadata';
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,

  // --- CORREÇÃO FINAL DOS CAMINHOS ---
  // Caminhos relativos à raiz do pacote 'auth-service'
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/db/migrations/*{.ts,.js}'],
  // ------------------------------------

  synchronize: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;