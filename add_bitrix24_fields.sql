-- Dodaj kolumny Bitrix24 do tabeli Lead
ALTER TABLE "Lead" ADD COLUMN "bitrix24ContactId" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "bitrix24DealId" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "bitrix24Synced" BOOLEAN DEFAULT FALSE;

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS "idx_lead_bitrix24_synced" ON "Lead"("bitrix24Synced");
CREATE INDEX IF NOT EXISTS "idx_lead_bitrix24_deal_id" ON "Lead"("bitrix24DealId");
CREATE INDEX IF NOT EXISTS "idx_lead_bitrix24_contact_id" ON "Lead"("bitrix24ContactId");

-- Dodaj komentarze do kolumn
COMMENT ON COLUMN "Lead"."bitrix24ContactId" IS 'ID kontaktu w Bitrix24 CRM';
COMMENT ON COLUMN "Lead"."bitrix24DealId" IS 'ID deala w Bitrix24 CRM';
COMMENT ON COLUMN "Lead"."bitrix24Synced" IS 'Czy lead został zsynchronizowany z Bitrix24';
