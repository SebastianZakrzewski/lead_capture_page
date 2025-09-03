-- Dodanie pól trackingowych do tabeli Lead
-- UTM-y (parametry śledzenia)
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;

-- Identyfikatory reklam
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gclid" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "fbclid" TEXT;

-- Dodatkowe dane trackingowe
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "firstVisit" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "currentUrl" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "referrer" TEXT;

-- Dodanie indeksów dla lepszej wydajności zapytań
CREATE INDEX IF NOT EXISTS "idx_lead_utm_source" ON "Lead" ("utmSource");
CREATE INDEX IF NOT EXISTS "idx_lead_utm_campaign" ON "Lead" ("utmCampaign");
CREATE INDEX IF NOT EXISTS "idx_lead_session_id" ON "Lead" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_lead_first_visit" ON "Lead" ("firstVisit");
CREATE INDEX IF NOT EXISTS "idx_lead_gclid" ON "Lead" ("gclid");
CREATE INDEX IF NOT EXISTS "idx_lead_fbclid" ON "Lead" ("fbclid");

-- Dodanie komentarzy do kolumn (opcjonalne)
COMMENT ON COLUMN "Lead"."utmSource" IS 'Źródło ruchu (np. google, facebook, email)';
COMMENT ON COLUMN "Lead"."utmMedium" IS 'Medium (np. cpc, social, organic)';
COMMENT ON COLUMN "Lead"."utmCampaign" IS 'Nazwa kampanii marketingowej';
COMMENT ON COLUMN "Lead"."utmTerm" IS 'Słowa kluczowe z kampanii';
COMMENT ON COLUMN "Lead"."utmContent" IS 'Treść reklamy (np. banner_300x250)';
COMMENT ON COLUMN "Lead"."gclid" IS 'Google Ads Click ID';
COMMENT ON COLUMN "Lead"."fbclid" IS 'Facebook Ads Click ID';
COMMENT ON COLUMN "Lead"."sessionId" IS 'Unikalny identyfikator sesji użytkownika';
COMMENT ON COLUMN "Lead"."firstVisit" IS 'Data pierwszego wejścia na stronę';
COMMENT ON COLUMN "Lead"."currentUrl" IS 'URL strony na której wypełniono formularz';
COMMENT ON COLUMN "Lead"."userAgent" IS 'Informacje o przeglądarce/urządzeniu';
COMMENT ON COLUMN "Lead"."referrer" IS 'Poprzednia strona z której przyszedł użytkownik';
