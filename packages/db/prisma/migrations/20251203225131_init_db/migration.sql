-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_like" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "ReportType" NOT NULL DEFAULT 'POST',
    "postId" TEXT,
    "commentId" TEXT,
    "reporterId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_authorId_idx" ON "post"("authorId");

-- CreateIndex
CREATE INDEX "post_createdAt_idx" ON "post"("createdAt");

-- CreateIndex
CREATE INDEX "post_deletedAt_idx" ON "post"("deletedAt");

-- CreateIndex
CREATE INDEX "comment_postId_idx" ON "comment"("postId");

-- CreateIndex
CREATE INDEX "comment_authorId_idx" ON "comment"("authorId");

-- CreateIndex
CREATE INDEX "comment_createdAt_idx" ON "comment"("createdAt");

-- CreateIndex
CREATE INDEX "like_postId_idx" ON "like"("postId");

-- CreateIndex
CREATE INDEX "like_userId_idx" ON "like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "like_postId_userId_key" ON "like"("postId", "userId");

-- CreateIndex
CREATE INDEX "comment_like_commentId_idx" ON "comment_like"("commentId");

-- CreateIndex
CREATE INDEX "comment_like_userId_idx" ON "comment_like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_like_commentId_userId_key" ON "comment_like"("commentId", "userId");

-- CreateIndex
CREATE INDEX "report_postId_idx" ON "report"("postId");

-- CreateIndex
CREATE INDEX "report_commentId_idx" ON "report"("commentId");

-- CreateIndex
CREATE INDEX "report_reporterId_idx" ON "report"("reporterId");

-- CreateIndex
CREATE INDEX "report_status_idx" ON "report"("status");

-- CreateIndex
CREATE INDEX "follow_followerId_idx" ON "follow"("followerId");

-- CreateIndex
CREATE INDEX "follow_followingId_idx" ON "follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "follow_followerId_followingId_key" ON "follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_like" ADD CONSTRAINT "comment_like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_like" ADD CONSTRAINT "comment_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow" ADD CONSTRAINT "follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow" ADD CONSTRAINT "follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
