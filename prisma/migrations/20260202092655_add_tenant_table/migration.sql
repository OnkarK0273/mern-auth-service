-- AlterTable
ALTER TABLE "refreshTokens" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tenantId" INTEGER;

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
