// @ts-nocheck — script vanilla per il browser (accesso al DOM, niente tipi)
import { site } from '../data/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidEmail(v) {
	return EMAIL_RE.test(v.trim());
}

// Accetta i modi normali di scrivere un numero: 333 1234567, 333-1234567,
// 333.123.4567, (045) 123456, +39 333 1234567. Conta solo le cifre (7-15).
function isValidPhone(v) {
	const t = v.trim();
	const cifre = t.replace(/\D/g, '');
	return /^\+?[\d\s().\/-]+$/.test(t) && cifre.length >= 7 && cifre.length <= 15;
}

const MSG_RETE = `Non siamo riusciti a inviare la richiesta. Controlla la connessione e riprova, oppure chiamaci allo ${site.phone}.`;
const MSG_SERVER = `Non siamo riusciti a inviare la richiesta. Riprova tra poco oppure chiamaci allo ${site.phone}.`;
const MSG_TROPPE = 'Hai inviato troppe richieste ravvicinate: riprova tra qualche minuto.';
const MSG_DATI = 'Alcuni dati non risultano validi: controllali e riprova.';

export function initLeadForm(root, options) {
	const P = options.prefix;

	const el = (id) => root.querySelector(`#${P}-${id}`);
	const step = (name) => root.querySelector(`[data-step="${name}"]`);
	const form = root.querySelector('form[data-step="form"]');
	const erroreEl = root.querySelector('.lf__error');
	const interesseInput = root.querySelector('[data-lf-interesse]');
	const interesseLabel = root.querySelector('[data-lf-interesse-label]');
	const submitBtn = root.querySelector('[data-lf-submit]');
	const confermaEl = root.querySelector('[data-lf-conferma]');

	function mostraErrore(msg) {
		if (!erroreEl) return;
		erroreEl.textContent = msg;
		erroreEl.hidden = false;
	}

	function nascondiErrore() {
		if (!erroreEl) return;
		erroreEl.hidden = true;
	}

	function open(pagina, cta, interesse, interesseLabelTesto) {
		nascondiErrore();
		step('form').hidden = false;
		step('conferma').hidden = true;
		if (interesseInput) interesseInput.value = interesse || '';
		if (interesseLabel) interesseLabel.textContent = interesseLabelTesto ? `Richiesta: ${interesseLabelTesto}` : '';
		root.dataset.pagina = pagina || '';
		root.dataset.cta = cta || '';
	}

	async function submit() {
		const nome = el('nome')?.value.trim();
		const cognome = el('cognome')?.value.trim();
		const email = el('email')?.value.trim();
		const cellulare = el('cellulare')?.value.trim();
		const messaggio = el('messaggio')?.value.trim();
		const privacy = el('privacy')?.checked;
		const marketing = el('marketing')?.checked;
		// Campo trappola: nascosto alle persone, i bot lo compilano.
		const website = el('website')?.value || '';

		if (!nome || !cognome || !email || !cellulare) {
			mostraErrore('Compila tutti i campi obbligatori.');
			return;
		}
		if (!isValidEmail(email)) {
			mostraErrore('Inserisci un indirizzo email valido.');
			return;
		}
		if (!isValidPhone(cellulare)) {
			mostraErrore('Inserisci un numero di cellulare valido.');
			return;
		}
		if (!privacy) {
			mostraErrore('Devi accettare la privacy policy per continuare.');
			return;
		}
		nascondiErrore();

		const payload = {
			nome,
			cognome,
			email,
			cellulare,
			messaggio: messaggio || null,
			privacy,
			marketing,
			website,
			interesse: interesseInput?.value || null,
			pagina: root.dataset.pagina || (typeof location !== 'undefined' ? location.pathname : null),
			cta: root.dataset.cta || null,
		};

		if (submitBtn) submitBtn.disabled = true;

		// La conferma compare solo se il server dice che la richiesta e' stata
		// presa in carico: un errore di rete o del server lascia il form com'e'
		// (con i dati scritti) e spiega cosa fare.
		let risposta;
		try {
			risposta = await fetch('/api/lead', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		} catch {
			mostraErrore(MSG_RETE);
			if (submitBtn) submitBtn.disabled = false;
			return;
		}

		if (!risposta.ok) {
			if (risposta.status === 429) mostraErrore(MSG_TROPPE);
			else if (risposta.status >= 400 && risposta.status < 500) mostraErrore(MSG_DATI);
			else mostraErrore(MSG_SERVER);
			if (submitBtn) submitBtn.disabled = false;
			return;
		}

		if (submitBtn) submitBtn.disabled = false;
		step('form').hidden = true;
		step('conferma').hidden = false;
		// Chi usa un lettore di schermo sente la conferma; il focus non resta su un bottone sparito.
		confermaEl?.focus();
	}

	// Un vero <form>: Invio nei campi invia, come ci si aspetta.
	form?.addEventListener('submit', (e) => {
		e.preventDefault();
		submit();
	});

	function clear() {
		['nome', 'cognome', 'email', 'cellulare', 'messaggio', 'website'].forEach((id) => {
			const campo = el(id);
			if (campo) campo.value = '';
		});
		['privacy', 'marketing'].forEach((id) => {
			const campo = el(id);
			if (campo) campo.checked = false;
		});
		nascondiErrore();
		step('form').hidden = false;
		step('conferma').hidden = true;
		if (submitBtn) submitBtn.disabled = false;
	}

	return { open, clear };
}
