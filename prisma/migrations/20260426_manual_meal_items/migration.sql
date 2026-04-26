ALTER TABLE "MealItem"
  ADD COLUMN "customName" TEXT,
  ADD COLUMN "portionCount" DECIMAL(8,2);

ALTER TABLE "MealItem"
  ALTER COLUMN "foodItemId" DROP NOT NULL,
  ALTER COLUMN "quantityGrams" DROP NOT NULL;
