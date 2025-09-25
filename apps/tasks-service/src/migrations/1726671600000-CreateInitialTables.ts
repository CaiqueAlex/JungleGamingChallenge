import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1726671600000 implements MigrationInterface {
    name = 'CreateInitialTables1726671600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')`);
        
        await queryRunner.query(`CREATE TYPE "task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')`);

        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "priority" "task_priority_enum" NOT NULL DEFAULT 'MEDIUM',
                "status" "task_status_enum" NOT NULL DEFAULT 'TODO',
                "dueDate" TIMESTAMP,
                "ownerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "task_assignees" (
                "task_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_task_assignees" PRIMARY KEY ("task_id", "user_id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" text NOT NULL,
                "userId" uuid NOT NULL,
                "taskId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_comments" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "task_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "taskId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "action" character varying NOT NULL,
                "changes" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_task_history" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "task_assignees" 
            ADD CONSTRAINT "FK_task_assignees_task" 
            FOREIGN KEY ("task_id") REFERENCES "tasks"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" 
            ADD CONSTRAINT "FK_comments_task" 
            FOREIGN KEY ("taskId") REFERENCES "tasks"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "task_history" 
            ADD CONSTRAINT "FK_task_history_task" 
            FOREIGN KEY ("taskId") REFERENCES "tasks"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE OR REPLACE VIEW "users_view" AS 
            SELECT "id", "email", "username", "createdAt", "updatedAt" 
            FROM "users"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP VIEW IF EXISTS "users_view"`);
        await queryRunner.query(`DROP TABLE "task_history"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "task_assignees"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "task_status_enum"`);
        await queryRunner.query(`DROP TYPE "task_priority_enum"`);
    }
}