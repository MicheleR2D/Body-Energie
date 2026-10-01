// Dopo la build: i redirect del vecchio sito WordPress vanno anche con la barra finale.
// L'adapter Vercel li scrive come "^/contatti$": cosi' "/contatti/" (l'indirizzo che
// avevano le vecchie pagine, e quello indicizzato da Google) darebbe 404.
// Qui ogni redirect permanente diventa "^/contatti/?$".
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = '.vercel/output/config.json';
if (!existsSync(file)) {
	console.log('[redirect-con-slash] nessuna build Vercel (.vercel/output): niente da fare.');
	process.exit(0);
}

const config = JSON.parse(readFileSync(file, 'utf8'));
let n = 0;
for (const r of config.routes ?? []) {
	if (![301, 302, 307, 308].includes(r.status) || typeof r.src !== 'string') continue;
	if (!r.src.endsWith('$') || r.src.endsWith('/?$') || r.src === '^/$') continue;
	r.src = r.src.slice(0, -1) + '/?$';
	n++;
}
writeFileSync(file, JSON.stringify(config, null, '\t'));
console.log(`[redirect-con-slash] ${n} redirect ora accettano anche la barra finale.`);
