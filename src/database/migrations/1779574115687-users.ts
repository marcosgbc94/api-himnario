import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1779574115687 implements MigrationInterface {
    name = 'Users1779574115687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying(255) NOT NULL, "names" character varying(255) NOT NULL, "last_names" character varying(255) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" uuid, "deleted_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_by" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
