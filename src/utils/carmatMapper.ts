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
  'darkgrey': 'darkgrey',
  'beige': 'beige',
  'lightbeige': 'lightbeige',
  'white': 'white',
  'ivory': 'ivory',
  // Border colors (form -> file) - specjalne mapowania
  'lightgrey': 'lightgrey',
  'darkgreen': 'green' // darkgreen border -> green folder
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
  const borderEn = FORM_TO_ENGLISH[borderColor] || borderColor;
  
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
      return `/konfigurator/dywaniki/classic/honeycomb/honey ${borderEn} trim/5os-classic-honey-${materialEn}-${borderEn}.webp`;
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

  // Available colors from form options
  const materialColors = ['red', 'black', 'blue', 'yellow', 'lime', 'orange', 'purple', 'brown', 'maroon', 'pink', 'darkblue', 'darkgreen', 'darkgrey', 'beige', 'lightbeige', 'white', 'ivory'];
  const borderColors = ['red', 'black', 'blue', 'yellow', 'orange', 'purple', 'brown', 'maroon', 'pink', 'darkblue', 'darkgreen', 'darkgrey', 'lightgrey', 'beige', 'lightbeige', 'white', 'ivory'];
  
  // 3D with rims - diamonds
  materialColors.forEach(materialColor => {
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

  // 3D with rims - honeycomb
  materialColors.forEach(materialColor => {
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

  // Classic without rims - diamonds
  materialColors.forEach(materialColor => {
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

  // Classic without rims - honeycomb
  materialColors.forEach(materialColor => {
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
 */
export function getAvailableMaterialColors(matType: string, cellStructure: string): string[] {
  return ['red', 'black', 'blue', 'yellow', 'lime', 'orange', 'purple', 'brown', 'maroon', 'pink', 'darkblue', 'darkgreen', 'darkgrey', 'beige', 'lightbeige', 'white', 'ivory'];
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
    }, {} as Record<string, number>)
  };
}