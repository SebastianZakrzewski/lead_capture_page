# Podsumowanie mapowania dywaników samochodowych

## 🎯 Cel
Zmapowanie wszystkich kombinacji dywaników samochodowych z katalogów `public/konfigurator/dywaniki` na model `CarMat` i wprowadzenie ich do tabeli Supabase.

## 📊 Analiza struktury katalogów

### Struktura główna:
- **3d/** - dywaniki z efektem 3D
- **klasyczne/** - dywaniki klasyczne

### Dostępne struktury materiałów:

#### 3D:
- **romby** (struktura diamentowa) - tylko z czarnym obszyciem

#### Klasyczne:
- **plaster miodu** (struktura plastra miodu)
- **romby** (struktura diamentowa)

## 🎨 Kolory i kombinacje

### Kolory materiału:
- beżowy, czarny, niebieski, brązowy, ciemnoniebieski
- ciemnozielony, ciemnoszary, kość słoniowa, jasnobeżowy
- lime, bordowy, pomarańczowy, różowy, fioletowy
- czerwony, biały, żółty

### Kolory obszycia:
- beżowy, bordowy, brązowy, ciemnoszary, czerwony
- fioletowy, ciemnoniebieski, jasnoszary, niebieski
- pomarańczowy, różowy, zielony, żółty, czarny

## 🔧 Implementacja

### 1. Model danych (`src/types/carMat.ts`)
```typescript
export interface CarMatData {
  matType: string; // 3D z rantami lub bez rantów
  cellStructure: string; // struktura komórek (romb/plaster miodu)
  materialColor: string; // kolor materiału
  borderColor: string; // kolor obszycia
  imagePath: string; // ścieżka do zdjęcia dywanika
}
```

### 2. Funkcja mapowania (`src/utils/carmatMapper.ts`)
- `generateAllCarMatCombinations()` - generuje wszystkie kombinacje
- `mapFileNameToCarMatData()` - mapuje nazwy plików na dane
- `generateImagePath()` - generuje ścieżki do obrazów
- `getCarMatStats()` - statystyki kombinacji

### 3. Serwis bazy danych (`src/backend/services/CarMatService.ts`)
- `bulkInsertCarMats()` - masowe wprowadzanie danych
- `getCarMatStats()` - statystyki z bazy danych
- `clearAllCarMats()` - czyszczenie tabeli

### 4. Endpointy API
- `POST /api/carmat/bulk-insert` - masowe operacje
- `POST /api/carmat/seed` - seedowanie bazy danych
- `GET /api/carmat/seed` - sprawdzanie stanu

## 📈 Wyniki

### Statystyki wprowadzonych danych:
- **Łączna liczba kombinacji**: 385
- **Dywaniki 3D z rantami**: 17 (tylko romby z czarnym obszyciem)
- **Dywaniki klasyczne**: 368
  - **Plaster miodu**: 130 kombinacji
  - **Romby**: 238 kombinacji

### Rozkład według typów:
- `3d-with-rims`: 17 rekordów
- `3d-without-rims`: 368 rekordów

### Rozkład według struktur:
- `rhombus`: 255 rekordów
- `honeycomb`: 130 rekordów

## 🗄️ Struktura tabeli Supabase

```sql
CREATE TABLE "CarMat" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "matType" TEXT NOT NULL,
  "cellStructure" TEXT NOT NULL,
  "materialColor" TEXT NOT NULL,
  "borderColor" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Jak używać

### 1. Seedowanie bazy danych:
```bash
curl -X POST http://localhost:3000/api/carmat/seed \
  -H "Content-Type: application/json" \
  -d '{"clearDatabase": true}'
```

### 2. Sprawdzanie stanu:
```bash
curl http://localhost:3000/api/carmat/seed
```

### 3. Pobieranie wszystkich dywaników:
```bash
curl http://localhost:3000/api/carmat
```

## 📁 Mapowanie plików

### Konwencja nazewnictwa:
- **3D**: `5os-3d-diamonds-[kolor_materiału]-[kolor_obszycia].webp`
- **Plaster miodu**: `5os-classic-honey-[kolor_materiału]-[kolor_obszycia].webp`
- **Romby klasyczne**: `5os-classic-diamonds-[kolor_materiału]-[kolor_obszycia].webp`

### Przykłady ścieżek:
- **3D**: `/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-beige-black.webp`
- **Plaster miodu**: `/konfigurator/dywaniki/klasyczne/plaster miodu/plaster bezowe obszycie/5os-classic-honey-black-beige.webp`
- **Romby klasyczne**: `/konfigurator/dywaniki/klasyczne/romby/romby czarne/5os-classic-diamonds-beige-black.webp`

### Automatyczne generowanie ścieżek:
Wszystkie kombinacje automatycznie zawierają pole `imagePath` z poprawną ścieżką do odpowiedniego pliku obrazu, co umożliwia łatwe wyświetlanie podglądu dywaników w aplikacji.

## ✅ Weryfikacja

Wszystkie 385 kombinacji zostały pomyślnie wprowadzone do bazy danych Supabase. Dane są gotowe do użycia w aplikacji konfiguratora dywaników samochodowych.

## 🔄 Możliwości rozszerzenia

1. **Dodanie nowych struktur** - łatwe rozszerzenie o nowe wzory
2. **Dodanie nowych kolorów** - automatyczne generowanie kombinacji
3. **Filtrowanie i wyszukiwanie** - zaawansowane zapytania
4. **Cache'owanie** - optymalizacja wydajności
5. **Walidacja obrazów** - sprawdzanie istnienia plików
