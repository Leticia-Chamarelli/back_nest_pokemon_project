import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isCompiled = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

export const AppDataSource = new DataSource({
  type: 'postgres', 
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'
  ],
  migrations: [
    isCompiled ? 'dist/migrations/*.js' : 'src/migrations/*.ts'
  ],
  synchronize: false,
});
