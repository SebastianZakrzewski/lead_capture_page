# 🔧 Migracja Supabase - Dodanie kolumn kolorów

## 📋 **Problem**
Tabela `Lead` w Supabase nie zawiera kolumn `borderColor` i `materialColor`, które są potrzebne do zapisywania wybranych kolorów przez klientów.

## 🛠️ **Rozwiązanie**

### **Krok 1: Otwórz Supabase Dashboard**
1. Wejdź na [supabase.com](https://supabase.com)
2. Zaloguj się i wybierz swój projekt
3. Przejdź do **SQL Editor** (lewy panel)

### **Krok 2: Wykonaj migrację SQL**

Skopiuj i wykonaj następujący kod SQL:

```sql
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
```

### **Krok 3: Weryfikacja**

Sprawdź czy kolumny zostały dodane:
```sql
-- Sprawdź strukturę tabeli
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Lead' 
AND column_name IN ('borderColor', 'materialColor');
```

### **Krok 4: Test API**

Po dodaniu kolumn, przetestuj API:
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "phone": "123456789",
    "email": "test@test.com",
    "borderColor": "czarne",
    "materialColor": "beige"
  }'
```

## ✅ **Oczekiwany rezultat**

Po wykonaniu migracji:
- ✅ Kolumny `borderColor` i `materialColor` istnieją w tabeli `Lead`
- ✅ API `/api/leads` akceptuje nowe pola
- ✅ Leady są zapisywane z informacjami o kolorach
- ✅ Frontend może wysyłać dane kolorów

## 🚨 **Rozwiązywanie problemów**

### **Błąd: "column already exists"**
```sql
-- Sprawdź czy kolumny już istnieją
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Lead' 
AND column_name IN ('borderColor', 'materialColor');
```

### **Błąd: "permission denied"**
- Upewnij się, że masz uprawnienia do modyfikacji tabeli
- Sprawdź czy jesteś zalogowany jako admin

### **Błąd API 500**
- Sprawdź logi w Supabase Dashboard → Logs
- Upewnij się, że kolumny zostały dodane poprawnie

## 📊 **Struktura tabeli po migracji**

```sql
CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "firstName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "company" TEXT,
  "jobTitle" TEXT,
  "industry" TEXT,
  "completeness" TEXT,
  "borderColor" TEXT DEFAULT NULL,      -- NOWA KOLUMNA
  "materialColor" TEXT DEFAULT NULL,    -- NOWA KOLUMNA
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
```

## 🎯 **Następne kroki**

Po wykonaniu migracji:
1. **Przetestuj formularz** - sprawdź czy kolory są zapisywane
2. **Sprawdź dane** - w Supabase Table Editor
3. **Zaktualizuj dokumentację** - jeśli potrzebne
4. **Deploy na produkcję** - jeśli testy przejdą

---

**✅ Po wykonaniu tej migracji, aplikacja będzie w pełni funkcjonalna z wyborem kolorów!**
