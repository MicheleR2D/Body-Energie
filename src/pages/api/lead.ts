import { createClient } from '@supabase/supabase-js';
import { notificaLead } from '../../lib/notificaLead';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v: unknown): string | null {
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function json(data: unknown, status: number) {
	return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ request }: { request: Request }) {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_json' }, 400);
	}

	const nome = str(body.nome);
	const cognome = str(body.cognome);
	const email = str(body.email);
	const cellulare = str(body.cellulare);

	if (!nome || !cognome || !email || !cellulare) {
		return json({ ok: false, error: 'missing_fields' }, 400);
	}
	if (!EMAIL_RE.test(email)) {
		return json({ ok: false, error: 'invalid_email' }, 400);
	}
	if (body.privacy !== true) {
		return json({ ok: false, error: 'privacy_required' }, 400);
	}

	const datiLead = {
		nome,
		cognome,
		email,
		cellulare,
		messaggio: str(body.messaggio),
		interesse: str(body.interesse),
		pagina: str(body.pagina),
		cta: str(body.cta),
		privacy: true,
		marketing: body.marketing === true,
	};

	const supabaseUrl = import.meta.env.SUPABASE_URL;
	const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

	if (supabaseUrl && serviceRoleKey) {
		const supabase = createClient(supabaseUrl, serviceRoleKey);
		const { error } = await supabase.from('richieste').insert(datiLead);
		if (error) {
			console.error('Errore inserimento su Supabase:', error.message);
		}
	} else {
		console.log('Richiesta non salvata su Supabase: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY non configurate.');
	}

	await notificaLead(datiLead);

	return json({ ok: true }, 200);
}
