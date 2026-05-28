import { MigrationInterface, QueryRunner } from "typeorm";

export class Roles1779928812044 implements MigrationInterface {
    name = 'Roles1779928812044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" text array NOT NULL DEFAULT '{user}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
