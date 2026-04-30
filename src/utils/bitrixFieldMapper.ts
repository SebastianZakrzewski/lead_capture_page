import { LeadSubmissionData } from './tracking';

/**
 * Mapuje dane z formularza na pola Bitrix24 w kolumnie "Leady z Reklam"
 */

// Mapowanie kolorów materiału z formularza na ID Bitrix24
const MATERIAL_COLOR_MAP: Record<string, string> = {
  'red': '290', // CZERWONY
  'black': '278', // CZARNY
  'blue': '286', // NIEBIESKI
  'yellow': '304', // ŻÓŁTY
  'lime': '288', // ZIELONY
  'orange': '306', // POMARAŃCZOWY
  'purple': '300', // FIOLETOWY
  'brown': '280', // BRĄZOWY
  'maroon': '292', // BORDOWY
  'pink': 'RÓŻOWY', // RÓŻOWY - nie ma w enum, zostawiamy nazwę
  'darkblue': '284', // GRANATOWY
  'darkgreen': '302', // JASNOZIELONY
  'darkgrey': '282', // CIEMNOSZARY
  'beige': '298', // BEŻOWY
  'lightbeige': '294', // JASNOBEŻOWY
  'white': '308', // BIAŁY
  'ivory': '296' // KOŚĆ SŁONIOWA
};

// Mapowanie kolorów obszycia z formularza na ID Bitrix24
const BORDER_COLOR_MAP: Record<string, string> = {
  'red': '364', // CZERWONY
  'black': '362', // CZARNY
  'blue': '376', // NIEBIESKI
  'yellow': '382', // ŻÓŁTY
  'lime': '378', // ZIELONY
  'orange': '380', // POMARAŃĆZOWY
  'purple': '386', // FIOLETOWY
  'brown': '370', // BRĄZOWY
  'maroon': '384', // BORDOWY
  'pink': '388', // RÓŻOWY
  'darkblue': '374', // GRANATOWY
  'darkgreen': '378', // ZIELONY (używamy tego samego ID co lime)
  'darkgrey': '368', // CIEMNOSZARY
  'lightgrey': '366', // JASNOSZARY
  'beige': '372', // BEŻOWY
  'lightbeige': 'JASNOBEŻOWY', // JASNOBEŻOWY - nie ma w enum, zostawiamy nazwę
  'white': 'BIAŁY', // BIAŁY - nie ma w enum, zostawiamy nazwę
  'ivory': 'KOŚĆ SŁONIOWA' // KOŚĆ SŁONIOWA - nie ma w enum, zostawiamy nazwę
};

// Mapowanie rodzaju kompletu z formularza na ID Bitrix24
const COMPLETENESS_MAP: Record<string, string> = {
  'dywanik-kierowcy': '270', // Przód
  'przod': '270', // Przód
  'przod-tyl': '274', // Przód + Tył
  'przod-tyl-bagaznik': '276' // Przód + Tył + Bagażnik
};

// Mapowanie struktury komórek z formularza na ID Bitrix24
const STRUCTURE_MAP: Record<string, string> = {
  'romb': '360', // Romby
  'plaster-miodu': '358' // Plaster Miodu
};

// Mapowanie rodzaju kompletu z formularza na ID Bitrix24
const MAT_TYPE_MAP: Record<string, string> = {
  '3d-evapremium-z-rantami': '264', // 3D EVAPREMIUM Z RANTAMI
  '3d-evapremium-bez-rantow': '266', // 3D EVAPREMIUM BEZ RANTÓW
  'klasyczne-evapremium': '266', // Klasyczne EVAPREMIUM
  'niestandardowy': '268' // Niestandardowy
};

export interface Bitrix24LeadFields {
  // Pola podstawowe
  UF_CRM_1757024093869?: string; // Imie
  UF_CRM_1757024079437?: string; // Nazwisko
  UF_CRM_1757024121436?: number; // Telefon
  UF_CRM_1757024023213?: string; // Źródło (META)
  
  // Pola produktu
  UF_CRM_1757024835301?: string; // Rodzaj kompletu
  UF_CRM_1757024931236?: string; // Wariant kompletu
  UF_CRM_1757025126670?: string; // Kolor materiału
  UF_CRM_1757177134448?: string; // Kształt komórek
  UF_CRM_1757177281489?: string; // Kolor obszycia
  
