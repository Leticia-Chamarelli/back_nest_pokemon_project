import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class SightedPokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pokemonId: number;

  @Column()
  region: string;

  @ManyToOne(() => User, (user) => user.sightedPokemon)
  user: User;

  @CreateDateColumn()
  sightedAt: Date;
}
