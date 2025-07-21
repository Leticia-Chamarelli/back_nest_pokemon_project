import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PokeapiModule } from './pokeapi/pokeapi.module';
import { PokemonsModule } from './pokemons/pokemons.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      exclude: ['/sightings*', '/captured*', '/pokemons*', '/auth*', '/users*'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}` || '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          migrationsRun: isProduction,
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          ssl: isProduction
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
        };
      },
    }),
    UsersModule,
    AuthModule,
    PokeapiModule,
    PokemonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
