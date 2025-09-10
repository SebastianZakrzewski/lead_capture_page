/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

// Use env.example values (adjust if your real env differs)
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

async function lookup(options) {
  const mappedMatType = mapMatType(options.matType);
  const mappedCellStructure = mapCellStructure(options.cellStructure);
  const mappedMaterialColor = mapMaterialColor(options.materialColor);
  const mappedBorderColor = mapBorderColor(options.borderColor);

  // Primary strict
  let { data, error } = await supabase
    .from('CarMat')
    .select('imagePath, matType, cellStructure, materialColor, borderColor')
    .eq('matType', mappedMatType)
    .eq('cellStructure', mappedCellStructure)
    .eq('materialColor', mappedMaterialColor)
    .eq('borderColor', mappedBorderColor)
    .limit(1);

  if (error) throw error;
  if (Array.isArray(data) && data.length > 0) return { success: true, data: data[0], triedFallback: false };

  // Fallbacks
  const candidateMaterialColors = [mappedMaterialColor];
  if (mappedMatType === '3d-with-rims' && mappedCellStructure === 'rhombus') {
    const plVariant = mapMaterialEnToPlFor3DRhombus(mappedMaterialColor);
    if (!candidateMaterialColors.includes(plVariant)) candidateMaterialColors.push(plVariant);
  }

  const candidateBorderColorsSet = new Set();
  const addBorderVariant = (v) => { if (v) candidateBorderColorsSet.add(v); };
  addBorderVariant(mappedBorderColor);
  addBorderVariant(toggleDiacritics(mappedBorderColor));
  addBorderVariant(toggleNumberVariant(mappedBorderColor));
  addBorderVariant(toggleNumberVariant(toggleDiacritics(mappedBorderColor)));
  const candidateBorderColors = Array.from(candidateBorderColorsSet);

  const fb = await supabase
    .from('CarMat')
    .select('imagePath, matType, cellStructure, materialColor, borderColor')
    .eq('matType', mappedMatType)
    .eq('cellStructure', mappedCellStructure)
    .in('materialColor', candidateMaterialColors)
    .in('borderColor', candidateBorderColors)
    .limit(1);

  if (fb.error) throw fb.error;
  if (Array.isArray(fb.data) && fb.data.length > 0) return { success: true, data: fb.data[0], triedFallback: true };

  return { success: false, error: 'not_found', triedFallback: true };
}

async function run() {
  const tests = [
    // 3D z rantami, romby – typowe
    { matType: '3d-evapremium-z-rantami', cellStructure: 'romb', materialColor: 'blue', borderColor: 'granatowy' },
    { matType: '3d-evapremium-z-rantami', cellStructure: 'romb', materialColor: 'red', borderColor: 'czarne' },
    { matType: '3d-evapremium-z-rantami', cellStructure: 'romb', materialColor: 'darkblue', borderColor: 'niebieski' },
    // 3D z rantami, plaster miodu
    { matType: '3d-evapremium-z-rantami', cellStructure: 'plaster-miodu', materialColor: 'beige', borderColor: 'bezowy' },
    { matType: '3d-evapremium-z-rantami', cellStructure: 'plaster-miodu', materialColor: 'white', borderColor: 'czarne' },
    // Klasyczne, romby
    { matType: '3d-evapremium-bez-rantow', cellStructure: 'romb', materialColor: 'blue', borderColor: 'granatowy' },
    { matType: '3d-evapremium-bez-rantow', cellStructure: 'romb', materialColor: 'red', borderColor: 'czarne' },
    // Klasyczne, plaster miodu
    { matType: '3d-evapremium-bez-rantow', cellStructure: 'plaster-miodu', materialColor: 'darkblue', borderColor: 'niebieski' },
    { matType: '3d-evapremium-bez-rantow', cellStructure: 'plaster-miodu', materialColor: 'beige', borderColor: 'beżowy' },
    // Edge: lime/darkgreen, diacritics toggles
    { matType: '3d-evapremium-z-rantami', cellStructure: 'plaster-miodu', materialColor: 'lime', borderColor: 'zielony' },
    { matType: '3d-evapremium-z-rantami', cellStructure: 'romb', materialColor: 'blue', borderColor: 'bezowy' },
  ];

  let pass = 0;
  for (const t of tests) {
    try {
      const res = await lookup(t);
      if (res.success) {
        pass += 1;
        console.log('PASS', t, '=>', res.data.imagePath, res.triedFallback ? '(fallback)' : '(strict)');
      } else {
        console.log('FAIL', t, res.error);
      }
    } catch (e) {
      console.log('ERROR', t, e.message || e);
    }
  }

  console.log(`Summary: ${pass}/${tests.length} passed`);
}

run().then(()=>process.exit(0)).catch((e)=>{console.error(e); process.exit(1);});


