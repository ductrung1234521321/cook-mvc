/*
  Warnings:

  - You are about to drop the `MediaAssets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."MediaAssets";

-- CreateTable
CREATE TABLE "mediaAssets" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" "MediaType" NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "mediaAssets_pkey" PRIMARY KEY ("id")
);
