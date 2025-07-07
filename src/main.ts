import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger';
import { join } from 'path'; 
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '../data-source'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === 'production') {
    try {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
      console.log('✅ Migrations executadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao rodar migrations:', error);
    }
  }

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
