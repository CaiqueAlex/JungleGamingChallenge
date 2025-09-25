// apps/tasks-service/ormconfig.js
module.exports = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'jungle_challenge',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations'
  }
};