-- Migration: Add borderColor and materialColor columns to Lead table
-- Date: 2024-12-19

-- Add borderColor column
ALTER TABLE "Lead" 
ADD COLUMN "borderColor" TEXT DEFAULT NULL;

-- Add materialColor column  
ALTER TABLE "Lead"
ADD COLUMN "materialColor" TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN "Lead"."borderColor" IS 'Kolor obszycia dywanika wybrany przez klienta';
COMMENT ON COLUMN "Lead"."materialColor" IS 'Kolor materiału dywanika wybrany przez klienta';

-- Create indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS "idx_lead_border_color" ON "Lead" ("borderColor");
CREATE INDEX IF NOT EXISTS "idx_lead_material_color" ON "Lead" ("materialColor");
