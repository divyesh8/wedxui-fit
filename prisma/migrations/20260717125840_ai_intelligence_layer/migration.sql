-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "aiNutritionPlan" JSONB,
ADD COLUMN     "aiPlan" JSONB,
ADD COLUMN     "athleteProfile" JSONB,
ADD COLUMN     "goalsRanked" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "nutritionProfile" JSONB,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "physique" TEXT,
ADD COLUMN     "stressLevel" INTEGER,
ADD COLUMN     "trainingStyle" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ai_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_reviews_userId_weekStart_idx" ON "ai_reviews"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
