/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('CarMat')
    .select('id, imagePath, matType, cellStructure, materialColor, borderColor, createdAt')
    .eq('matType', '3d-with-rims')
    .eq('cellStructure', 'rhombus');
  if (error) throw error;

  const rows = (data || []).filter(r => typeof r.imagePath === 'string' && r.imagePath.includes('/konfigurator/dywaniki/3d/romby/niebieski/'));
  console.log('Candidates:', rows.length);

  if (rows.length === 0) {
    console.log('Nothing to update');
    return;
  }

  const updates = rows.map(r => ({
    id: r.id,
    matType: r.matType,
    cellStructure: r.cellStructure,
    materialColor: r.materialColor,
    borderColor: r.borderColor,
    imagePath: r.imagePath.replace('/konfigurator/dywaniki/3d/romby/niebieski/', '/konfigurator/dywaniki/3d/romby/niebieskie/'),
    createdAt: r.createdAt,
    updatedAt: new Date().toISOString(),
  }));

  const chunkSize = 100;
  let done = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const { error: upErr } = await supabase.from('CarMat').upsert(chunk, { onConflict: 'id' });
    if (upErr) throw upErr;
    done += chunk.length;
    console.log('Updated', done, '/', updates.length);
  }
}

run().then(()=>{ console.log('Done'); process.exit(0); }).catch((e)=>{ console.error(e); process.exit(1); });


