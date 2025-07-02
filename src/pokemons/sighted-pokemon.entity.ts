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

  @Column({ nullable: true })
  regionImage: string;

  @Column({ nullable: true })
  level: number;

  @Column({ nullable: true })
  nickname: string;

  @CreateDateColumn()
  sightedAt: Date;

  @ManyToOne(() => User, (user) => user.sightedPokemons, { eager: false })
  user: User;
}