  // Pola dodatkowe
  UF_CRM_1757178018809?: string; // Marka i Model
  UF_CRM_1757178102552?: string; // Rok Produkcji
  UF_CRM_1757178178553?: string; // Dodatkowe uwagi dział produkcji
  UF_CRM_1757177926352?: string; // Wypełnił Ankiete
}

/**
 * Mapuje dane z formularza na pola Bitrix24 w kolumnie "Leady z Reklam"
 */
export function mapFormDataToBitrix24Fields(leadData: LeadSubmissionData): Bitrix24LeadFields {
  const fields: Bitrix24LeadFields = {};

  // Pola podstawowe użytkownika
  if (leadData.firstName) {
    fields.UF_CRM_1757024093869 = leadData.firstName; // Imie
  }

  if (leadData.lastName) {
    fields.UF_CRM_1757024079437 = leadData.lastName; // Nazwisko
  }

  if (leadData.phone) {
    // Konwersja telefonu na number (usuwamy wszystkie znaki oprócz cyfr)
    const phoneNumber = leadData.phone.replace(/\D/g, '');
    fields.UF_CRM_1757024121436 = parseInt(phoneNumber) || 0; // Telefon
  }

  // Źródło - META tylko dla Facebook/META ADS, w przeciwnym razie puste
  if (leadData.utmSource === 'facebook' || leadData.utmSource === 'meta' || leadData.fbclid) {
    fields.UF_CRM_1757024023213 = '262'; // META
  }
  // Jeśli nie ma źródła Facebook, pole pozostanie puste (nie ustawiamy domyślnej wartości)

  // Pola produktu
  if (leadData.industry) {
    const mappedIndustry = MAT_TYPE_MAP[leadData.industry] || '268';
    fields.UF_CRM_1757024835301 = mappedIndustry; // Rodzaj kompletu
    console.log('🏷️ Mapowanie rodzaju kompletu:', leadData.industry, '->', mappedIndustry);
  }

  if (leadData.completeness) {
    fields.UF_CRM_1757024931236 = COMPLETENESS_MAP[leadData.completeness] || '270'; // Wariant kompletu
  }

  if (leadData.materialColor) {
    const mappedMaterialColor = MATERIAL_COLOR_MAP[leadData.materialColor] || '278'; // CZARNY
    fields.UF_CRM_1757025126670 = mappedMaterialColor; // Kolor materiału
    console.log('🎨 Mapowanie koloru materiału:', leadData.materialColor, '->', mappedMaterialColor);
  }

  if (leadData.structure) {
    const mappedStructure = STRUCTURE_MAP[leadData.structure] || '358';
    fields.UF_CRM_1757177134448 = mappedStructure; // Kształt komórek
    console.log('🔧 Mapowanie struktury:', leadData.structure, '->', mappedStructure);
  }

  if (leadData.borderColor) {
    const mappedBorderColor = BORDER_COLOR_MAP[leadData.borderColor] || '364'; // CZERWONY
    fields.UF_CRM_1757177281489 = mappedBorderColor; // Kolor obszycia
    console.log('🎨 Mapowanie koloru obszycia:', leadData.borderColor, '->', mappedBorderColor);
  }

  // Pola dodatkowe
  if (leadData.company) {
    fields.UF_CRM_1757178018809 = leadData.company; // Marka i Model
  }

  if (leadData.jobTitle) {
    fields.UF_CRM_1757178102552 = leadData.jobTitle; // Rok Produkcji
  }

  if (leadData.message) {
    fields.UF_CRM_1757178178553 = leadData.message; // Dodatkowe uwagi dział produkcji
  }

  // Flaga wypełnienia ankiety - TAK jeśli jakiekolwiek pole feedback ma wartość
  const hasFeedback = leadData.feedbackEaseOfChoice !== null && leadData.feedbackEaseOfChoice !== undefined ||
                     leadData.feedbackFormClarity !== null && leadData.feedbackFormClarity !== undefined ||
                     leadData.feedbackLoadingSpeed !== null && leadData.feedbackLoadingSpeed !== undefined ||
                     leadData.feedbackOverallExperience !== null && leadData.feedbackOverallExperience !== undefined ||
                     leadData.feedbackWouldRecommend !== null && leadData.feedbackWouldRecommend !== undefined ||
                     (leadData.feedbackAdditionalComments && leadData.feedbackAdditionalComments.trim() !== '');
  
  fields.UF_CRM_1757177926352 = hasFeedback ? 'TAK' : 'NIE'; // Wypełnił Ankiete

  return fields;
}

