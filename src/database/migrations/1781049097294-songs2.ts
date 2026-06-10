import { MigrationInterface, QueryRunner } from "typeorm";

export class Songs21781049097294 implements MigrationInterface {
    name = 'Songs21781049097294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song_slides" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "song_slides" DROP COLUMN "deleted_by"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song_slides" ADD "deleted_by" uuid`);
        await queryRunner.query(`ALTER TABLE "song_slides" ADD "deleted_at" TIMESTAMP`);
    }

}
