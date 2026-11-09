/*
  Warnings:

  - Added the required column `displayname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User"
ADD COLUMN "displayname" TEXT,
ADD COLUMN "location" TEXT;
