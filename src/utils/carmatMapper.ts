import { CarMatData } from '@/types/carMat';

/**
 * Simple and effective CarMat mapper based on actual file structure
 * Maps form values directly to file paths
 */

// Form field mappings to English file names
const FORM_TO_ENGLISH: Record<string, string> = {
  // Material colors (form -> file)
  'red': 'red',
  'black': 'black', 
  'blue': 'blue',
  'yellow': 'yellow',
  'lime': 'lime',
  'orange': 'orange',
  'purple': 'purple',
  'brown': 'brown',
  'maroon': 'maroon',
  'pink': 'pink',
  'darkblue': 'darkblue',
  'darkgreen': 'darkgreen', // darkgreen material -> darkgreen in filename
  'darkgrey': 'darkgrey',
  'beige': 'beige',
  'lightbeige': 'lightbeige',
  'white': 'white',
  'ivory': 'ivory',
  // Border colors (form -> file) - specjalne mapowania
  'lightgrey': 'lightgrey'
};

/**
 * Generate image path based on form selections
 */
export function generateImagePath(options: {
  matType: string;
  cellStructure: string;
  materialColor: string;
  borderColor: string;
}): string {
  const { matType, cellStructure, materialColor, borderColor } = options;
  
  // Map form values to English file names
  const materialEn = FORM_TO_ENGLISH[materialColor] || materialColor;
  // Special mapping for darkgreen border -> green folder
  const borderEn = borderColor === 'darkgreen' ? 'green' : (FORM_TO_ENGLISH[borderColor] || borderColor);
  
  // Map form types to file structure
  if (matType === '3d-evapremium-z-rantami') {
    // 3D with rims: /3d/{structure}/{borderColor}/
    if (cellStructure === 'romb') {
      return `/konfigurator/dywaniki/3d/diamonds/${borderEn}/5os-3d-diamonds-${materialEn}-${borderEn}.webp`;
    } else if (cellStructure === 'plaster-miodu') {
      return `/konfigurator/dywaniki/3d/honey/${borderEn}/5os-3d-honey-${materialEn}-${borderEn}.webp`;
    }
  } else if (matType === '3d-evapremium-bez-rantow') {
    // Classic without rims: /classic/{structure}/{structure} {borderColor}/
    if (cellStructure === 'romb') {
      return `/konfigurator/dywaniki/classic/diamonds/diamonds ${borderEn}/5os-classic-diamonds-${materialEn}-${borderEn}.webp`;
    } else if (cellStructure === 'plaster-miodu') {
      // Specjalne mapowanie dla plaster miodu: black ma folder "honey black", inne kolory mają "honey {kolor} trim"
      const folderName = borderEn === 'black' ? `honey ${borderEn}` : `honey ${borderEn} trim`;
      return `/konfigurator/dywaniki/classic/honeycomb/${folderName}/5os-classic-honey-${materialEn}-${borderEn}.webp`;
    }
  }
  
  // Fallback
  return `/konfigurator/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp`;
}

/**
 * Generate all possible combinations for database seeding
 */
export function generateAllCarMatCombinations(): CarMatData[] {
  const combinations: CarMatData[] = [];

  // Available colors based on actual database analysis
  const allMaterialColors = ['red', 'black', 'blue', 'yellow', 'lime', 'orange', 'purple', 'brown', 'maroon', 'pink', 'darkblue', 'darkgreen', 'darkgrey', 'beige', 'white'];
  const borderColors = ['red', 'black', 'blue', 'yellow', 'orange', 'purple', 'brown', 'maroon', 'pink', 'darkblue', 'darkgreen', 'darkgrey', 'lightgrey', 'beige'];
  
  // Get available colors for each structure
  const rhombusColors = getAvailableMaterialColors('3d-with-rims', 'rhombus');
  const honeycombColors = getAvailableMaterialColors('3d-with-rims', 'honeycomb');

  // 3D with rims - diamonds (romb)
  rhombusColors.forEach(materialColor => {
    borderColors.forEach(borderColor => {
      combinations.push({
        matType: '3d-with-rims',
        cellStructure: 'rhombus',
        materialColor,
        borderColor,
        imagePath: generateImagePath({
          matType: '3d-evapremium-z-rantami',
          cellStructure: 'romb',
        materialColor,
        borderColor
        })
      });
    });
  });

  // 3D with rims - honeycomb (plaster miodu)
  honeycombColors.forEach(materialColor => {
    borderColors.forEach(borderColor => {
      combinations.push({
        matType: '3d-with-rims',
        cellStructure: 'honeycomb',
        materialColor,
        borderColor,
        imagePath: generateImagePath({
          matType: '3d-evapremium-z-rantami',
          cellStructure: 'plaster-miodu',
        materialColor,
        borderColor
        })
      });
    });
  });

  // Classic without rims - diamonds (romb)
  rhombusColors.forEach(materialColor => {
    borderColors.forEach(borderColor => {
      combinations.push({
        matType: '3d-without-rims',
        cellStructure: 'rhombus',
        materialColor,
        borderColor,
        imagePath: generateImagePath({
          matType: '3d-evapremium-bez-rantow',
          cellStructure: 'romb',
        materialColor,
        borderColor
        })
      });
    });
  });

  // Classic without rims - honeycomb (plaster miodu)
  honeycombColors.forEach(materialColor => {
    borderColors.forEach(borderColor => {
      combinations.push({
        matType: '3d-without-rims',
        cellStructure: 'honeycomb',
        materialColor,
        borderColor,
        imagePath: generateImagePath({
          matType: '3d-evapremium-bez-rantow',
          cellStructure: 'plaster-miodu',
        materialColor,
        borderColor
        })
      });
    });
  });

  return combinations;
}

/**
 * Get available material colors for given mat type and structure
 * Based on actual data from database analysis
 */
export function getAvailableMaterialColors(matType: string, cellStructure: string): string[] {
  // Kolory dostępne dla plaster miodu (honeycomb)
  const honeycombColors = [
    'black', 'blue', 'brown', 'darkblue', 'darkgreen', 
    'darkgrey', 'ivory', 'lightbeige', 'maroon', 'red'
  ];
  
  // Kolory dostępne dla rombów (rhombus)
  const rhombusColors = [
    'beige', 'black', 'blue', 'brown', 'darkblue', 'darkgreen', 
    'darkgrey', 'ivory', 'lightbeige', 'lime', 'maroon', 'orange', 
    'pink', 'purple', 'red', 'white', 'yellow'
  ];

  // Mapowanie struktur komórek
  if (cellStructure === 'honeycomb' || cellStructure === 'plaster-miodu') {
    return honeycombColors;
  }
  
  if (cellStructure === 'rhombus' || cellStructure === 'romb') {
    return rhombusColors;
  }

  // Domyślnie zwróć wszystkie kolory (fallback)
  return [...honeycombColors, ...rhombusColors].filter((color, index, array) => array.indexOf(color) === index);
}

/**
 * Get statistics about combinations
 */
export function getCarMatStats() {
  const combinations = generateAllCarMatCombinations();
  
  return {
    total: combinations.length,
    byMatType: combinations.reduce((acc, combo) => {
      acc[combo.matType] = (acc[combo.matType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCellStructure: combinations.reduce((acc, combo) => {
      acc[combo.cellStructure] = (acc[combo.cellStructure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byMaterialColor: combinations.reduce((acc, combo) => {
      acc[combo.materialColor] = (acc[combo.materialColor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byBorderColor: combinations.reduce((acc, combo) => {
      acc[combo.borderColor] = (acc[combo.borderColor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}