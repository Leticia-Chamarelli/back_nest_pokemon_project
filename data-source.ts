import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION as 'mysql',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '3306'),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: ['dist/src/**/*.entity.js'],   
  migrations: ['dist/src/migrations/*.js'], 
  synchronize: false,
});
