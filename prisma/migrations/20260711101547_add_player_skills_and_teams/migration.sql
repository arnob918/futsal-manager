-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD');

-- CreateEnum
CREATE TYPE "Team" AS ENUM ('A', 'B');

-- AlterTable
ALTER TABLE "MatchParticipant" ADD COLUMN     "position" "Position",
ADD COLUMN     "team" "Team";

-- CreateTable
CREATE TABLE "PlayerSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "PlayerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerSkill_userId_idx" ON "PlayerSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSkill_userId_position_key" ON "PlayerSkill"("userId", "position");

-- AddForeignKey
ALTER TABLE "PlayerSkill" ADD CONSTRAINT "PlayerSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
