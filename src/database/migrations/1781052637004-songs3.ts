import { MigrationInterface, QueryRunner } from "typeorm";

export class Songs31781052637004 implements MigrationInterface {
    name = 'Songs31781052637004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slide" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "slide" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "slide" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "slide" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "slide" ADD "deleted_by" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slide" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "slide" ADD "deleted_by" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "slide" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "slide" ADD "updated_by" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "slide" ALTER COLUMN "updated_at" SET NOT NULL`);
    }

}
