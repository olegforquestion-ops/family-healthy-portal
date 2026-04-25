CREATE TYPE "NutritionNormSource" AS ENUM ('AUTO', 'MANUAL');

ALTER TABLE "NutritionNormSnapshot"
ADD COLUMN "source" "NutritionNormSource" NOT NULL DEFAULT 'AUTO';
