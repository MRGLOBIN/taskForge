/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `org_members` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `prect_id` on the `statuses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id,name]` on the table `statuses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order,project_id]` on the table `statuses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `statuses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENT', 'HIGHT', 'MEDIUM', 'LOW', 'NONE');

-- DropForeignKey
ALTER TABLE "statuses" DROP CONSTRAINT "statuses_prect_id_fkey";

-- DropIndex
DROP INDEX "statuses_order_key";

-- DropIndex
DROP INDEX "statuses_prect_id_name_key";

-- AlterTable
ALTER TABLE "invitations" ALTER COLUMN "accepted_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "org_members" DROP COLUMN "joinedAt",
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "update_at",
ADD COLUMN     "task_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "statuses" DROP COLUMN "prect_id",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" JSONB,
    "priority" "Priority" NOT NULL,
    "task_number" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3),
    "estimated_hours" DOUBLE PRECISION,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "project_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "parent_task_id" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_labels" (
    "task_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL,

    CONSTRAINT "task_labels_pkey" PRIMARY KEY ("task_id","label_id")
);

-- CreateIndex
CREATE INDEX "tasks_project_id_idx" ON "tasks"("project_id");

-- CreateIndex
CREATE INDEX "tasks_reporter_id_idx" ON "tasks"("reporter_id");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_project_id_name_key" ON "statuses"("project_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_order_project_id_key" ON "statuses"("order", "project_id");

-- AddForeignKey
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
