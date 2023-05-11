-- CreateTable
CREATE TABLE "AggregatedData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalMessageCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "MessageAggregation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayCount" INTEGER NOT NULL DEFAULT 0,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "MessageAggregation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
