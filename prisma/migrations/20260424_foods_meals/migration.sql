CREATE TYPE "FoodItemType" AS ENUM ('PRODUCT', 'DISH');
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

CREATE TABLE "FoodItem" (
  "id" TEXT NOT NULL,
  "createdById" TEXT,
  "name" TEXT NOT NULL,
  "type" "FoodItemType" NOT NULL,
  "brand" TEXT,
  "portionLabel" TEXT,
  "caloriesPer100g" DECIMAL(8,2) NOT NULL,
  "proteinPer100g" DECIMAL(8,2) NOT NULL,
  "fatPer100g" DECIMAL(8,2) NOT NULL,
  "carbsPer100g" DECIMAL(8,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MealEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "mealType" "MealType" NOT NULL,
  "consumedAt" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "totalCalories" DECIMAL(8,2) NOT NULL,
  "totalProteinG" DECIMAL(8,2) NOT NULL,
  "totalFatG" DECIMAL(8,2) NOT NULL,
  "totalCarbsG" DECIMAL(8,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MealEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MealItem" (
  "id" TEXT NOT NULL,
  "mealEntryId" TEXT NOT NULL,
  "foodItemId" TEXT NOT NULL,
  "quantityGrams" DECIMAL(8,2) NOT NULL,
  "calories" DECIMAL(8,2) NOT NULL,
  "proteinG" DECIMAL(8,2) NOT NULL,
  "fatG" DECIMAL(8,2) NOT NULL,
  "carbsG" DECIMAL(8,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FoodItem_name_idx" ON "FoodItem"("name");
CREATE INDEX "FoodItem_type_idx" ON "FoodItem"("type");
CREATE INDEX "FoodItem_isActive_idx" ON "FoodItem"("isActive");
CREATE INDEX "MealEntry_userId_consumedAt_idx" ON "MealEntry"("userId", "consumedAt");
CREATE INDEX "MealEntry_userId_mealType_idx" ON "MealEntry"("userId", "mealType");
CREATE INDEX "MealItem_mealEntryId_idx" ON "MealItem"("mealEntryId");
CREATE INDEX "MealItem_foodItemId_idx" ON "MealItem"("foodItemId");

ALTER TABLE "FoodItem"
  ADD CONSTRAINT "FoodItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MealEntry"
  ADD CONSTRAINT "MealEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealItem"
  ADD CONSTRAINT "MealItem_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "MealEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MealItem"
  ADD CONSTRAINT "MealItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
