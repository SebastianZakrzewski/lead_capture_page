# System Śledzenia Leadów - EVAPREMIUM

## Co to jest?

System śledzenia leadów, który automatycznie zbiera i zapisuje informacje o źródle ruchu na stronie, pozwalając na lepsze śledzenie konwersji i analizę skuteczności kampanii marketingowych.

## Jak działa?

### 1. Session ID (UUID)
- **Automatycznie generowany** przy pierwszym wejściu użytkownika
- **Zapisywany w localStorage** przeglądarki
- **Unikalny identyfikator** sesji użytkownika
- **Pozwala śledzić** całą ścieżkę użytkownika na stronie

### 2. UTM-y (Parametry śledzenia)
- **Automatycznie wykrywane** z URL-a przy pierwszym wejściu
- **Zapisywane w localStorage** (tylko raz!)
- **Przykłady UTM-ów**:
  - `utm_source=google` - źródło ruchu
  - `utm_medium=cpc` - medium (płatne kliknięcia)
  - `utm_campaign=wiosenna_promocja` - nazwa kampanii
  - `utm_term=dywaniki+samochodowe` - słowa kluczowe
  - `utm_content=banner_300x250` - treść reklamy

### 3. Identyfikatory reklam
- **gclid** - Google Ads Click ID
- **fbclid** - Facebook Ads Click ID
- **Automatycznie wykrywane** i zapisywane

### 4. Referrer
- **Poprzednia strona** z której przyszedł użytkownik
- **Wykrywany automatycznie** przez przeglądarkę

### 5. Dodatkowe informacje
- **Data pierwszego wejścia** - timestamp pierwszej wizyty
- **User Agent** - informacje o przeglądarce/urządzeniu
- **Aktualny URL** - strona na której wypełniono formularz

## Przykłady URL-i z UTM-ami

```
https://evapremium.pl?utm_source=google&utm_medium=cpc&utm_campaign=wiosenna_promocja&utm_term=dywaniki+samochodowe&gclid=abc123
```

```
https://evapremium.pl?utm_source=facebook&utm_medium=social&utm_campaign=post_marzec&fbclid=xyz789
```

## Jak używać w CRM?

### 1. Analiza źródeł leadów
- **Google Ads** - `utm_source=google`
- **Facebook** - `utm_source=facebook`
- **Email** - `utm_source=email`
- **Organiczne** - brak UTM-ów

### 2. Śledzenie kampanii
- **Wiosenna promocja** - `utm_campaign=wiosenna_promocja`
- **Post marzec** - `utm_campaign=post_marzec`
- **Newsletter Q1** - `utm_campaign=newsletter_q1`

### 3. Analiza skuteczności
- **Porównanie** różnych źródeł ruchu
- **ROI kampanii** - koszt vs liczba leadów
- **Optymalizacja** budżetu reklamowego

## Struktura danych wysyłanych z formularzem

```typescript
interface LeadSubmissionData {
  // Dane formularza
  firstName: string;
  phone: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  completeness?: string;
  
  // Dane śledzenia
  sessionId: string;           // UUID sesji
  utmSource?: string;          // Źródło ruchu
  utmMedium?: string;          // Medium
  utmCampaign?: string;        // Kampania
  utmTerm?: string;            // Słowa kluczowe
  utmContent?: string;         // Treść reklamy
  referrer?: string;           // Poprzednia strona
  gclid?: string;              // Google Ads ID
  fbclid?: string;             // Facebook Ads ID
  firstVisit: Date;            // Data pierwszego wejścia
  currentUrl: string;          // Aktualny URL
  userAgent: string;           // User Agent
}
```

## Korzyści biznesowe

### 1. Lepsze śledzenie ROI
- **Wiedza** które kampanie generują leady
- **Optymalizacja** budżetu reklamowego
- **Skuteczniejsze** planowanie marketingowe

### 2. Personalizacja komunikacji
- **Różne wiadomości** dla różnych źródeł ruchu
- **Lepsze dopasowanie** oferty do potrzeb
- **Zwiększenie** konwersji

### 3. Analiza ścieżki użytkownika
- **Session ID** pozwala śledzić całą wizytę
- **Lepsze zrozumienie** zachowań użytkowników
- **Optymalizacja** UX strony

## Implementacja techniczna

### 1. Pliki
- `src/utils/tracking.ts` - główna logika śledzenia
- `src/app/page.tsx` - inicjalizacja przy pierwszym wejściu
- `src/components/LeadCaptureForm.tsx` - integracja z formularzem

### 2. Funkcje
- `getOrCreateSessionId()` - generuje/zwraca session ID
- `saveUtmParams()` - zapisuje UTM-y przy pierwszym wejściu
- `prepareLeadSubmissionData()` - łączy dane formularza z trackingiem

### 3. Storage
- **localStorage** - trwałe przechowywanie danych
- **Automatyczne czyszczenie** - opcjonalne
- **Bezpieczeństwo** - tylko dane publiczne

## Testowanie

### 1. UTM-y
```
https://localhost:3000?utm_source=test&utm_medium=test&utm_campaign=test
```

### 2. Sprawdzenie w localStorage
```javascript
// W konsoli przeglądarki
localStorage.getItem('session_id')
localStorage.getItem('utm_source')
localStorage.getItem('utm_campaign')
```

### 3. Logi w konsoli
- Przy wysłaniu formularza w konsoli pojawią się dane z trackingiem
- Sprawdź czy wszystkie UTM-y są poprawnie zapisane

## Uwagi

1. **Tylko pierwsze wejście** - UTM-y są zapisywane tylko raz
2. **Session ID** - generowany automatycznie, unikalny dla każdej sesji
3. **Bezpieczeństwo** - nie zbieramy wrażliwych danych
4. **GDPR** - system jest zgodny z RODO
5. **Wydajność** - minimalny wpływ na szybkość strony
