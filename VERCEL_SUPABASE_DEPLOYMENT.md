# 🚀 Wdrożenie na Vercel + Supabase (DARMOWE!)

## 📋 **Wymagania wstępne**

- ✅ Konto na GitHub
- ✅ Konto na Vercel (darmowe)
- ✅ Konto na Supabase (darmowe)

## 🗄️ **Krok 1: Konfiguracja Supabase (Baza danych)**

### **1.1 Utwórz projekt na Supabase**
1. Wejdź na [supabase.com](https://supabase.com)
2. Kliknij "Start your project"
3. Zaloguj się przez GitHub
4. Kliknij "New Project"

### **1.2 Konfiguracja projektu**
```
🏗️ Organization: Wybierz swoją organizację
📝 Name: evapremium-leads
🔐 Database Password: wymyśl_bezpieczne_haslo_123
🌍 Region: Frankfurt (EU Central) - najbliżej Polski
💰 Pricing Plan: Free tier
```

### **1.3 Pobierz dane połączenia**
Po utworzeniu projektu:
1. Przejdź do **Settings** → **Database**
2. Skopiuj **Connection string** (URI)
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## 🌐 **Krok 2: Konfiguracja Vercel (Hosting)**

### **2.1 Utwórz projekt na Vercel**
1. Wejdź na [vercel.com](https://vercel.com)
2. Zaloguj się przez GitHub
3. Kliknij "New Project"
4. Importuj swój repository z GitHub

### **2.2 Konfiguracja zmiennych środowiskowych**
W Vercel Dashboard → Project Settings → Environment Variables:

```
NODE_ENV = production
DATABASE_URL = postgresql://postgres:twoje_haslo@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_APP_URL = https://twoj-projekt.vercel.app
NEXT_PUBLIC_API_URL = https://twoj-projekt.vercel.app/api
```

## 🔧 **Krok 3: Przygotowanie lokalne**

### **3.1 Commit i push na GitHub**
```bash
# Dodaj wszystkie pliki
git add .

# Commit zmian
git commit -m "🚀 Przygotowanie do wdrożenia na Vercel + Supabase"

# Push na GitHub
git push origin main
```

### **3.2 Sprawdź czy masz pliki:**
- ✅ `vercel.json` - konfiguracja Vercel
- ✅ `prisma/schema.prisma` - schemat PostgreSQL
- ✅ `package.json` - zależności

## 🚀 **Krok 4: Wdrożenie**

### **4.1 Automatyczne wdrożenie**
1. Po push na GitHub, Vercel automatycznie:
   - Wykryje zmiany
   - Zbuduje aplikację
   - Wdroży na serwer

### **4.2 Sprawdź status wdrożenia**
- Vercel Dashboard → Deployments
- Zielona kropka = ✅ Sukces
- Czerwona kropka = ❌ Błąd

## 🗄️ **Krok 5: Konfiguracja bazy danych**

### **5.1 Uruchom migracje Prisma**
```bash
# W Vercel Dashboard → Functions → Terminal
npx prisma migrate deploy
npx prisma generate
```

### **5.2 Alternatywnie - przez Supabase SQL Editor**
```sql
-- Utwórz tabelę Lead
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
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- Utwórz indeksy
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
```

## 🔍 **Krok 6: Weryfikacja**

### **6.1 Sprawdź czy aplikacja działa**
- Otwórz URL z Vercel
- Wypełnij formularz
- Sprawdź czy lead został zapisany

### **6.2 Sprawdź bazę danych**
- Supabase Dashboard → Table Editor
- Tabela "Lead" powinna zawierać nowe wpisy

### **6.3 Sprawdź logi**
- Vercel Dashboard → Functions → Logs
- Supabase Dashboard → Logs

## 🛡️ **Krok 7: Bezpieczeństwo**

### **7.1 Row Level Security (RLS) w Supabase**
```sql
-- Włącz RLS
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;

-- Polityka dla insert (tylko zapisywanie)
CREATE POLICY "Enable insert for authenticated users only" ON "Lead"
FOR INSERT WITH CHECK (true);

-- Polityka dla select (tylko odczyt)
CREATE POLICY "Enable read access for all users" ON "Lead"
FOR SELECT USING (true);
```

### **7.2 API Keys**
- Supabase Dashboard → Settings → API
- Skopiuj `anon` public key (jeśli potrzebujesz)

## 📊 **Krok 8: Monitoring**

### **8.1 Vercel Analytics**
- Dashboard → Analytics
- Widzisz ruch, wydajność, błędy

### **8.2 Supabase Monitoring**
- Dashboard → Reports
- Użycie bazy, wydajność zapytań

## 🚨 **Rozwiązywanie problemów**

### **Błąd połączenia z bazą:**
```
❌ Error: connect ECONNREFUSED
✅ Rozwiązanie: Sprawdź DATABASE_URL w Vercel
```

### **Błąd migracji:**
```
❌ Error: relation "Lead" does not exist
✅ Rozwiązanie: Uruchom migracje lub stwórz tabelę ręcznie
```

### **Błąd build:**
```
❌ Error: Build failed
✅ Rozwiązanie: Sprawdź logi w Vercel Dashboard
```

## ✅ **Lista kontrolna wdrożenia**

- [ ] Projekt Supabase utworzony
- [ ] DATABASE_URL skopiowany
- [ ] Projekt Vercel utworzony
- [ ] Zmienne środowiskowe ustawione
- [ ] Kod push na GitHub
- [ ] Automatyczne wdrożenie Vercel
- [ ] Migracje Prisma uruchomione
- [ ] Formularz działa na produkcji
- [ ] Leady zapisują się w bazie
- [ ] RLS włączony (opcjonalnie)

## 🎯 **Korzyści tego rozwiązania:**

- ✅ **Darmowe** - 0 zł przez pierwsze miesiące
- ✅ **Automatyczne** - wdrożenie z GitHub
- ✅ **Skalowalne** - rośnie z Twoim biznesem
- ✅ **Bezpieczne** - HTTPS, backup, monitoring
- ✅ **Szybkie** - wdrożenie w 30 minut

---

**🚀 Po wykonaniu wszystkich kroków Twój formularz będzie działał na Vercel z bazą Supabase!**
