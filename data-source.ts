import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './src/users/user.entity';
import { CapturedPokemon } from './src/pokemons/captured-pokemon.entity';
import { SightedPokemon } from './src/pokemons/sighted-pokemon.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, CapturedPokemon, SightedPokemon],
  migrations: [
    process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts',
  ],
  synchronize: false,
});
