/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mapMaterial = (c) => ({
  red:'red', black:'black', blue:'blue', yellow:'yellow', lime:'darkgreen', orange:'orange', purple:'purple', brown:'brown', maroon:'maroon', pink:'pink', darkblue:'darkblue', darkgreen:'darkgreen', darkgrey:'darkgrey', lightgrey:'darkgrey', beige:'lightbeige', lightbeige:'lightbeige', white:'ivory', ivory:'ivory'
})[c] || c;

const mapBorder = (c) => ({
  red:'czerwone', black:'czarne', blue:'niebieski', yellow:'zolte', lime:'zielony', orange:'pomaranczowe', purple:'fioletowe', brown:'brazowy', maroon:'bordowe', pink:'rozowe', darkblue:'granatowy', darkgreen:'zielony', darkgrey:'ciemnoszary', lightgrey:'jasnoszary', beige:'bezowy', lightbeige:'bezowy', white:'bezowy', ivory:'bezowy'
})[c] || c;

const en2pl3dRh = (en) => ({
  black:'czarny', blue:'niebieski', brown:'brązowy', darkblue:'ciemnoniebieski', darkgreen:'ciemnozielony', darkgrey:'ciemnoszary', ivory:'kość słoniowa', lightbeige:'beżowy', maroon:'bordowy', red:'czerwony'
})[en] || en;

const toggDia = (pl) => ({
  bezowy:'beżowy', brazowy:'brązowy', rozowe:'różowe', pomaranczowe:'pomarańczowe', zolte:'żółte',
  'beżowy':'bezowy', 'brązowy':'brazowy', 'różowe':'rozowe', 'pomarańczowe':'pomaranczowe', 'żółte':'zolte'
})[pl] || pl;

const toggNum = (pl) => ({
  bezowy:'bezowe', 'beżowy':'bezowe', brazowy:'brazowe', 'brązowy':'brazowe', granatowy:'granatowe', niebieski:'niebieskie', zielony:'zielone',
  bezowe:'bezowy', brazowe:'brazowy', granatowe:'granatowy', niebieskie:'niebieski', zielone:'zielony'
})[pl] || pl;

async function strict(mt, cs, mc, bc) {
  const { data, error } = await supabase
    .from('CarMat')
    .select('id')
    .eq('matType', mt)
    .eq('cellStructure', cs)
    .eq('materialColor', mc)
    .eq('borderColor', bc)
    .limit(1);
  if (error) throw error; return Array.isArray(data) && data.length > 0;
}

async function fb(mt, cs, mc, bc) {
  const mats = [mc];
  if (mt === '3d-with-rims' && cs === 'rhombus') {
    const pl = en2pl3dRh(mc); if (!mats.includes(pl)) mats.push(pl);
  }
  const borders = Array.from(new Set([bc, toggDia(bc), toggNum(bc), toggNum(toggDia(bc))]));
  const { data, error } = await supabase
    .from('CarMat')
    .select('id')
    .eq('matType', mt)
    .eq('cellStructure', cs)
    .in('materialColor', mats)
    .in('borderColor', borders)
    .limit(1);
  if (error) throw error; return Array.isArray(data) && data.length > 0;
}

async function run() {
  const groups = [
    ['3d-with-rims', 'rhombus'],
    ['3d-with-rims', 'honeycomb'],
    ['3d-without-rims', 'rhombus'],
    ['3d-without-rims', 'honeycomb'],
  ];
  const bordersForm = ['blue', 'darkblue'];
  const failures = [];
  for (const [mt, cs] of groups) {
    const { data, error } = await supabase.from('CarMat').select('materialColor').eq('matType', mt).eq('cellStructure', cs);
    if (error) { console.error(error); process.exit(1); }
    const mats = Array.from(new Set((data || []).map(r => r.materialColor)));
    const pl2form = { 'czarny': 'black', 'niebieski': 'blue', 'brązowy': 'beige', 'beżowy': 'beige', 'ciemnoniebieski': 'darkblue', 'ciemnozielony': 'darkgreen', 'ciemnoszary': 'darkgrey', 'kość słoniowa': 'white', 'bordowy': 'maroon', 'czerwony': 'red' };
    const formMats = Array.from(new Set(mats.map(x => pl2form[x] || x)));
    for (const mForm of formMats) {
      const mc = mapMaterial(mForm);
      for (const bForm of bordersForm) {
        const bc = mapBorder(bForm);
        let ok = await strict(mt, cs, mc, bc);
        if (!ok) ok = await fb(mt, cs, mc, bc);
        if (!ok) failures.push({ mt, cs, mForm, bForm });
      }
    }
  }
  console.log('FAILURES', failures.length);
  if (failures.length) console.log(failures);
}

run().then(()=>process.exit(0)).catch((e)=>{console.error(e); process.exit(1);});


