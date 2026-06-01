import { MigrationInterface, QueryRunner } from "typeorm";

export class Roles21780170485736 implements MigrationInterface {
    name = 'Roles21780170485736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "updated_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "deleted_by" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "active"`);
    }

}
