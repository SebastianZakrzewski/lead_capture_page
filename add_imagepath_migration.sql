-- Migracja: Dodanie pola imagePath do tabeli CarMat
-- Uruchom to w Supabase SQL Editor

-- 1. Dodaj nową kolumnę imagePath
ALTER TABLE "CarMat" 
ADD COLUMN "imagePath" TEXT;

-- 2. Dodaj komentarz do nowej kolumny
COMMENT ON COLUMN "CarMat"."imagePath" IS 'Ścieżka do zdjęcia dywanika';

-- 3. Dodaj indeks dla lepszej wydajności
CREATE INDEX "idx_carmat_image_path" ON "CarMat" ("imagePath");

-- 4. Ustaw wartość domyślną dla istniejących rekordów (opcjonalne)
-- UPDATE "CarMat" 
-- SET "imagePath" = '/konfigurator/dywaniki/default-placeholder.webp'
-- WHERE "imagePath" IS NULL;

-- 5. Ustaw kolumnę jako NOT NULL (uruchom po wypełnieniu danych)
-- ALTER TABLE "CarMat" 
-- ALTER COLUMN "imagePath" SET NOT NULL;
