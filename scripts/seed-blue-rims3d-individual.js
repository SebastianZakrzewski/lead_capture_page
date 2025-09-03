const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public/konfigurator/dywaniki/3d/romby/niebieskie');

const FILE_TOKEN_TO_PL = {
	beige: 'beżowy',
	black: 'czarny',
	blue: 'niebieski',
	brown: 'brązowy',
	darkblue: 'ciemnoniebieski',
	darkgreen: 'ciemnozielony',
	darkgrey: 'ciemnoszary',
	ivory: 'kość słoniowa',
	lightbeige: 'jasnobeżowy',
	lime: 'limonkowy',
	maroon: 'bordowy',
	orange: 'pomarańczowy',
	pink: 'różowy',
	purple: 'fioletowy',
	red: 'czerwony',
	white: 'biały',
	yellow: 'żółty',
};

function parseMaterialFromFilename(fileName) {
	const m = fileName.match(/^5os-3d-diamonds-([^-]+)-blue\.webp$/);
	if (!m) return null;
	const token = m[1];
	return FILE_TOKEN_TO_PL[token] || token;
}

function buildImagePath(fileName) {
	return `/konfigurator/dywaniki/3d/romby/niebieskie/${fileName}`;
}

async function run() {
	console.log('🔎 Skanuję katalog niebieskie (3D/romby)...');
	const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.toLowerCase().endsWith('.webp')).sort();
	console.log(`📁 Plików: ${files.length}`);

	let inserted = 0, skipped = 0, failed = 0;

	for (const file of files) {
		const materialColor = parseMaterialFromFilename(file);
		if (!materialColor) { console.log(`⏭️ Pomijam (wzorzec): ${file}`); continue; }
		const payload = {
			matType: '3d-with-rims',
			cellStructure: 'rhombus',
			materialColor,
			borderColor: 'niebieski',
			imagePath: buildImagePath(file),
		};
		try {
			const res = await fetch('http://localhost:3001/api/carmat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const text = await res.text();
			if (res.status === 201 || res.status === 200) {
				inserted++;
				console.log(`✅ OK: ${file}`);
			} else if (res.status === 409 || text.includes('istnieją')) {
				skipped++;
				console.log(`⏭️ Duplikat: ${file}`);
			} else {
				failed++;
				console.log(`❌ FAIL ${file} [${res.status}] ${text}`);
			}
			await new Promise(r => setTimeout(r, 50));
		} catch (e) {
			failed++;
			console.log(`❌ ERROR ${file}: ${e.message}`);
		}
	}

	console.log('\n🎉 Zakończono');
	console.log(`✅ Wstawiono: ${inserted}`);
	console.log(`⏭️ Duplikaty: ${skipped}`);
	console.log(`⚠️  Błędy: ${failed}`);
}

run().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
