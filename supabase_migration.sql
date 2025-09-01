-- Migration: Add borderColor, materialColor and structure columns to Lead table
-- Date: 2024-12-19

-- Add borderColor column
ALTER TABLE "Lead" 
ADD COLUMN "borderColor" TEXT DEFAULT NULL;

-- Add materialColor column  
ALTER TABLE "Lead"
ADD COLUMN "materialColor" TEXT DEFAULT NULL;

-- Add structure column
ALTER TABLE "Lead"
ADD COLUMN "structure" TEXT DEFAULT NULL;

-- Add includeHooks column
ALTER TABLE "Lead"
ADD COLUMN "includeHooks" BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN "Lead"."borderColor" IS 'Kolor obszycia dywanika wybrany przez klienta';
COMMENT ON COLUMN "Lead"."materialColor" IS 'Kolor materiału dywanika wybrany przez klienta';
COMMENT ON COLUMN "Lead"."structure" IS 'Struktura komórek dywanika (romb/plaster miodu)';
COMMENT ON COLUMN "Lead"."includeHooks" IS 'Czy klient chce dołączyć podpiętkę gratis';

-- Create indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS "idx_lead_border_color" ON "Lead" ("borderColor");
CREATE INDEX IF NOT EXISTS "idx_lead_material_color" ON "Lead" ("materialColor");
CREATE INDEX IF NOT EXISTS "idx_lead_structure" ON "Lead" ("structure");
CREATE INDEX IF NOT EXISTS "idx_lead_include_hooks" ON "Lead" ("includeHooks");
