async function fetchJson(url, options = {}) {
	const res = await fetch(url, {
		headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
		...options,
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
	}
	return res.json();
}

async function run() {
	console.log('🔎 Szukam rekordów z imagePath zawierającym "darkblue"...');
	const list = await fetchJson('http://localhost:3001/api/carmat?limit=1000');
	const items = (list.data?.carMats || list.data || []).filter(
		(x) => typeof x.imagePath === 'string' && x.imagePath.includes('darkblue')
	);
	console.log(`📊 Znaleziono ${items.length} rekordów do aktualizacji.`);

	let updated = 0;
	let failed = 0;
	for (const it of items) {
		const nextPath = it.imagePath.replace(/darkblue/g, 'blue');
		if (nextPath === it.imagePath) continue;
		try {
			const res = await fetch(`http://localhost:3001/api/carmat/${it.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ imagePath: nextPath }),
			});
			if (!res.ok) {
				failed++;
				console.error(`❌ ${it.id} HTTP ${res.status}`);
				continue;
			}
			updated++;
			console.log(`✅ ${it.id} → ${nextPath}`);
			await new Promise((r) => setTimeout(r, 50));
		} catch (e) {
			failed++;
			console.error(`❌ ${it.id} błąd:`, e.message);
		}
	}

	console.log('\n🎉 Zakończono');
	console.log(`📈 Zaktualizowano: ${updated}`);
	console.log(`⚠️  Błędy: ${failed}`);
}

run().catch((e) => {
	console.error('❌ Fatal:', e);
	process.exit(1);
});
