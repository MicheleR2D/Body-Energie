import { etichettaInteresse } from '../data/interessi';

export interface DatiLead {
	nome: string;
	cognome: string;
	email: string;
	cellulare: string;
	messaggio: string | null;
	interesse: string | null;
	pagina: string | null;
	cta: string | null;
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function corpoTesto(d: DatiLead): string {
	return [
		`Nome: ${d.nome} ${d.cognome}`,
		`Email: ${d.email}`,
		`Cellulare: ${d.cellulare}`,
		`Interesse: ${etichettaInteresse(d.interesse)}`,
		d.pagina ? `Pagina: ${d.pagina}` : null,
		d.cta ? `CTA: ${d.cta}` : null,
		d.messaggio ? `Messaggio: ${d.messaggio}` : null,
	]
		.filter(Boolean)
		.join('\n');
}

// Stesso pattern degli altri siti del gruppo (Sito-Ronchiverdi/notificaLead.ts):
// fetch raw verso l'API di SendGrid, nessun SDK. Non lancia mai: un fallimento
// nell'invio email non deve mai far fallire la risposta dell'API route.
export async function notificaLead(d: DatiLead): Promise<void> {
	const apiKey = import.meta.env.SENDGRID_API_KEY;
	const a = import.meta.env.EMAIL_NOTIFICHE_A;
	const da = import.meta.env.SENDGRID_FROM_EMAIL;
	const nomeMittente = import.meta.env.SENDGRID_FROM_NAME ?? 'Body Energie';

	if (!apiKey || !a || !da) {
		console.log('Notifica email non inviata: variabili SendGrid non configurate su Vercel.');
		return;
	}

	try {
		const risposta = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				personalizations: [{ to: [{ email: a }] }],
				from: { email: da, name: nomeMittente },
				reply_to: { email: d.email },
				subject: `Nuova richiesta — ${etichettaInteresse(d.interesse)} — ${d.nome} ${d.cognome}`,
				content: [
					{ type: 'text/plain', value: corpoTesto(d) },
					{ type: 'text/html', value: `<pre style="font-family:inherit">${esc(corpoTesto(d))}</pre>` },
				],
			}),
		});
		if (!risposta.ok) {
			console.error('SendGrid ha rifiutato la richiesta:', risposta.status, await risposta.text());
		}
	} catch (e) {
		console.error('Notifica email non inviata:', e);
	}
}
