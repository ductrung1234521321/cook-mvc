-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- CreateTable
CREATE TABLE "MediaAssets" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" "MediaType" NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "MediaAssets_pkey" PRIMARY KEY ("id")
);
