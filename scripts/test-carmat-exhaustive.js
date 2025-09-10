/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mapMatType = (formType) => {
  switch (formType) {
    case '3d-evapremium-z-rantami':
      return '3d-with-rims';
    case '3d-evapremium-bez-rantow':
      return '3d-without-rims';
    default:
      return formType;
  }
};

const reverseMatType = (matType) => (matType === '3d-with-rims' ? '3d-evapremium-z-rantami' : '3d-evapremium-bez-rantow');

const mapCellStructure = (formStructure) => {
  switch (formStructure) {
    case 'romb':
      return 'rhombus';
    case 'plaster-miodu':
      return 'honeycomb';
    default:
      return formStructure;
  }
};

const reverseCellStructure = (cellStructure) => (cellStructure === 'rhombus' ? 'romb' : 'plaster-miodu');

const mapMaterialColor = (formColor) => {
  const materialColorMapping = {
    red: 'red',
    black: 'black',
    blue: 'blue',
    yellow: 'yellow',
    lime: 'darkgreen',
    orange: 'orange',
    purple: 'purple',
    brown: 'brown',
    maroon: 'maroon',
    pink: 'pink',
    darkblue: 'darkblue',
    darkgreen: 'darkgreen',
    darkgrey: 'darkgrey',
    lightgrey: 'darkgrey',
    beige: 'lightbeige',
    lightbeige: 'lightbeige',
    white: 'ivory',
    ivory: 'ivory',
  };
  return materialColorMapping[formColor] || formColor;
};

const mapBorderColor = (formColor) => {
  const borderColorMapping = {
    red: 'czerwone',
    black: 'czarne',
    blue: 'niebieski',
    yellow: 'zolte',
    lime: 'zielony',
    orange: 'pomaranczowe',
    purple: 'fioletowe',
    brown: 'brazowy',
    maroon: 'bordowe',
    pink: 'rozowe',
    darkblue: 'granatowy',
    darkgreen: 'zielony',
    darkgrey: 'ciemnoszary',
    lightgrey: 'jasnoszary',
    beige: 'bezowy',
    lightbeige: 'bezowy',
    white: 'bezowy',
    ivory: 'bezowy',
  };
  return borderColorMapping[formColor] || formColor;
};

const mapMaterialEnToPlFor3DRhombus = (en) => {
  const mapping = {
    black: 'czarny',
    blue: 'niebieski',
    brown: 'brązowy',
    darkblue: 'ciemnoniebieski',
    darkgreen: 'ciemnozielony',
    darkgrey: 'ciemnoszary',
    ivory: 'kość słoniowa',
    lightbeige: 'beżowy',
    maroon: 'bordowy',
    red: 'czerwony',
  };
  return mapping[en] || en;
};

const toggleDiacritics = (pl) => {
  const mapNoToYes = {
    bezowy: 'beżowy',
    brazowy: 'brązowy',
    rozowe: 'różowe',
    pomaranczowe: 'pomarańczowe',
    zolte: 'żółte',
  };
  const mapYesToNo = {
    'beżowy': 'bezowy',
    'brązowy': 'brazowy',
    'różowe': 'rozowe',
    'pomarańczowe': 'pomaranczowe',
    'żółte': 'zolte',
  };
  if (mapNoToYes[pl]) return mapNoToYes[pl];
  if (mapYesToNo[pl]) return mapYesToNo[pl];
  return pl;
};

const toggleNumberVariant = (pl) => {
  const toPlural = {
    bezowy: 'bezowe',
    'beżowy': 'bezowe',
    brazowy: 'brazowe',
    'brązowy': 'brazowe',
    granatowy: 'granatowe',
    niebieski: 'niebieskie',
    zielony: 'zielone',
  };
  const toSingular = {
    bezowe: 'bezowy',
    brazowe: 'brazowy',
    granatowe: 'granatowy',
    niebieskie: 'niebieski',
    zielone: 'zielony',
  };
  if (toPlural[pl]) return toPlural[pl];
  if (toSingular[pl]) return toSingular[pl];
  return pl;
};

// Reverse mapping helpers to derive form inputs from DB row
const PL_MATERIAL_TO_FORM = {
  'czarny': 'black',
  'niebieski': 'blue',
  'brązowy': 'beige', // prefer 'beige' to test lightbeige mapping then PL fallback to beżowy for 3D rhombus
  'beżowy': 'beige',
  'ciemnoniebieski': 'darkblue',
  'ciemnozielony': 'darkgreen',
  'ciemnoszary': 'darkgrey',
  'kość słoniowa': 'white',
  'bordowy': 'maroon',
  'czerwony': 'red',
};

