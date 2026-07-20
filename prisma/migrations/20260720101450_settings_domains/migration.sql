-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "country" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "privacy_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisibility" TEXT NOT NULL DEFAULT 'private',
    "showWeight" BOOLEAN NOT NULL DEFAULT false,
    "showProgressPhotos" BOOLEAN NOT NULL DEFAULT false,
    "showWorkoutHistory" BOOLEAN NOT NULL DEFAULT false,
    "showStreak" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "allowProfileSearch" BOOLEAN NOT NULL DEFAULT false,
    "personalizedAi" BOOLEAN NOT NULL DEFAULT true,
    "anonymousAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "privacy_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutReminder" BOOLEAN NOT NULL DEFAULT true,
    "mealReminder" BOOLEAN NOT NULL DEFAULT false,
    "waterReminder" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
    "monthlyReport" BOOLEAN NOT NULL DEFAULT false,
    "achievementAlerts" BOOLEAN NOT NULL DEFAULT true,
    "newFeatures" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "quietStart" TEXT NOT NULL DEFAULT '22:00',
    "quietEnd" TEXT NOT NULL DEFAULT '07:00',
    "muteAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredDuration" INTEGER NOT NULL DEFAULT 60,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "trainingDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoProgression" BOOLEAN NOT NULL DEFAULT true,
    "restTimerSec" INTEGER NOT NULL DEFAULT 90,
    "defaultEquipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warmupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownEnabled" BOOLEAN NOT NULL DEFAULT true,
    "audioCues" BOOLEAN NOT NULL DEFAULT true,
    "autoStartRestTimer" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietType" TEXT NOT NULL DEFAULT 'BALANCED',
    "allergies" TEXT NOT NULL DEFAULT '',
    "cuisinePreference" TEXT NOT NULL DEFAULT '',
    "waterGoalMl" INTEGER NOT NULL DEFAULT 2500,
    "proteinGoalG" INTEGER,
    "calorieGoal" INTEGER,
    "mealsPerDay" INTEGER NOT NULL DEFAULT 3,
    "fastingWindow" TEXT,
    "supplements" TEXT NOT NULL DEFAULT '',
    "budgetTier" TEXT NOT NULL DEFAULT 'moderate',
    "aiMealPlanning" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personality" TEXT NOT NULL DEFAULT 'professional',
    "communicationStyle" TEXT NOT NULL DEFAULT 'short',
    "motivationFrequency" TEXT NOT NULL DEFAULT 'medium',
    "weeklyCheckins" BOOLEAN NOT NULL DEFAULT true,
    "dailyCheckins" BOOLEAN NOT NULL DEFAULT false,
    "adaptiveWorkouts" BOOLEAN NOT NULL DEFAULT true,
    "adaptiveDiet" BOOLEAN NOT NULL DEFAULT true,
    "rememberPreferences" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appearance_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "accentColor" TEXT NOT NULL DEFAULT 'red',
    "glassIntensity" TEXT NOT NULL DEFAULT 'medium',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "animations" BOOLEAN NOT NULL DEFAULT true,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "roundedCorners" TEXT NOT NULL DEFAULT 'medium',
    "dashboardLayout" TEXT NOT NULL DEFAULT 'large',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appearance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "recoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastPasswordChange" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delete_account_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "delete_account_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "privacy_settings_userId_key" ON "privacy_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workout_settings_userId_key" ON "workout_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "diet_settings_userId_key" ON "diet_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_settings_userId_key" ON "ai_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "appearance_settings_userId_key" ON "appearance_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_userId_key" ON "security_settings"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "delete_account_requests_userId_key" ON "delete_account_requests"("userId");

-- AddForeignKey
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_settings" ADD CONSTRAINT "workout_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_settings" ADD CONSTRAINT "diet_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appearance_settings" ADD CONSTRAINT "appearance_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_settings" ADD CONSTRAINT "security_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delete_account_requests" ADD CONSTRAINT "delete_account_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
