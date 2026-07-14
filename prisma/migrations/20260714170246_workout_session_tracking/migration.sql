-- AlterTable
ALTER TABLE "exercise_logs" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workout_logs" ADD COLUMN     "activeSeconds" INTEGER NOT NULL DEFAULT 0;
