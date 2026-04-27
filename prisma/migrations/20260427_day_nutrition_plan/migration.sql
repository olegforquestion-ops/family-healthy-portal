CREATE TYPE "DayNutritionPlanStatus" AS ENUM ('DRAFT', 'PARTIALLY_LOGGED', 'COMPLETED');

CREATE TABLE "DayNutritionPlan" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plannedFor" TIMESTAMP(3) NOT NULL,
  "status" "DayNutritionPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DayNutritionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DayNutritionPlanItem" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "mealType" "MealType" NOT NULL,
  "foodItemId" TEXT,
  "customName" TEXT,
  "quantityGrams" DECIMAL(8,2),
  "portionCount" DECIMAL(8,2),
  "calories" DECIMAL(8,2) NOT NULL,
  "proteinG" DECIMAL(8,2) NOT NULL,
  "fatG" DECIMAL(8,2) NOT NULL,
  "carbsG" DECIMAL(8,2) NOT NULL,
  "isLogged" BOOLEAN NOT NULL DEFAULT FALSE,
  "loggedMealEntryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DayNutritionPlanItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DayNutritionPlan_userId_plannedFor_key" ON "DayNutritionPlan"("userId", "plannedFor");
CREATE INDEX "DayNutritionPlan_userId_plannedFor_idx" ON "DayNutritionPlan"("userId", "plannedFor");
CREATE INDEX "DayNutritionPlan_userId_status_idx" ON "DayNutritionPlan"("userId", "status");
CREATE INDEX "DayNutritionPlanItem_planId_mealType_idx" ON "DayNutritionPlanItem"("planId", "mealType");
CREATE INDEX "DayNutritionPlanItem_foodItemId_idx" ON "DayNutritionPlanItem"("foodItemId");
CREATE INDEX "DayNutritionPlanItem_loggedMealEntryId_idx" ON "DayNutritionPlanItem"("loggedMealEntryId");
CREATE INDEX "DayNutritionPlanItem_isLogged_idx" ON "DayNutritionPlanItem"("isLogged");

ALTER TABLE "DayNutritionPlan"
  ADD CONSTRAINT "DayNutritionPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayNutritionPlanItem"
  ADD CONSTRAINT "DayNutritionPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DayNutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DayNutritionPlanItem"
  ADD CONSTRAINT "DayNutritionPlanItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DayNutritionPlanItem"
  ADD CONSTRAINT "DayNutritionPlanItem_loggedMealEntryId_fkey" FOREIGN KEY ("loggedMealEntryId") REFERENCES "MealEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
