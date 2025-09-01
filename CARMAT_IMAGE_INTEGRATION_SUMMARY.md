# Integracja Funkcjonalności Mapowania Zdjęć Dywaników

## Przegląd

Zintegrowano funkcjonalność automatycznego mapowania wybranych opcji kolorów, struktury i typu dywaników na rzeczywiste zdjęcia produktów z bazy danych Supabase. System wykorzystuje serwis `CarMatService` do wyszukiwania odpowiednich zdjęć na podstawie konfiguracji wybranej przez użytkownika.

## Komponenty Zintegrowane

### 1. CarMatService - Nowa Metoda

**Metoda:** `findCarMatImageByOptions(options)`

```typescript
static async findCarMatImageByOptions(options: {
  matType: string;
  cellStructure: string;
  materialColor: string;
  borderColor: string;
})
```

**Funkcjonalność:**
- Mapuje typy z formularza na typy w bazie danych
- Mapuje struktury komórek z formularza na struktury w bazie danych  
- Mapuje kolory z formularza na kolory w bazie danych
- Wyszukuje w tabeli `CarMat` odpowiednie zdjęcie
- Zwraca ścieżkę do zdjęcia lub informację o błędzie

**Mapowanie Typów:**
- `3d-evapremium-z-rantami` → `3d-with-rims`
- `3d-evapremium-bez-rantow` → `3d-without-rims`
- `romb` → `rhombus`
- `plaster-miodu` → `honeycomb`

### 2. Hook useCarMatImage

**Lokalizacja:** `src/hooks/useCarMatImage.ts`

**Funkcjonalność:**
- Zarządza stanem ładowania zdjęć
- Obsługuje błędy wyszukiwania
- Automatycznie wyszukuje zdjęcia gdy wszystkie opcje są wybrane
- Czyści zdjęcia gdy opcje są zmienione

**Stan Hooka:**
- `imageData` - dane znalezionego zdjęcia
- `isLoading` - status ładowania
- `error` - błędy wyszukiwania
- `findImage()` - funkcja wyszukiwania
- `clearImage()` - funkcja czyszczenia

### 3. Integracja z Formularzem

**Lokalizacja:** `src/components/LeadCaptureForm.tsx`

**Funkcjonalność:**
- Automatyczne wyszukiwanie zdjęć po wybraniu wszystkich opcji
- Dynamiczne wyświetlanie rzeczywistych zdjęć produktów
- Fallback do domyślnego podglądu w przypadku błędów
- Wskaźniki statusu ładowania i błędów

**Sekcje Zaktualizowane:**
- Product Preview - wyświetla rzeczywiste zdjęcia
- Selected Options Summary - pokazuje status zdjęcia

## Przepływ Danych

### 1. Wybór Opcji przez Użytkownika
```
Użytkownik wybiera:
- Typ dywanika (3D z rantami/bez rantów)
- Strukturę komórek (romb/plaster miodu)
- Kolor materiału
- Kolor obszycia
```

### 2. Automatyczne Wyszukiwanie
```typescript
useEffect(() => {
  if (formData.industry && formData.structure && 
      formData.materialColor && formData.borderColor) {
    findImage({
      matType: formData.industry,
      cellStructure: formData.structure,
      materialColor: formData.materialColor,
      borderColor: formData.borderColor
    });
  } else {
    clearImage();
  }
}, [formData.industry, formData.structure, 
     formData.materialColor, formData.borderColor, 
     findImage, clearImage]);
```

### 3. Wyszukiwanie w Bazie Danych
```typescript
const { data, error } = await supabase
  .from('CarMat')
  .select('imagePath, matType, cellStructure, materialColor, borderColor')
  .eq('matType', mapMatType(options.matType))
  .eq('cellStructure', mapCellStructure(options.cellStructure))
  .eq('materialColor', mapColor(options.materialColor))
  .eq('borderColor', mapColor(options.borderColor))
  .single();
```

### 4. Wyświetlanie Wyniku
- **Ładowanie:** Spinner z ikoną `Loader2`
- **Sukces:** Rzeczywiste zdjęcie dywanika z bazy danych
- **Błąd:** Ikona błędu z komunikatem
- **Brak opcji:** Domyślny podgląd kolorów

## Obsługa Błędów

### 1. Błędy Wyszukiwania
- Nie znaleziono kombinacji w bazie danych
- Błędy połączenia z Supabase
- Błędy mapowania typów

### 2. Błędy Ładowania Zdjęć
- Nieprawidłowe ścieżki do plików
- Problemy z serwerem plików
- Fallback do domyślnego podglądu

### 3. Walidacja Opcji
- Sprawdzanie czy wszystkie wymagane opcje są wybrane
- Automatyczne czyszczenie gdy opcje są niepełne

## Korzyści Integracji

### 1. Dla Użytkownika
- **Rzeczywiste zdjęcia** produktów zamiast generycznych podglądów
- **Natychmiastowa wizualizacja** wybranej konfiguracji
- **Lepsze doświadczenie** zakupowe
- **Weryfikacja** dostępności kombinacji

### 2. Dla Systemu
- **Automatyczne mapowanie** bez ręcznej konfiguracji
- **Integracja z bazą danych** produktów
- **Skalowalność** - łatwe dodawanie nowych produktów
- **Spójność danych** między formularzem a bazą

### 3. Dla Biznesu
- **Zwiększenie konwersji** przez lepszą wizualizację
- **Redukcja błędów** zamówień
- **Profesjonalny wizerunek** sklepu
- **Lepsze zrozumienie** produktów przez klientów

## Techniczne Szczegóły

### 1. Wydajność
- Wyszukiwanie tylko gdy wszystkie opcje są wybrane
- Cachowanie wyników w stanie komponentu
- Lazy loading zdjęć

### 2. Bezpieczeństwo
- Walidacja danych wejściowych
- Obsługa błędów SQL injection
- Bezpieczne mapowanie typów

### 3. Dostępność
- Alt teksty dla zdjęć
- Wskaźniki statusu dla użytkowników
- Fallback dla niepełnosprawnych

## Testowanie

### 1. Scenariusze Testowe
- Wybór wszystkich opcji → wyświetlenie zdjęcia
- Zmiana opcji → automatyczne wyszukiwanie nowego zdjęcia
- Błędy w bazie danych → obsługa błędów
- Brak opcji → domyślny podgląd

### 2. Testy Integracyjne
- Połączenie z Supabase
- Mapowanie typów
- Obsługa błędów
- Wydajność wyszukiwania

## Przyszłe Rozszerzenia

### 1. Funkcjonalności
- Cachowanie zdjęć w localStorage
- Preload zdjęć dla popularnych kombinacji
- Animacje przejść między zdjęciami
- Zoom i obracanie zdjęć

### 2. Optymalizacje
- Kompresja zdjęć
- Lazy loading dla wielu zdjęć
- CDN dla statycznych plików
- Progressive Web App funkcje

## Podsumowanie

Integracja funkcjonalności mapowania zdjęć dywaników z serwisem `CarMatService` zapewnia:

1. **Automatyczne wyszukiwanie** zdjęć na podstawie wybranych opcji
2. **Rzeczywiste zdjęcia produktów** zamiast generycznych podglądów
3. **Lepsze doświadczenie użytkownika** i zwiększenie konwersji
4. **Skalowalną architekturę** łatwą do rozszerzania
5. **Profesjonalny wizerunek** sklepu z dywanikami samochodowymi

System jest gotowy do produkcji i może być dalej rozwijany zgodnie z potrzebami biznesowymi.
