import { CarMatData } from '@/types/carMat';

// Mapowanie kolorów z nazw plików na standardowe nazwy
const COLOR_MAPPING: Record<string, string> = {
  'beige': 'beżowy',
  'black': 'czarny',
  'blue': 'niebieski',
  'brown': 'brązowy',
  'darkblue': 'ciemnoniebieski',
  'darkgreen': 'ciemnozielony',
  'darkgrey': 'ciemnoszary',
  'ivory': 'kość słoniowa',
  'lightbeige': 'jasnobeżowy',
  'lime': 'limonkowy',
  'maroon': 'bordowy',
  'orange': 'pomarańczowy',
  'pink': 'różowy',
  'purple': 'fioletowy',
  'red': 'czerwony',
  'white': 'biały',
  'yellow': 'żółty',
  'green': 'zielony'
};

// Mapowanie kolorów obszycia z polskich nazw na standardowe
const BORDER_COLOR_MAPPING: Record<string, string> = {
  'bezowe': 'beżowy',
  'bordowe': 'bordowy',
  'brazowe': 'brązowy',
  'ciemnoszare': 'ciemnoszary',
  'czerwone': 'czerwony',
  'fioletowe': 'fioletowy',
  'granatowe': 'ciemnoniebieski',
  'jasnoszare': 'jasnoszary',
  'niebieskie': 'niebieski',
  'pomaranczowe': 'pomarańczowy',
  'rozowe': 'różowy',
  'zielone': 'zielony',
  'ciemnozielone': 'zielony',
  'zolte': 'żółty',
  'czarne': 'czarny'
};

// Kolory materiału dostępne w różnych strukturach
const MATERIAL_COLORS = [
  'beżowy', 'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 'jasnobeżowy', 
  'lime', 'bordowy', 'pomarańczowy', 'różowy', 'fioletowy', 
  'czerwony', 'biały', 'żółty'
];

// Kolory obszycia dostępne dla różnych struktur
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BORDER_COLORS = [
  'beżowy', 'bordowy', 'brązowy', 'ciemnoszary', 'czerwony', 
  'fioletowy', 'ciemnoniebieski', 'jasnoszary', 'niebieski', 
  'pomarańczowy', 'różowy', 'zielony', 'żółty', 'czarny'
];

// Kolory materiału dostępne dla plaster miodu (klasyczne)
const HONEYCOMB_MATERIAL_COLORS = [
  'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 
  'jasnobeżowy', 'bordowy', 'czerwony'
];

// Kolory materiału dostępne dla plaster miodu 3D (z rantami)
const HONEYCOMB_3D_MATERIAL_COLORS = [
  'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 
  'jasnobeżowy', 'bordowy', 'czerwony'
];

// Kolory materiału dostępne dla rombów (klasyczne)
const RHOMBUS_MATERIAL_COLORS = [
  'beżowy', 'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 'jasnobeżowy', 
  'lime', 'bordowy', 'pomarańczowy', 'różowy', 'fioletowy', 
  'czerwony', 'biały', 'żółty'
];

// Kolory materiału dostępne dla rombów 3D
const RHOMBUS_3D_MATERIAL_COLORS = [
  'beżowy', 'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 'jasnobeżowy', 
  'lime', 'bordowy', 'pomarańczowy', 'różowy', 'fioletowy', 
  'czerwony', 'biały', 'żółty'
];

/**
 * Generuje wszystkie możliwe kombinacje dywaników na podstawie dostępnych plików
 */
export function generateAllCarMatCombinations(): CarMatData[] {
  const combinations: CarMatData[] = [];

  // 1. Dywaniki 3D - romby z czarnym obszyciem
  RHOMBUS_3D_MATERIAL_COLORS.forEach(materialColor => {
    const carMatData = {
      matType: '3d-with-rims',
      cellStructure: 'rhombus',
      materialColor,
      borderColor: 'czarny'
    };
    combinations.push({
      ...carMatData,
      imagePath: generateImagePath(carMatData)
    });
  });

  // 1b. Dywaniki 3D - plaster miodu z różnymi obszyciami
  const honeycomb3dBorderColors = [
    'beżowy', 'bordowy', 'brązowy', 'ciemnoszary', 'czarny', 'czerwony', 
    'fioletowy', 'ciemnoniebieski', 'jasnoszary', 'niebieski', 
    'pomarańczowy', 'różowy', 'zielony', 'żółty'
  ];

  honeycomb3dBorderColors.forEach(borderColor => {
    HONEYCOMB_3D_MATERIAL_COLORS.forEach(materialColor => {
      const carMatData = {
        matType: '3d-with-rims',
        cellStructure: 'honeycomb',
        materialColor,
        borderColor
      };
      combinations.push({
        ...carMatData,
        imagePath: generateImagePath(carMatData)
      });
    });
  });

  // 2. Dywaniki klasyczne - plaster miodu
  const honeycombBorderColors = [
    'beżowy', 'bordowy', 'brązowy', 'ciemnoszary', 'czarny', 'czerwony', 
    'fioletowy', 'ciemnoniebieski', 'jasnoszary', 'niebieski', 
    'pomarańczowy', 'różowy', 'zielony', 'żółty'
  ];

  honeycombBorderColors.forEach(borderColor => {
    HONEYCOMB_MATERIAL_COLORS.forEach(materialColor => {
      const carMatData = {
        matType: '3d-without-rims',
        cellStructure: 'honeycomb',
        materialColor,
        borderColor
      };
      combinations.push({
        ...carMatData,
        imagePath: generateImagePath(carMatData)
      });
    });
  });

  // 3. Dywaniki klasyczne - romby
  const rhombusBorderColors = [
    'fioletowy', 'beżowy', 'bordowy', 'brązowy', 'ciemnoszary', 
    'czarny', 'czerwony', 'ciemnoniebieski', 'jasnoszary', 
    'niebieski', 'pomarańczowy', 'różowy', 'zielony', 'żółty'
  ];

  rhombusBorderColors.forEach(borderColor => {
    RHOMBUS_MATERIAL_COLORS.forEach(materialColor => {
      const carMatData = {
        matType: '3d-without-rims',
        cellStructure: 'rhombus',
        materialColor,
        borderColor
      };
      combinations.push({
        ...carMatData,
        imagePath: generateImagePath(carMatData)
      });
    });
  });

  return combinations;
}

