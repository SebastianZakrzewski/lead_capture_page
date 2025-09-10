-- Cofnięcie bazy danych do stanu z ostatniego commita (d9c71fd)
-- Uruchom to w Supabase SQL Editor

-- 1. Usuń kolumny trackingowe z tabeli Lead (dodane po commicie)
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "utmSource";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "utmMedium";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "utmCampaign";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "utmTerm";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "utmContent";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "gclid";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "fbclid";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "sessionId";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "firstVisit";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "currentUrl";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "userAgent";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "referrer";

-- 2. Usuń indeksy trackingowe z tabeli Lead
DROP INDEX IF EXISTS "idx_lead_utm_source";
DROP INDEX IF EXISTS "idx_lead_utm_campaign";
DROP INDEX IF EXISTS "idx_lead_session_id";
DROP INDEX IF EXISTS "idx_lead_first_visit";
DROP INDEX IF EXISTS "idx_lead_gclid";
DROP INDEX IF EXISTS "idx_lead_fbclid";

-- 3. Usuń tabelę CarMat (zostanie odtworzona z commita)
DROP TABLE IF EXISTS "CarMat" CASCADE;

-- 4. Odtwórz tabelę CarMat z commita (d9c71fd)
CREATE TABLE "CarMat" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "matType" TEXT NOT NULL,
  "cellStructure" TEXT NOT NULL,
  "materialColor" TEXT NOT NULL,
  "borderColor" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dodaj komentarze dla dokumentacji
COMMENT ON TABLE "CarMat" IS 'Tabela przechowująca konfiguracje dywaników samochodowych';
COMMENT ON COLUMN "CarMat"."matType" IS 'Rodzaj dywanika (3D z rantami lub bez rantów)';
COMMENT ON COLUMN "CarMat"."cellStructure" IS 'Struktura komórek (romb/plaster miodu)';
COMMENT ON COLUMN "CarMat"."materialColor" IS 'Kolor materiału dywanika';
COMMENT ON COLUMN "CarMat"."borderColor" IS 'Kolor obszycia dywanika';
COMMENT ON COLUMN "CarMat"."imagePath" IS 'Ścieżka do zdjęcia dywanika';

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX "idx_carmat_mat_type" ON "CarMat" ("matType");
CREATE INDEX "idx_carmat_cell_structure" ON "CarMat" ("cellStructure");
CREATE INDEX "idx_carmat_material_color" ON "CarMat" ("materialColor");
CREATE INDEX "idx_carmat_border_color" ON "CarMat" ("borderColor");
CREATE INDEX "idx_carmat_created_at" ON "CarMat" ("createdAt");

-- Dodaj ograniczenia (constraints) dla walidacji danych
ALTER TABLE "CarMat" ADD CONSTRAINT "chk_mat_type" 
  CHECK ("matType" IN ('3d-with-rims', '3d-without-rims'));

ALTER TABLE "CarMat" ADD CONSTRAINT "chk_cell_structure" 
  CHECK ("cellStructure" IN ('rhombus', 'honeycomb'));

-- Dodaj trigger do automatycznego aktualizowania updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carmat_updated_at 
  BEFORE UPDATE ON "CarMat" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Sprawdź strukturę tabeli Lead (powinna zawierać tylko kolumny z commita)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Lead' 
ORDER BY ordinal_position;

-- 6. Sprawdź strukturę tabeli CarMat
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'CarMat' 
ORDER BY ordinal_position;
