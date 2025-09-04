# Integracja z Bitrix24 CRM

## Przegląd

System został zintegrowany z Bitrix24 CRM, umożliwiając automatyczne tworzenie leadów w kolumnie "Leady z Reklam" po wypełnieniu formularza.

## Struktura plików

```
src/
├── backend/
│   ├── services/
│   │   ├── Bitrix24Service.ts          # Główna klasa integracji z Bitrix24
│   │   └── LeadService.ts              # Rozszerzona o integrację Bitrix24
│   └── __tests__/
│       └── Bitrix24Service.test.ts     # Testy jednostkowe
├── app/
│   └── api/
│       └── test-bitrix24/
│           └── route.ts                # Endpoint do testowania
└── components/
    └── LeadCaptureForm.tsx             # Formularz z automatycznym tworzeniem leada
```

## Konfiguracja

### 1. Webhook Bitrix24
- **URL:** `https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/`
- **Uprawnienia:** `crm.contact.add`, `crm.contact.list`, `crm.deal.add`, `crm.activity.todo.add`

### 2. ID użytkownika
- **ID użytkownika:** `1`
- **ID kategorii deali:** `2` ("Leady z Reklam")

### 3. Baza danych
Uruchom migrację SQL:
```sql
-- Dodaj kolumny Bitrix24 do tabeli Lead
ALTER TABLE "Lead" ADD COLUMN "bitrix24ContactId" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "bitrix24DealId" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "bitrix24Synced" BOOLEAN DEFAULT FALSE;
```

## Funkcjonalności

### 1. Bitrix24Service
- `testConnection()` - testuje połączenie z Bitrix24
- `createEmptyDeal()` - tworzy pusty deal w kategorii "Leady z Reklam"
- `createContact()` - tworzy kontakt w Bitrix24
- `createDeal()` - tworzy deal w Bitrix24
- `createDealWithContact()` - tworzy deal z kontaktem
- `getDeals()` - pobiera listę deali z kategorii
- `getDealById()` - pobiera szczegóły deala

### 2. LeadService (rozszerzone)
- `createLeadWithBitrix24()` - tworzy lead z pełną integracją
- `createEmptyLeadInBitrix24()` - tworzy pusty lead do testów
- Mapowanie danych z formularza na pola Bitrix24

### 3. Automatyczne tworzenie leada
Po wypełnieniu formularza:
1. Lead jest zapisywany w Supabase
2. Automatycznie tworzony jest pusty lead w Bitrix24 (do testów)
3. Dane są mapowane na odpowiednie pola Bitrix24

## Testowanie

### 1. Test połączenia
```bash
curl -X GET http://localhost:3000/api/test-bitrix24
```

### 2. Test pustego leada
```bash
curl -X POST http://localhost:3000/api/test-bitrix24 \
  -H "Content-Type: application/json" \
  -d '{"action": "create-empty-lead"}'
```

### 3. Test połączenia
```bash
curl -X POST http://localhost:3000/api/test-bitrix24 \
  -H "Content-Type: application/json" \
  -d '{"action": "test-connection"}'
```

### 4. Pobierz listę deali
```bash
curl -X POST http://localhost:3000/api/test-bitrix24 \
  -H "Content-Type: application/json" \
  -d '{"action": "get-deals"}'
```

## Mapowanie pól

### Pola UTM
- `UTM_SOURCE` - Źródło ruchu
- `UTM_MEDIUM` - Medium reklamowe
- `UTM_CAMPAIGN` - Kampania reklamowa
- `UTM_TERM` - Słowa kluczowe
- `UTM_CONTENT` - Treść reklamy

### Pola produktu
- `AUTO_ROK` - Rok auta
- `TYP_DYWANIKOW` - Typ dywaników
- `STRUKTURA` - Struktura komórek
- `KOLOR_MATERIALU` - Kolor materiału
- `KOLOR_OBSZYCIA` - Kolor obszycia

### Pola feedbackowe
- `FEEDBACK_EASE` - Łatwość wyboru (1-5)
- `FEEDBACK_CLARITY` - Przejrzystość (1-5)
- `FEEDBACK_SPEED` - Szybkość (1-5)
- `FEEDBACK_EXPERIENCE` - Wrażenie (1-5)
- `FEEDBACK_RECOMMEND` - Polecenie (1-10)
- `FEEDBACK_COMMENTS` - Uwagi

## Uruchomienie testów

```bash
# Testy jednostkowe
npm test src/backend/__tests__/Bitrix24Service.test.ts

# Testy integracyjne
npm run test:integration
```

## Logi

Wszystkie operacje są logowane w konsoli z prefiksami:
- `🚀` - Rozpoczęcie operacji
- `✅` - Sukces
- `❌` - Błąd
- `⚠️` - Ostrzeżenie
- `🔍` - Debug

## Obsługa błędów

System jest odporny na błędy:
- Jeśli Bitrix24 nie działa, lead i tak zostanie zapisany w Supabase
- Błędy są logowane ale nie przerywają procesu
- Użytkownik otrzymuje informację o statusie synchronizacji

## Następne kroki

1. **Dodaj pola w Bitrix24** - utwórz wszystkie pola niestandardowe w lejku "Leady z Reklam"
2. **Przetestuj integrację** - użyj endpointów testowych
3. **Włącz pełną integrację** - zamień `createEmptyLeadInBitrix24()` na `createLeadWithBitrix24()`
4. **Monitoruj logi** - sprawdzaj status synchronizacji w konsoli