/**
 * Mapuje nazwę pliku na dane CarMat
 */
export function mapFileNameToCarMatData(fileName: string): CarMatData | null {
  // Parsowanie nazwy pliku 3D: 5os-3d-diamonds-[material]-[border].webp
  const match3D = fileName.match(/^5os-3d-diamonds-([^-]+)-([^-]+)\.webp$/);
  if (match3D) {
    const [, materialColor, borderColor] = match3D;
    const carMatData = {
      matType: '3d-with-rims',
      cellStructure: 'rhombus',
      materialColor: COLOR_MAPPING[materialColor] || materialColor,
      borderColor: COLOR_MAPPING[borderColor] || borderColor
    };
    return {
      ...carMatData,
      imagePath: generateImagePath(carMatData)
    };
  }

  // Parsowanie nazwy pliku klasycznego plaster miodu: 5os-classic-honey-[material]-[border].webp
  const matchHoney = fileName.match(/^5os-classic-honey-([^-]+)-([^-]+)\.webp$/);
  if (matchHoney) {
    const [, materialColor, borderColor] = matchHoney;
    const carMatData = {
      matType: '3d-without-rims',
      cellStructure: 'honeycomb',
      materialColor: COLOR_MAPPING[materialColor] || materialColor,
      borderColor: COLOR_MAPPING[borderColor] || borderColor
    };
    return {
      ...carMatData,
      imagePath: generateImagePath(carMatData)
    };
  }

  // Parsowanie nazwy pliku klasycznego romby: 5os-classic-diamonds-[material]-[border].webp
  const matchDiamonds = fileName.match(/^5os-classic-diamonds-([^-]+)-([^-]+)\.webp$/);
  if (matchDiamonds) {
    const [, materialColor, borderColor] = matchDiamonds;
    const carMatData = {
      matType: '3d-without-rims',
      cellStructure: 'rhombus',
      materialColor: COLOR_MAPPING[materialColor] || materialColor,
      borderColor: COLOR_MAPPING[borderColor] || borderColor
    };
    return {
      ...carMatData,
      imagePath: generateImagePath(carMatData)
    };
  }

  return null;
}

/**
 * Generuje ścieżkę do pliku obrazu na podstawie danych CarMat
 */
