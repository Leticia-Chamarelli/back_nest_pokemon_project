import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenToUser1748288853248 implements MigrationInterface {
    name = 'AddRefreshTokenToUser1748288853248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL DEFAULT 'NULL'`);
    }

}
