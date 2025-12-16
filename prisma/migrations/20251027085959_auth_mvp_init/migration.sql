/*
  Warnings:

  - You are about to alter the column `expo_push_token` on the `devices` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `platform` column on the `devices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[expo_push_token]` on the table `devices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- DropIndex
DROP INDEX "public"."devices_user_id_expo_push_token_key";

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "expo_push_token" SET DATA TYPE VARCHAR(255),
DROP COLUMN "platform",
ADD COLUMN     "platform" "Platform";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "updated_at";

-- CreateIndex
CREATE UNIQUE INDEX "devices_expo_push_token_key" ON "devices"("expo_push_token");