/**
 * Mapuje dane z formularza na dane kontaktu Bitrix24
 */
export function mapToBitrix24Contact(leadData: LeadSubmissionData) {
  return {
    NAME: leadData.firstName || '',
    LAST_NAME: leadData.lastName || '',
    PHONE: leadData.phone ? [{
      VALUE: leadData.phone,
      VALUE_TYPE: "WORK"
    }] : undefined,
    EMAIL: leadData.email ? [{
      VALUE: leadData.email,
      VALUE_TYPE: "WORK"
    }] : undefined,
    COMMENTS: formatContactComments(leadData),
    SOURCE_ID: mapUtmSource(leadData.utmSource),
    SOURCE_DESCRIPTION: leadData.utmCampaign
  };
}

/**
 * Mapuje dane z formularza na dane deala Bitrix24 z nowymi polami
 */
export function mapToBitrix24Deal(leadData: LeadSubmissionData) {
  const leadFields = mapFormDataToBitrix24Fields(leadData);
  
  console.log('🔍 mapToBitrix24Deal - dane wejściowe:', {
    industry: leadData.industry,
    completeness: leadData.completeness,
    structure: leadData.structure,
    materialColor: leadData.materialColor,
    borderColor: leadData.borderColor
  });
  
  console.log('🔍 mapToBitrix24Deal - zmapowane pola:', leadFields);
  
  return {
    TITLE: `Dywaniki EVAPREMIUM - ${leadData.company || 'Nowy Lead'}`,
    CATEGORY_ID: 2, // "Leady z Reklam"
    STAGE_ID: "NEW",
    STAGE_SEMANTIC_ID: "P",
    CURRENCY_ID: "PLN",
    OPPORTUNITY: 0,
    COMMENTS: formatDealComments(leadData),
    SOURCE_ID: mapUtmSource(leadData.utmSource),
    SOURCE_DESCRIPTION: leadData.utmCampaign,
    TYPE_ID: "SALE",
    
    // UTM tracking
    UTM_SOURCE: leadData.utmSource,
    UTM_MEDIUM: leadData.utmMedium,
    UTM_CAMPAIGN: leadData.utmCampaign,
    UTM_TERM: leadData.utmTerm,
    UTM_CONTENT: leadData.utmContent,
    
    // Nowe pola z kolumny "Leady z Reklam"
    ...leadFields
  };
}

/**
 * Formatuje komentarze kontaktu
 */
function formatContactComments(leadData: LeadSubmissionData): string {
  const comments = [];
  
  if (leadData.company) comments.push(`Marka i model: ${leadData.company}`);
  if (leadData.jobTitle) comments.push(`Rok produkcji: ${leadData.jobTitle}`);
  if (leadData.industry) comments.push(`Typ dywaników: ${leadData.industry}`);
  if (leadData.completeness) comments.push(`Wariant: ${leadData.completeness}`);
  if (leadData.structure) comments.push(`Struktura: ${leadData.structure}`);
  if (leadData.materialColor) comments.push(`Kolor materiału: ${leadData.materialColor}`);
  if (leadData.borderColor) comments.push(`Kolor obszycia: ${leadData.borderColor}`);
  
  return comments.join('\n');
}

/**
 * Formatuje komentarze deala
 */
function formatDealComments(leadData: LeadSubmissionData): string {
  const comments = [];
  
  comments.push('Lead z formularza konfiguratora dywaników');
  if (leadData.utmSource) comments.push(`Źródło: ${leadData.utmSource}`);
  if (leadData.utmCampaign) comments.push(`Kampania: ${leadData.utmCampaign}`);
  if (leadData.message) comments.push(`Uwagi: ${leadData.message}`);
  
  return comments.join('\n');
}

/**
 * Mapuje UTM source na ID źródła w Bitrix24
 */
function mapUtmSource(utmSource?: string): string {
  const sourceMap: Record<string, string> = {
    'google': 'WEB',
    'facebook': 'WEB',
    'instagram': 'WEB',
    'direct': 'WEB',
    'email': 'EMAIL',
    'sms': 'SMS',
    'phone': 'PHONE'
  };
  return sourceMap[utmSource || ''] || 'WEB';
}

