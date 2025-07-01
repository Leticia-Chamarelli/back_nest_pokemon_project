import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class CapturedPokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pokemonId: number;

  @Column()
  region: string;

  @Column()
  level: number;

  @Column({ nullable: true })
  nickname: string;

  @Column()
  regionImage: string;

  @ManyToOne(() => User, (user) => user.capturedPokemons)
  user: User;

  @CreateDateColumn()
  capturedAt: Date;
}
