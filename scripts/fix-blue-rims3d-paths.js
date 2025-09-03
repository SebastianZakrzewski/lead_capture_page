const { exec } = require('child_process');

const POLISH_TO_KEY = {
	'beżowy': 'beige',
	'czarny': 'black',
	'niebieski': 'blue',
	'brązowy': 'brown',
	'ciemnoniebieski': 'darkblue',
	'ciemnozielony': 'darkgreen',
	'ciemnoszary': 'darkgrey',
	'kość słoniowa': 'ivory',
	'jasnobeżowy': 'lightbeige',
	'limonkowy': 'lime',
	'bordowy': 'maroon',
	'pomarańczowy': 'orange',
	'różowy': 'pink',
	'fioletowy': 'purple',
	'czerwony': 'red',
	'biały': 'white',
	'żółty': 'yellow',
};

function expectedPath(materialColorPl, borderColorPl) {
	const materialKey = POLISH_TO_KEY[materialColorPl] || (materialColorPl || '').toLowerCase();
	const borderKey = POLISH_TO_KEY[borderColorPl] || (borderColorPl || '').toLowerCase();
	// for 3d-with-rims rhombus, folder must be 'niebieskie' and border suffix must be 'blue'
	return `/konfigurator/dywaniki/3d/romby/niebieskie/5os-3d-diamonds-${materialKey}-blue.webp`;
}

function psInvoke(url, method = 'GET', bodyObj) {
	return new Promise((resolve) => {
		const bodyPart = bodyObj ? `; $body = '${JSON.stringify(bodyObj).replace(/'/g, "''")}';` : '';
		const sendPart = bodyObj ? ` -Headers @{'Content-Type'='application/json'} -Body $body` : '';
		const cmd = `powershell -Command "& { try { ${bodyPart} $resp = Invoke-WebRequest -Uri '${url}' -Method ${method}${sendPart}; $resp.Content } catch { Write-Output 'ERROR: ' + $_.Exception.Message } }"`;
		exec(cmd, (error, stdout, stderr) => {
			if (stderr) return resolve({ error: stderr });
			if (stdout.startsWith('ERROR:')) return resolve({ error: stdout });
			const match = stdout.match(/({[\s\S]*})/);
			if (!match) return resolve({ raw: stdout });
			try { resolve(JSON.parse(match[1])); } catch { resolve({ raw: stdout }); }
		});
	});
}

async function run() {
	console.log('🔎 Pobieram rekordy 3D-with-rims rhombus z obszyciem niebieskim...');
	const res = await psInvoke('http://localhost:3001/api/carmat?matType=3d-with-rims&cellStructure=rhombus&borderColor=niebieski&limit=500');
	if (res.error) {
		console.error('❌ Błąd pobierania:', res.error);
		return;
	}
	const records = res.data?.carMats || res.data || [];
	console.log(`📊 Znaleziono ${records.length} rekordów.`);
	let fixed = 0, skipped = 0;
	for (const rec of records) {
		const expected = expectedPath(rec.materialColor, rec.borderColor);
		const needsFix = !rec.imagePath || rec.imagePath.includes('/klasyczne/') || rec.imagePath.includes('granatowe') || rec.imagePath.includes('-darkblue') || rec.imagePath !== expected;
		if (!needsFix) { skipped++; continue; }
		console.log(`🛠️ ${rec.id}:\n  old: ${rec.imagePath}\n  new: ${expected}`);
		const upd = await psInvoke(`http://localhost:3001/api/carmat/${rec.id}`, 'PUT', { imagePath: expected, borderColor: 'niebieski' });
		if (upd.error) {
			console.error('  ❌ Błąd update:', upd.error);
		} else {
			fixed++;
			console.log('  ✅ Zaktualizowano');
		}
		// krótkie oddechy
		await new Promise(r => setTimeout(r, 80));
	}
	console.log(`\n🎉 Gotowe. Poprawiono: ${fixed}, pominięto: ${skipped}.`);
}

if (require.main === module) {
	run();
}
