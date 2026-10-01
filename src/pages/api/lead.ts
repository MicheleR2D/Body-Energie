import { createClient } from '@supabase/supabase-js';
import { notificaLead } from '../../lib/notificaLead';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Limiti di lunghezza: uguali a quelli del form, cosi' nessuno puo' mandare
// megabyte di testo che poi finiscono in database e in una email.
const MAX = { nome: 80, cognome: 80, email: 254, cellulare: 30, messaggio: 2000, corto: 200 };
const MAX_BODY_BYTES = 10_000;

// Limite di invii per indirizzo IP: 5 ogni 10 minuti. E' in memoria, quindi vale
// per singola istanza serverless (non e' un blocco assoluto, ma ferma i cicli
// di invii ravvicinati). Per difese piu' forti servirebbe uno store condiviso.
const FINESTRA_MS = 10 * 60 * 1000;
const MAX_INVII = 5;
const tentativi = new Map<string, number[]>();

function superaLimite(ip: string): boolean {
	const ora = Date.now();
	const recenti = (tentativi.get(ip) ?? []).filter((t) => ora - t < FINESTRA_MS);
	recenti.push(ora);
	tentativi.set(ip, recenti);
	if (tentativi.size > 5000) {
		for (const [chiave, tempi] of tentativi) {
			if (tempi.every((t) => ora - t >= FINESTRA_MS)) tentativi.delete(chiave);
		}
	}
	return recenti.length > MAX_INVII;
}

function str(v: unknown, max: number): string | null {
	if (typeof v !== 'string') return null;
	const t = v.trim();
	return t ? t.slice(0, max) : null;
}

// Stessa regola del form: modi normali di scrivere un numero, 7-15 cifre.
function telefonoValido(v: string): boolean {
	const cifre = v.replace(/\D/g, '');
	return /^\+?[\d\s().\/-]+$/.test(v) && cifre.length >= 7 && cifre.length <= 15;
}

function json(data: unknown, status: number) {
	return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function indirizzoIp(context: { request: Request; clientAddress?: string }): string {
	try {
		if (context.clientAddress) return context.clientAddress;
	} catch {
		// non disponibile con questo adapter/ambiente
	}
	return context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sconosciuto';
}

export async function POST(context: { request: Request; clientAddress?: string }) {
	const { request } = context;

	// Stesso sito: il browser manda Origin sulle POST; se c'e' e non coincide, e' un altro sito.
	const origin = request.headers.get('origin');
	if (origin) {
		try {
			if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'forbidden' }, 403);
		} catch {
			return json({ ok: false, error: 'forbidden' }, 403);
		}
	}

	let body: Record<string, unknown>;
	try {
		const testo = await request.text();
		if (testo.length > MAX_BODY_BYTES) return json({ ok: false, error: 'too_large' }, 413);
		body = JSON.parse(testo);
	} catch {
		return json({ ok: false, error: 'invalid_json' }, 400);
	}

	// Campo trappola: le persone non lo vedono, i bot lo compilano. Si finge
	// di aver ricevuto la richiesta ma non si salva ne' si manda nulla.
	if (typeof body.website === 'string' && body.website.trim() !== '') {
		console.log('[lead] scartato: campo trappola compilato.');
		return json({ ok: true }, 200);
	}

	const nome = str(body.nome, MAX.nome);
	const cognome = str(body.cognome, MAX.cognome);
	const email = str(body.email, MAX.email);
	const cellulare = str(body.cellulare, MAX.cellulare);

	if (!nome || !cognome || !email || !cellulare) {
		return json({ ok: false, error: 'missing_fields' }, 400);
	}
	if (!EMAIL_RE.test(email)) {
		return json({ ok: false, error: 'invalid_email' }, 400);
	}
	if (!telefonoValido(cellulare)) {
		return json({ ok: false, error: 'invalid_phone' }, 400);
	}
	if (body.privacy !== true) {
		return json({ ok: false, error: 'privacy_required' }, 400);
	}

	if (superaLimite(indirizzoIp(context))) {
		return json({ ok: false, error: 'rate_limited' }, 429);
	}

	const datiLead = {
		nome,
		cognome,
		email,
		cellulare,
		messaggio: str(body.messaggio, MAX.messaggio),
		interesse: str(body.interesse, MAX.corto),
		pagina: str(body.pagina, MAX.corto),
		cta: str(body.cta, MAX.corto),
		privacy: true,
		marketing: body.marketing === true,
	};

	const supabaseUrl = import.meta.env.SUPABASE_URL;
	const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

	let salvato: 'saved' | 'not_configured' | 'failed' = 'not_configured';
	if (supabaseUrl && serviceRoleKey) {
		try {
			const supabase = createClient(supabaseUrl, serviceRoleKey);
			const { error } = await supabase.from('richieste').insert(datiLead);
			if (error) {
				console.error('Errore inserimento su Supabase:', error.message);
				salvato = 'failed';
			} else {
				salvato = 'saved';
			}
		} catch (e) {
			console.error('Supabase non raggiungibile:', e);
			salvato = 'failed';
		}
	} else {
		console.log('Richiesta non salvata su Supabase: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY non configurate.');
	}

	const notifica = await notificaLead(datiLead);

	// La persona vede "Grazie" solo se la richiesta e' al sicuro in almeno un
	// posto (database o email allo staff). Altrimenti deve saperlo e riprovare.
	if (salvato === 'saved' || notifica === 'sent') {
		return json({ ok: true }, 200);
	}

	// In sviluppo, senza servizi configurati, non c'e' dove salvare: si accetta
	// lo stesso per poter provare il form. In produzione no.
	if (import.meta.env.DEV && salvato === 'not_configured' && notifica === 'not_configured') {
		console.log('[lead] ricevuto in sviluppo (nessun servizio configurato): non salvato ne\' inviato.');
		return json({ ok: true }, 200);
	}

	console.error('[lead] NON preso in carico:', { salvato, notifica });
	return json({ ok: false, error: 'unavailable' }, 503);
}