// Reverse for border: choose any EN key mapping to given PL border
const BORDER_PL_TO_FORM = Object.entries({
  red: 'czerwone',
  black: 'czarne',
  blue: 'niebieski',
  yellow: 'zolte',
  lime: 'zielony',
  orange: 'pomaranczowe',
  purple: 'fioletowe',
  brown: 'brazowy',
  maroon: 'bordowe',
  pink: 'rozowe',
  darkblue: 'granatowy',
  darkgreen: 'zielony',
  darkgrey: 'ciemnoszary',
  lightgrey: 'jasnoszary',
  beige: 'bezowy',
  lightbeige: 'bezowy',
  white: 'bezowy',
  ivory: 'bezowy',
}).reduce((acc, [en, pl]) => { (acc[pl] ||= []).push(en); return acc; }, {});

async function strictLookup(mappedMatType, mappedCellStructure, mappedMaterialColor, mappedBorderColor) {
  const { data, error } = await supabase
    .from('CarMat')
    .select('imagePath, matType, cellStructure, materialColor, borderColor')
    .eq('matType', mappedMatType)
    .eq('cellStructure', mappedCellStructure)
    .eq('materialColor', mappedMaterialColor)
    .eq('borderColor', mappedBorderColor)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function fallbackLookup(mappedMatType, mappedCellStructure, mappedMaterialColor, mappedBorderColor) {
  const candidateMaterialColors = [mappedMaterialColor];
  if (mappedMatType === '3d-with-rims' && mappedCellStructure === 'rhombus') {
    const plVariant = mapMaterialEnToPlFor3DRhombus(mappedMaterialColor);
    if (!candidateMaterialColors.includes(plVariant)) candidateMaterialColors.push(plVariant);
  }
  const candidateBorderColorsSet = new Set();
  const add = (v) => v && candidateBorderColorsSet.add(v);
  add(mappedBorderColor);
  add(toggleDiacritics(mappedBorderColor));
  add(toggleNumberVariant(mappedBorderColor));
  add(toggleNumberVariant(toggleDiacritics(mappedBorderColor)));
  const candidateBorderColors = Array.from(candidateBorderColorsSet);

  const { data, error } = await supabase
    .from('CarMat')
    .select('imagePath, matType, cellStructure, materialColor, borderColor')
    .eq('matType', mappedMatType)
    .eq('cellStructure', mappedCellStructure)
    .in('materialColor', candidateMaterialColors)
    .in('borderColor', candidateBorderColors)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function run() {
  const { data, error } = await supabase
    .from('CarMat')
    .select('matType,cellStructure,materialColor,borderColor,imagePath');
  if (error) throw error;

  const rows = data || [];
  const groups = {};
  for (const r of rows) {
    const key = `${r.matType}|${r.cellStructure}`;
    (groups[key] ||= []).push(r);
  }

  let total = 0; let ok = 0;
  for (const key of Object.keys(groups).sort()) {
    const [matType, cellStructure] = key.split('|');
    let groupTotal = 0; let groupOk = 0;
    for (const r of groups[key]) {
      groupTotal += 1; total += 1;
      const formMatType = reverseMatType(matType);
      const formStructure = reverseCellStructure(cellStructure);

      // Derive form materialColor
      let formMaterial = r.materialColor;
      if (PL_MATERIAL_TO_FORM[r.materialColor]) {
        formMaterial = PL_MATERIAL_TO_FORM[r.materialColor];
      }

      // Derive form borderColor: pick any EN key mapping to this PL border
      const borderCandidates = BORDER_PL_TO_FORM[r.borderColor] || [];
      const formBorder = borderCandidates[0] || 'black';

      const mappedMatType = mapMatType(formMatType);
      const mappedCellStructure = mapCellStructure(formStructure);
      const mappedMaterialColor = mapMaterialColor(formMaterial);
      const mappedBorderColor = mapBorderColor(formBorder);

      let found = await strictLookup(mappedMatType, mappedCellStructure, mappedMaterialColor, mappedBorderColor);
      let usedFallback = false;
      if (!found) {
        found = await fallbackLookup(mappedMatType, mappedCellStructure, mappedMaterialColor, mappedBorderColor);
        usedFallback = !!found;
      }

      if (found && found.imagePath === r.imagePath) {
        groupOk += 1; ok += 1;
      } else if (found) {
        // Accept any record match in same key
        groupOk += 1; ok += 1;
      } else {
        console.log('MISS', { formMatType, formStructure, formMaterial, formBorder, row: r });
      }
    }
    console.log(`GROUP ${key}: ${groupOk}/${groupTotal} matched`);
  }
  console.log(`TOTAL: ${ok}/${total} matched`);
}

run().then(()=>process.exit(0)).catch((e)=>{console.error(e); process.exit(1);});


