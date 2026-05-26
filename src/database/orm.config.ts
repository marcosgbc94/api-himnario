import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Este archivo debe estar en la raíz del proyecto (src/database/ormconfig.ts) para que TypeORM pueda encontrarlo fácilmente.
export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['./src/**/*.entity.ts'],
  migrations: ['./src/database/migrations/*.ts'],
  synchronize: false,
});
