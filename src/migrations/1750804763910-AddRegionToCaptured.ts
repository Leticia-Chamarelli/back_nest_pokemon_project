import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegionToCaptured1750804763910 implements MigrationInterface {
    name = 'AddRegionToCaptured1750804763910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "captured_pokemon" ADD "region" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "captured_pokemon" DROP COLUMN "region"`);
    }

}
