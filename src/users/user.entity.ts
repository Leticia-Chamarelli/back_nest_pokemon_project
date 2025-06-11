import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CapturedPokemon } from '../pokemons/captured-pokemon.entity';
import { SightedPokemon } from '../pokemons/sighted-pokemon.entity';


@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @OneToMany(() => CapturedPokemon, (cp) => cp.user)
  capturedPokemons: CapturedPokemon[];

  @OneToMany(() => SightedPokemon, (sp) => sp.user)
  sightedPokemon: SightedPokemon[];
}

