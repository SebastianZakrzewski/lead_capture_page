/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Form option sets (from src/types/lead.ts)
const FORM_MATERIALS = ['red','black','blue','yellow','lime','orange','purple','brown','maroon','pink','darkblue','darkgreen','darkgrey','beige','lightbeige','white','ivory'];
const FORM_BORDERS = ['red','black','blue','yellow','lime','orange','purple','brown','maroon','pink','darkblue','darkgreen','darkgrey','lightgrey','beige','lightbeige','white','ivory'];

const mapMatType = (formType) => {
  switch (formType) {
    case '3d-evapremium-z-rantami': return '3d-with-rims';
    case '3d-evapremium-bez-rantow': return '3d-without-rims';
    default: return formType;
  }
};
const mapCellStructure = (formStructure) => {
  switch (formStructure) {
    case 'romb': return 'rhombus';
    case 'plaster-miodu': return 'honeycomb';
    default: return formStructure;
  }
};
const mapMaterialColor = (c) => ({
  red:'red', black:'black', blue:'blue', yellow:'yellow', lime:'darkgreen', orange:'orange', purple:'purple', brown:'brown', maroon:'maroon', pink:'pink', darkblue:'darkblue', darkgreen:'darkgreen', darkgrey:'darkgrey', lightgrey:'darkgrey', beige:'lightbeige', lightbeige:'lightbeige', white:'ivory', ivory:'ivory'
})[c] || c;
const mapBorderColor = (c) => ({
  red:'czerwone', black:'czarne', blue:'niebieski', yellow:'zolte', lime:'zielony', orange:'pomaranczowe', purple:'fioletowe', brown:'brazowy', maroon:'bordowe', pink:'rozowe', darkblue:'granatowy', darkgreen:'zielony', darkgrey:'ciemnoszary', lightgrey:'jasnoszary', beige:'bezowy', lightbeige:'bezowy', white:'bezowy', ivory:'bezowy'
})[c] || c;
const mapMaterialEnToPlFor3DRhombus = (en) => ({
  black:'czarny', blue:'niebieski', brown:'brązowy', darkblue:'ciemnoniebieski', darkgreen:'ciemnozielony', darkgrey:'ciemnoszary', ivory:'kość słoniowa', lightbeige:'beżowy', maroon:'bordowy', red:'czerwony'
})[en] || en;
const toggleDiacritics = (pl) => ({ bezowy:'beżowy', brazowy:'brązowy', rozowe:'różowe', pomaranczowe:'pomarańczowe', zolte:'żółte', 'beżowy':'bezowy', 'brązowy':'brazowy', 'różowe':'rozowe', 'pomarańczowe':'pomaranczowe', 'żółte':'zolte' })[pl] || pl;
const toggleNumberVariant = (pl) => ({ bezowy:'bezowe', 'beżowy':'bezowe', brazowy:'brazowe', 'brązowy':'brazowe', granatowy:'granatowe', niebieski:'niebieskie', zielony:'zielone', bezowe:'bezowy', brazowe:'brazowy', granatowe:'granatowy', niebieskie:'niebieski', zielone:'zielony' })[pl] || pl;

async function strictLookup(mt, cs, mc, bc){
  const { data, error } = await supabase.from('CarMat').select('imagePath').eq('matType', mt).eq('cellStructure', cs).eq('materialColor', mc).eq('borderColor', bc).limit(1);
  if(error) throw error; return Array.isArray(data)&&data.length>0; }

async function fallbackLookup(mt, cs, mc, bc){
  const mats = [mc];
  if(mt==='3d-with-rims' && cs==='rhombus'){ const pl = mapMaterialEnToPlFor3DRhombus(mc); if(!mats.includes(pl)) mats.push(pl); }
  const bset = new Set([bc, toggleDiacritics(bc), toggleNumberVariant(bc), toggleNumberVariant(toggleDiacritics(bc))]);
  const borders = Array.from(bset);
  const { data, error } = await supabase.from('CarMat').select('imagePath').eq('matType', mt).eq('cellStructure', cs).in('materialColor', mats).in('borderColor', borders).limit(1);
  if(error) throw error; return Array.isArray(data)&&data.length>0; }

async function run(){
  const matTypes = ['3d-evapremium-z-rantami','3d-evapremium-bez-rantow'];
  const structures = ['romb','plaster-miodu'];
  const failures = [];
  let total=0, ok=0;
  for(const mtForm of matTypes){
    for(const csForm of structures){
      const mt = mapMatType(mtForm); const cs = mapCellStructure(csForm);
      // derive available materials from DB distincts for this group, mapped back to form tokens
      const { data: rows, error } = await supabase.from('CarMat').select('materialColor').eq('matType', mt).eq('cellStructure', cs);
      if(error){ console.error('DB error', error); return; }
      const distinct = Array.from(new Set((rows||[]).map(r=>r.materialColor)));
      const plToForm = { 'czarny':'black','niebieski':'blue','brązowy':'beige','beżowy':'beige','ciemnoniebieski':'darkblue','ciemnozielony':'darkgreen','ciemnoszary':'darkgrey','kość słoniowa':'white','bordowy':'maroon','czerwony':'red' };
      const matFormSet = new Set();
      for(const v of distinct){ if(FORM_MATERIALS.includes(v)) matFormSet.add(v); else if(plToForm[v]) matFormSet.add(plToForm[v]); }
      const matFormList = Array.from(matFormSet);
      for(const mForm of matFormList){
        for(const bForm of FORM_BORDERS){
          total+=1;
          const mappedM = mapMaterialColor(mForm);
          const mappedB = mapBorderColor(bForm);
          let okStrict = await strictLookup(mt, cs, mappedM, mappedB);
          if(!okStrict){ const okFb = await fallbackLookup(mt, cs, mappedM, mappedB); if(okFb){ ok+=1; } else { failures.push({ mtForm, csForm, mForm, bForm }); } }
          else ok+=1;
        }
      }
    }
  }
  console.log('TOTAL combos tested:', total, 'OK:', ok, 'FAIL:', failures.length);
  if(failures.length){
    console.log('Failures (first 100):');
    console.log(failures.slice(0,100));
  }
}

run().then(()=>process.exit(0)).catch((e)=>{console.error(e); process.exit(1);});


