import { MigrationInterface, QueryRunner } from "typeorm";

export class Audit1780531866418 implements MigrationInterface {
    name = 'Audit1780531866418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" character varying(255) NOT NULL, "method" character varying(16) NOT NULL, "url" character varying(255) NOT NULL, "payload" jsonb, "ip" character varying(45), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d3d120ddaf7bc9b1ed68ed463a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit"`);
    }

}
