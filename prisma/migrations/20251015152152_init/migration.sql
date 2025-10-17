-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TxKind" AS ENUM ('GENERIC', 'FUND_TOPUP', 'MATCH_PAYER_CREDIT', 'MATCH_PARTICIPANT_DEBIT');

-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "totalCost" INTEGER NOT NULL DEFAULT 0,
    "payerId" TEXT,
    "settled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" TEXT,
    "matchId" TEXT,
    "kind" "TxKind" NOT NULL DEFAULT 'GENERIC',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "FundStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,

    CONSTRAINT "FundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Match_date_idx" ON "Match"("date");

-- CreateIndex
CREATE INDEX "Match_payerId_idx" ON "Match"("payerId");

-- CreateIndex
CREATE INDEX "Match_settled_idx" ON "Match"("settled");

-- CreateIndex
CREATE INDEX "MatchParticipant_userId_idx" ON "MatchParticipant"("userId");

-- CreateIndex
CREATE INDEX "MatchParticipant_matchId_idx" ON "MatchParticipant"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_matchId_userId_key" ON "MatchParticipant"("matchId", "userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_matchId_idx" ON "Transaction"("matchId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_kind_idx" ON "Transaction"("kind");

-- CreateIndex
CREATE INDEX "FundRequest_userId_idx" ON "FundRequest"("userId");

-- CreateIndex
CREATE INDEX "FundRequest_status_idx" ON "FundRequest"("status");

-- CreateIndex
CREATE INDEX "FundRequest_createdAt_idx" ON "FundRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundRequest" ADD CONSTRAINT "FundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
