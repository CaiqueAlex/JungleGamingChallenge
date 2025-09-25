import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1703001000000 implements MigrationInterface {
  name = 'CreateNotifications1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "metadata" jsonb,
        "read" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_read" ON "notifications" ("read")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_createdAt" ON "notifications" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_type" ON "notifications" ("type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notifications_type"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_userId"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}