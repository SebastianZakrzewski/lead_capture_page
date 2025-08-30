# Baza Danych PostgreSQL - EVAPREMIUM Lead Management

## 🗄️ **Co zostało dodane:**

### 1. **Prisma ORM**
- Nowoczesny ORM dla Node.js i TypeScript
- Automatyczne generowanie typów TypeScript
- Migracje bazy danych
- Query builder z type safety

### 2. **Schemat Bazy Danych**
- Tabela `Lead` - główna tabela z leadami
- Tabela `LeadNote` - notatki do leadów
- Tabela `Task` - zadania dla leadów
- Tabela `CrmUser` - użytkownicy CRM
- Tabela `LeadHistory` - historia zmian
- Tabela `EmailTemplate` - szablony emaili
- Tabela `Automation` - automatyzacje
- Tabela `Report` - raporty
- Tabela `Webhook` - webhooki
- Tabela `Notification` - powiadomienia

### 3. **Serwisy Backendowe**
- `LeadService` - zarządzanie leadami
- `UserService` - zarządzanie użytkownikami
- Funkcje CRUD dla wszystkich tabel
- Analityka i statystyki

## 🚀 **Instalacja i Konfiguracja:**

### 1. **Zainstaluj PostgreSQL**

#### Windows:
```bash
# Pobierz z https://www.postgresql.org/download/windows/
# Lub użyj Chocolatey:
choco install postgresql
```

#### macOS:
```bash
# Użyj Homebrew:
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. **Utwórz Bazę Danych**

```bash
# Zaloguj się do PostgreSQL
sudo -u postgres psql

# Utwórz bazę danych
CREATE DATABASE evapremium_leads;

# Utwórz użytkownika (opcjonalnie)
CREATE USER evapremium_user WITH PASSWORD 'twoje_haslo';
GRANT ALL PRIVILEGES ON DATABASE evapremium_leads TO evapremium_user;

# Wyjdź
\q
```

### 3. **Skonfiguruj Zmienne Środowiskowe**

Skopiuj plik `env.example` do `.env` i zaktualizuj:

```bash
# Skopiuj plik
cp env.example .env

# Edytuj .env
DATABASE_URL="postgresql://evapremium_user:twoje_haslo@localhost:5432/evapremium_leads?schema=public"
```

### 4. **Wygeneruj Klienta Prisma**

```bash
# Generuj klienta Prisma
npx prisma generate

# Utwórz migrację
npx prisma migrate dev --name init

# (Opcjonalnie) Uruchom seed
npx prisma db seed
```

### 5. **Sprawdź Połączenie**

```bash
# Sprawdź połączenie z bazą
npx prisma studio
```

## 📊 **Struktura Bazy Danych:**

### **Tabela Lead (Główna)**
```sql
- id: String (UUID)
- firstName: String
- phone: String (wymagane)
- email: String (opcjonalne)
- company: String (marka i model auta)
- jobTitle: String (rok produkcji)
- industry: String (typ dywaników)
- completeness: String (rodzaj kompletu)
- sessionId: String (UUID sesji)
- utmSource, utmMedium, utmCampaign: String (UTM-y)
- gclid, fbclid: String (identyfikatory reklam)
- status: LeadStatus (PENDING, CONTACTED, CONVERTED, LOST, SPAM)
- priority: Priority (LOW, MEDIUM, HIGH, URGENT)
- assignedTo: String (ID agenta)
- createdAt, updatedAt: DateTime
```

### **Relacje**
- **Lead** → **LeadNote** (1:N)
- **Lead** → **Task** (1:N)
- **Lead** → **LeadHistory** (1:N)
- **CrmUser** → **LeadNote** (1:N)
- **CrmUser** → **Task** (1:N)

## 🔧 **Użycie w Kodzie:**

### **Tworzenie Leada**
```typescript
import { LeadService } from '@/backend/database';

const result = await LeadService.createLead(leadData);
if (result.success) {
  console.log('Lead utworzony:', result.data.id);
}
```

### **Pobieranie Leadów**
```typescript
const leads = await LeadService.getLeads({
  status: ['PENDING', 'CONTACTED'],
  source: ['google', 'facebook'],
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### **Aktualizacja Statusu**
```typescript
await LeadService.updateLeadStatus(leadId, 'CONTACTED', userId);
```

### **Statystyki**
```typescript
const stats = await LeadService.getLeadStats(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

## 📈 **Analityka i Raporty:**

### **Dostępne Metryki**
- Liczba leadów według statusu
- Liczba leadów według priorytetu
- Liczba leadów według źródła (UTM)
- Liczba leadów według kampanii
- Współczynnik konwersji
- Średni czas odpowiedzi
- Wartość konwersji

### **Filtrowanie**
- Według daty (od-do)
- Według statusu
- Według priorytetu
- Według źródła ruchu
- Według kampanii
- Według przypisanego agenta
- Wyszukiwanie tekstowe

## 🚨 **Bezpieczeństwo:**

### **Dane Wrażliwe**
- Hasła użytkowników (hashowane)
- Numery telefonów (częściowo ukryte w raportach)
- Adresy email (częściowo ukryte w raportach)

### **Audyt**
- Wszystkie zmiany są logowane
- Historia przypisań
- Historia zmian statusu
- IP i User Agent użytkowników

## 🔄 **Migracje i Aktualizacje:**

### **Tworzenie Nowej Migracji**
```bash
npx prisma migrate dev --name nazwa_zmiany
```

### **Reset Bazy (Development)**
```bash
npx prisma migrate reset
```

### **Deploy na Produkcję**
```bash
npx prisma migrate deploy
```

## 📱 **Prisma Studio:**

Uruchom graficzny interfejs do zarządzania bazą:

```bash
npx prisma studio
```

Otworzy się w przeglądarce na `http://localhost:5555`

## 🐛 **Rozwiązywanie Problemów:**

### **Błąd Połączenia**
```bash
# Sprawdź czy PostgreSQL działa
sudo systemctl status postgresql

# Sprawdź połączenie
npx prisma db pull
```

### **Błąd Migracji**
```bash
# Reset migracji
npx prisma migrate reset

# Sprawdź schemat
npx prisma validate
```

### **Błąd Typów**
```bash
# Regeneruj klienta
npx prisma generate

# Restart serwera dev
npm run dev
```

## 📚 **Przydatne Komendy:**

```bash
# Generuj klienta Prisma
npx prisma generate

# Utwórz migrację
npx prisma migrate dev --name nazwa

# Uruchom migracje
npx prisma migrate deploy

# Reset bazy (development)
npx prisma migrate reset

# Otwórz Prisma Studio
npx prisma studio

# Sprawdź połączenie
npx prisma db pull

# Waliduj schemat
npx prisma validate
```

## 🌟 **Korzyści:**

1. **Type Safety** - pełne wsparcie TypeScript
2. **Automatyczne Migracje** - łatwe aktualizacje schematu
3. **Query Builder** - intuicyjne zapytania
4. **Relacje** - automatyczne join-y
5. **Indeksy** - optymalizacja wydajności
6. **Audyt** - pełne śledzenie zmian
7. **Skalowalność** - gotowe na produkcję

## 🔮 **Następne Kroki:**

1. **Skonfiguruj bazę danych** zgodnie z instrukcjami
2. **Uruchom migracje** aby utworzyć tabele
3. **Zintegruj z formularzem** aby zapisywać leady
4. **Stwórz panel admina** do zarządzania leadami
5. **Dodaj automatyzacje** (email, powiadomienia)
6. **Stwórz raporty** i dashboard
