-- Dodanie pól feedbackowych do tabeli Lead
-- Dane ankiety feedbackowej
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackEaseOfChoice" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackFormClarity" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackLoadingSpeed" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackOverallExperience" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackWouldRecommend" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "feedbackAdditionalComments" TEXT;

-- Dodanie komentarzy do kolumn
COMMENT ON COLUMN "Lead"."feedbackEaseOfChoice" IS 'Ocena łatwości wyboru dywaników (1-5)';
COMMENT ON COLUMN "Lead"."feedbackFormClarity" IS 'Ocena przejrzystości formularza (1-5)';
COMMENT ON COLUMN "Lead"."feedbackLoadingSpeed" IS 'Ocena szybkości ładowania strony (1-5)';
COMMENT ON COLUMN "Lead"."feedbackOverallExperience" IS 'Ogólne wrażenie z formularza (1-5)';
COMMENT ON COLUMN "Lead"."feedbackWouldRecommend" IS 'Czy poleciłbyś stronę znajomym (1-10)';
COMMENT ON COLUMN "Lead"."feedbackAdditionalComments" IS 'Dodatkowe uwagi użytkownika';
