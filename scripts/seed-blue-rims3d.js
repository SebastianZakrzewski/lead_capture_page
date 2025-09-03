const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public/konfigurator/dywaniki/3d/romby/niebieskie');

// map file-token -> polish color
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
	// 5os-3d-diamonds-<material>-blue.webp
	const m = fileName.match(/^5os-3d-diamonds-([^-]+)-blue\.webp$/);
	if (!m) return null;
	const token = m[1];
	return FILE_TOKEN_TO_PL[token] || token;
}

function buildImagePath(fileName) {
	return `/konfigurator/dywaniki/3d/romby/niebieskie/${fileName}`;
}

async function postBatch(carMatDataBatch) {
	const res = await fetch('http://localhost:3001/api/carmat/bulk-insert', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ carMatData: carMatDataBatch }),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
	}
	return res.json();
}

async function run() {
	console.log('🔎 Skanuję katalog niebieskie (3D/romby)...');
	if (!fs.existsSync(PUBLIC_DIR)) {
		throw new Error(`Brak katalogu: ${PUBLIC_DIR}`);
	}
	const files = fs
		.readdirSync(PUBLIC_DIR)
		.filter((f) => f.toLowerCase().endsWith('.webp'))
		.sort();

	console.log(`📁 Plików znaleziono: ${files.length}`);

	const records = [];
	for (const file of files) {
		const materialColor = parseMaterialFromFilename(file);
		if (!materialColor) {
			console.warn(`⏭️ Pomijam (nie pasuje do wzorca): ${file}`);
			continue;
		}
		records.push({
			matType: '3d-with-rims',
			cellStructure: 'rhombus',
			materialColor,
			borderColor: 'niebieski',
			imagePath: buildImagePath(file),
		});
	}

	console.log(`🧾 Do wstawienia: ${records.length}`);
	let inserted = 0;
	let skipped = 0;
	let failed = 0;

	const batchSize = 10;
	for (let i = 0; i < records.length; i += batchSize) {
		const batch = records.slice(i, i + batchSize);
		try {
			const res = await postBatch(batch);
			const ins = res?.data?.inserted || res?.inserted || 0;
			const skip = res?.data?.skipped || res?.skipped || 0;
			inserted += ins;
			skipped += skip;
			console.log(`📦 Partia ${Math.floor(i / batchSize) + 1}: inserted=${ins}, skipped=${skip}`);
		} catch (e) {
			failed += batch.length;
			console.error(`❌ Partia nieudana:`, e.message);
		}
		await new Promise((r) => setTimeout(r, 150));
	}

	console.log('\n🎉 Gotowe');
	console.log(`✅ Wstawiono: ${inserted}`);
	console.log(`⏭️ Pominięto (duplikaty): ${skipped}`);
	console.log(`⚠️  Błędy: ${failed}`);
}

run().catch((e) => {
	console.error('❌ Fatal:', e);
	process.exit(1);
});
