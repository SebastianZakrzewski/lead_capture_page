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

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
	console.log('🔎 Pobieram listę wszystkich CarMat...');
	const list = await fetchJson('http://localhost:3001/api/carmat?limit=2000');
	const items = (list.data?.carMats || list.data || []);
	console.log(`📊 Do usunięcia: ${items.length}`);
	if (!items.length) {
		console.log('✅ Brak rekordów do usunięcia.');
		return;
	}

	let ok = 0, fail = 0;
	const batchSize = 25;
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		console.log(`\n📦 Partia ${Math.floor(i / batchSize) + 1} (${batch.length} rekordów)`);
		for (const it of batch) {
			try {
				const res = await fetch(`http://localhost:3001/api/carmat/${it.id}`, { method: 'DELETE' });
				if (res.ok) {
					ok++;
					console.log(`  ✓ ${it.id}`);
				} else {
					fail++;
					console.log(`  ✗ ${it.id} HTTP ${res.status}`);
				}
				await delay(15);
			} catch (e) {
				fail++;
				console.error(`  ❌ ${it.id}:`, e.message);
			}
		}
		await delay(150);
	}

	console.log(`\n🎉 Zakończono. Usunięto: ${ok}, błędy: ${fail}`);

	// Weryfikacja
	const after = await fetchJson('http://localhost:3001/api/carmat?limit=1');
	const left = (after.data?.carMats || after.data || []).length;
	console.log(`🔁 Pozostało rekordów (sample check): ${left}`);
}

run().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
