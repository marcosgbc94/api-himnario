import { MigrationInterface, QueryRunner } from "typeorm";

export class Roles21779931804030 implements MigrationInterface {
    name = 'Roles21779931804030'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "roles"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "roles" TO "role"`);
    }

}
