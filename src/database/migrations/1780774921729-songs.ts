import { MigrationInterface, QueryRunner } from "typeorm";

export class Songs1780774921729 implements MigrationInterface {
    name = 'Songs1780774921729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "song_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(128) NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_dd5fbc57c8aa83165e008800b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "slide" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying(2000) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "deleted_by" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_61701f20afc899f757f86da067b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "song_slides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "song_id" uuid, "slide_id" uuid, CONSTRAINT "PK_87a27882fe65b7962c2573dd98f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "songs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(256) NOT NULL, "summary" character varying(512), "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "id_song_type" uuid, CONSTRAINT "PK_e504ce8ad2e291d3a1d8f1ea2f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "song_slides" ADD CONSTRAINT "FK_3b80ab435fc11255e4e27074e4a" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "song_slides" ADD CONSTRAINT "FK_303c70397b9e68f8b04ab1e83da" FOREIGN KEY ("slide_id") REFERENCES "slide"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "songs" ADD CONSTRAINT "FK_072ecb87cc64fe3c64c2203d9c3" FOREIGN KEY ("id_song_type") REFERENCES "song_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "songs" DROP CONSTRAINT "FK_072ecb87cc64fe3c64c2203d9c3"`);
        await queryRunner.query(`ALTER TABLE "song_slides" DROP CONSTRAINT "FK_303c70397b9e68f8b04ab1e83da"`);
        await queryRunner.query(`ALTER TABLE "song_slides" DROP CONSTRAINT "FK_3b80ab435fc11255e4e27074e4a"`);
        await queryRunner.query(`DROP TABLE "songs"`);
        await queryRunner.query(`DROP TABLE "song_slides"`);
        await queryRunner.query(`DROP TABLE "slide"`);
        await queryRunner.query(`DROP TABLE "song_types"`);
    }

}
