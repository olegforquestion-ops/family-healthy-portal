-- CreateEnum
CREATE TYPE "WorkoutEntryMethod" AS ENUM ('MANUAL', 'NORM');

-- CreateTable
CREATE TABLE "WaterEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutNorm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitLabel" TEXT NOT NULL,
    "caloriesPerUnit" DECIMAL(8,2) NOT NULL,
    "defaultQuantity" DECIMAL(8,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutNorm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutNormId" TEXT,
    "method" "WorkoutEntryMethod" NOT NULL,
    "activityName" TEXT NOT NULL,
    "unitLabel" TEXT,
    "quantity" DECIMAL(8,2),
    "durationMinutes" INTEGER,
    "caloriesBurned" DECIMAL(8,2) NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaterEntry_userId_recordedAt_idx" ON "WaterEntry"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "WorkoutNorm_name_idx" ON "WorkoutNorm"("name");

-- CreateIndex
CREATE INDEX "WorkoutNorm_isActive_idx" ON "WorkoutNorm"("isActive");

-- CreateIndex
CREATE INDEX "WorkoutEntry_userId_performedAt_idx" ON "WorkoutEntry"("userId", "performedAt");

-- CreateIndex
CREATE INDEX "WorkoutEntry_workoutNormId_idx" ON "WorkoutEntry"("workoutNormId");

-- CreateIndex
CREATE INDEX "WorkoutEntry_method_idx" ON "WorkoutEntry"("method");

-- AddForeignKey
ALTER TABLE "WaterEntry" ADD CONSTRAINT "WaterEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEntry" ADD CONSTRAINT "WorkoutEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEntry" ADD CONSTRAINT "WorkoutEntry_workoutNormId_fkey" FOREIGN KEY ("workoutNormId") REFERENCES "WorkoutNorm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
