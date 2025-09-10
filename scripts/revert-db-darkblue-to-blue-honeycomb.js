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
    .eq('cellStructure', 'honeycomb')
    .eq('borderColor', 'niebieski');
  if (error) throw error;

  const rows = data || [];
  const updates = [];
  for (const r of rows) {
    if (typeof r.imagePath === 'string' && r.imagePath.endsWith('-darkblue.webp')) {
      const newPath = r.imagePath.replace(/-darkblue\.webp$/, '-blue.webp');
      updates.push({
        id: r.id,
        matType: r.matType,
        cellStructure: r.cellStructure,
        materialColor: r.materialColor,
        borderColor: r.borderColor,
        imagePath: newPath,
        createdAt: r.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  console.log('Rows to update:', updates.length);
  if (updates.length === 0) return;

  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const { error: upErr } = await supabase
      .from('CarMat')
      .upsert(chunk, { onConflict: 'id' });
    if (upErr) throw upErr;
    console.log(`Updated ${i + chunk.length}/${updates.length}`);
  }
}

run().then(()=>{ console.log('Done'); process.exit(0); }).catch((e)=>{ console.error(e); process.exit(1); });


