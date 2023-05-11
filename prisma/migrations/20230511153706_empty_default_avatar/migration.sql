-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "totalMessageCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("avatar", "id", "name", "totalMessageCount", "userId") SELECT "avatar", "id", "name", "totalMessageCount", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