export function generateImagePath(carMatData: Omit<CarMatData, 'imagePath'>): string {
  const { matType, cellStructure, materialColor, borderColor } = carMatData;
  
  // Mapowanie kolorów z powrotem na nazwy plików
  // Dodatkowe aliasy dla polskich nazw materiału → token plikowy
  const POLISH_TO_FILE_TOKEN: Record<string, string> = {
    'zielony': 'lime',
    'jasnozielony': 'lime',
  };

  const materialColorKey = POLISH_TO_FILE_TOKEN[materialColor]
    || Object.keys(COLOR_MAPPING).find(key => COLOR_MAPPING[key] === materialColor)
    || materialColor.toLowerCase();
  
  const borderColorKey = Object.keys(COLOR_MAPPING).find(
    key => COLOR_MAPPING[key] === borderColor
  ) || borderColor.toLowerCase();

  if (matType === '3d-with-rims' && cellStructure === 'rhombus') {
    // Mapowanie kolorów obszycia na nazwy katalogów
    const borderFolderMapping: Record<string, string> = {
      'czarny': 'czarne',
      'beżowy': 'bezowy',
      'bordowy': 'bordowe',
      'brązowy': 'brazowy',
      'ciemnoszary': 'ciemnoszare',
      'czerwony': 'czerwone',
      'fioletowy': 'fioletowy',
      'ciemnoniebieski': 'granatowe',
      'jasnoszary': 'jasnoszary',
      'niebieski': 'niebieskie',
      'pomarańczowy': 'pomaranczowe',
      'różowy': 'rozowy',
      'zielony': 'zielone',
      'żółty': 'zolte'
    };
    
    const borderFolder = borderFolderMapping[borderColor] || 'czarne';
    return `/konfigurator/dywaniki/3d/romby/${borderFolder}/5os-3d-diamonds-${materialColorKey}-${borderColorKey}.webp`;
  }
  
  if (matType === '3d-without-rims' && cellStructure === 'honeycomb') {
    const borderFolder = Object.keys(BORDER_COLOR_MAPPING).find(
      key => BORDER_COLOR_MAPPING[key] === borderColor
    ) || borderColor.toLowerCase();
    
    // Specjalne mapowanie dla katalogu "plaster czarne" (bez "obszycie")
    const folderName = borderColor === 'czarny' ? 'plaster czarne' : `plaster ${borderFolder} obszycie`;
    
    return `/konfigurator/dywaniki/klasyczne/plaster miodu/${folderName}/5os-classic-honey-${materialColorKey}-${borderColorKey}.webp`;
  }
  
  if (matType === '3d-without-rims' && cellStructure === 'rhombus') {
    const borderFolder = Object.keys(BORDER_COLOR_MAPPING).find(
      key => BORDER_COLOR_MAPPING[key] === borderColor
    ) || borderColor.toLowerCase();
    return `/konfigurator/dywaniki/klasyczne/romby/romby ${borderFolder}/5os-classic-diamonds-${materialColorKey}-${borderColorKey}.webp`;
  }

  return '';
}

/**
 * Pobiera statystyki kombinacji
 */
export function getCarMatStats() {
  const combinations = generateAllCarMatCombinations();
  
  const stats = {
    total: combinations.length,
    byMatType: {} as Record<string, number>,
    byCellStructure: {} as Record<string, number>,
    byMaterialColor: {} as Record<string, number>,
    byBorderColor: {} as Record<string, number>,
    byImagePath: {} as Record<string, number>
  };

  combinations.forEach(combo => {
    stats.byMatType[combo.matType] = (stats.byMatType[combo.matType] || 0) + 1;
    stats.byCellStructure[combo.cellStructure] = (stats.byCellStructure[combo.cellStructure] || 0) + 1;
    stats.byMaterialColor[combo.materialColor] = (stats.byMaterialColor[combo.materialColor] || 0) + 1;
    stats.byBorderColor[combo.borderColor] = (stats.byBorderColor[combo.borderColor] || 0) + 1;
    stats.byImagePath[combo.imagePath] = (stats.byImagePath[combo.imagePath] || 0) + 1;
  });

  return stats;
}

/**
 * Mapowanie kolorów z polskich nazw na tokeny plikowe (dla formularza)
 */
const POLISH_TO_FILE_TOKEN: Record<string, string> = {
  'czarny': 'black',
  'niebieski': 'blue', 
  'brązowy': 'brown',
  'ciemnoniebieski': 'darkblue',
  'ciemnozielony': 'darkgreen',
  'ciemnoszary': 'darkgrey',
  'kość słoniowa': 'ivory',
  'jasnobeżowy': 'lightbeige',
  'bordowy': 'maroon',
  'czerwony': 'red',
  'beżowy': 'beige',
  'biały': 'white',
  'fioletowy': 'purple',
  'limonkowy': 'lime',
  'pomarańczowy': 'orange',
  'różowy': 'pink',
  'żółty': 'yellow'
};

/**
 * Pobiera dostępne kolory materiału dla danego typu i struktury
 */
export function getAvailableMaterialColors(matType: string, cellStructure: string): string[] {
  if (matType === '3d-with-rims' && cellStructure === 'honeycomb') {
    // Dla 3D plaster miodu - tylko kolory dostępne w plikach
    return HONEYCOMB_3D_MATERIAL_COLORS.map(color => POLISH_TO_FILE_TOKEN[color] || color);
  } else if (matType === '3d-with-rims' && cellStructure === 'rhombus') {
    // Dla 3D romby - wszystkie kolory
    return RHOMBUS_3D_MATERIAL_COLORS.map(color => POLISH_TO_FILE_TOKEN[color] || color);
  } else if (matType === '3d-without-rims' && cellStructure === 'honeycomb') {
    // Dla klasycznych plaster miodu
    return HONEYCOMB_MATERIAL_COLORS.map(color => POLISH_TO_FILE_TOKEN[color] || color);
  } else if (matType === '3d-without-rims' && cellStructure === 'rhombus') {
    // Dla klasycznych rombów - wszystkie kolory
    return RHOMBUS_MATERIAL_COLORS.map(color => POLISH_TO_FILE_TOKEN[color] || color);
  }
  
  // Fallback - wszystkie kolory
  return MATERIAL_COLORS.map(color => POLISH_TO_FILE_TOKEN[color] || color);
}
