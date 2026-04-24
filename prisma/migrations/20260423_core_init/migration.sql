CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'UNSPECIFIED');
CREATE TYPE "ActivityLevel" AS ENUM ('LOW', 'LIGHT', 'MODERATE', 'HIGH', 'VERY_HIGH');
CREATE TYPE "MeasurementType" AS ENUM ('WAIST', 'CHEST', 'HIPS', 'ARM', 'THIGH');

CREATE TABLE "Family" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Role" (
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "ProfileGoalType" (
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProfileGoalType_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "familyId" TEXT NOT NULL,
  "roleCode" TEXT NOT NULL,
  "createdById" TEXT,
  "login" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "mustChangePassword" BOOLEAN NOT NULL DEFAULT TRUE,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "displayName" TEXT NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "sex" "Sex" NOT NULL DEFAULT 'UNSPECIFIED',
  "heightCm" DECIMAL(5,2),
  "targetWeightKg" DECIMAL(5,2),
  "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
  "profileGoalTypeCode" TEXT NOT NULL,
  "waterTargetMl" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NutritionNormSnapshot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sourceWeightKg" DECIMAL(5,2),
  "dailyCalories" INTEGER NOT NULL,
  "proteinG" DECIMAL(6,2) NOT NULL,
  "fatG" DECIMAL(6,2) NOT NULL,
  "carbsG" DECIMAL(6,2) NOT NULL,
  "waterTargetMl" INTEGER NOT NULL,
  "isCurrent" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "NutritionNormSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeightEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "weightKg" DECIMAL(5,2) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MeasurementEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "MeasurementType" NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "valueCm" DECIMAL(6,2) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeasurementEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

CREATE INDEX "User_familyId_idx" ON "User"("familyId");
CREATE INDEX "User_roleCode_idx" ON "User"("roleCode");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "NutritionNormSnapshot_userId_calculatedAt_idx" ON "NutritionNormSnapshot"("userId", "calculatedAt");
CREATE INDEX "NutritionNormSnapshot_userId_isCurrent_idx" ON "NutritionNormSnapshot"("userId", "isCurrent");
CREATE INDEX "WeightEntry_userId_recordedAt_idx" ON "WeightEntry"("userId", "recordedAt");
CREATE INDEX "MeasurementEntry_userId_type_recordedAt_idx" ON "MeasurementEntry"("userId", "type", "recordedAt");

ALTER TABLE "User"
  ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User"
  ADD CONSTRAINT "User_roleCode_fkey" FOREIGN KEY ("roleCode") REFERENCES "Role"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User"
  ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_profileGoalTypeCode_fkey" FOREIGN KEY ("profileGoalTypeCode") REFERENCES "ProfileGoalType"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NutritionNormSnapshot"
  ADD CONSTRAINT "NutritionNormSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeightEntry"
  ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeasurementEntry"
  ADD CONSTRAINT "MeasurementEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
