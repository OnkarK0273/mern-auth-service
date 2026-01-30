-- DropForeignKey
ALTER TABLE "refreshTokens" DROP CONSTRAINT "refreshTokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "refreshTokens" ADD CONSTRAINT "refreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
