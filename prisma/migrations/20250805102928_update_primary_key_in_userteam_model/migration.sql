/*
  Warnings:

  - The primary key for the `UserTeam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserTeam" DROP CONSTRAINT "UserTeam_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("userId", "teamId");
