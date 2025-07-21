import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndPokemons1753126175234 implements MigrationInterface {
    name = 'CreateUsersAndPokemons1753126175234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "captured_pokemon" ("id" SERIAL NOT NULL, "pokemonId" integer NOT NULL, "region" character varying, "level" integer, "nickname" character varying, "regionImage" character varying, "capturedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_50dbd0b12d98f3e216878c3475d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sighted_pokemon" ("id" SERIAL NOT NULL, "pokemonId" integer NOT NULL, "region" character varying NOT NULL, "regionImage" character varying, "level" integer, "nickname" character varying, "sightedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ca4d885cf3e120837c2c59dca84" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "refreshToken" text, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "captured_pokemon" ADD CONSTRAINT "FK_a1f9f71e1e85edf4c5727784598" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" ADD CONSTRAINT "FK_e355dde80cf263d1a2317ff09b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" DROP CONSTRAINT "FK_e355dde80cf263d1a2317ff09b3"`);
        await queryRunner.query(`ALTER TABLE "captured_pokemon" DROP CONSTRAINT "FK_a1f9f71e1e85edf4c5727784598"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "sighted_pokemon"`);
        await queryRunner.query(`DROP TABLE "captured_pokemon"`);
    }

}
