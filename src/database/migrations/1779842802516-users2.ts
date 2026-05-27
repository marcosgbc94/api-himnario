import { MigrationInterface, QueryRunner } from "typeorm";

export class Users21779842802516 implements MigrationInterface {
    name = 'Users21779842802516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "deleted_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL`);
    }

}
