import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToSightedPokemon1752070789449 implements MigrationInterface {
    name = 'AddFieldsToSightedPokemon1752070789449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" ADD "regionImage" character varying`);
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" ADD "level" integer`);
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" ADD "nickname" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" DROP COLUMN "nickname"`);
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "sighted_pokemon" DROP COLUMN "regionImage"`);
    }

}
