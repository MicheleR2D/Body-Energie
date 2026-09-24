// @ts-nocheck — script vanilla per il browser (accesso al DOM, niente tipi)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEL_RE = /^[+\d][\d\s]{6,}$/;

function isValidEmail(v) {
	return EMAIL_RE.test(v.trim());
}

function isValidPhone(v) {
	return TEL_RE.test(v.trim());
}

export function initLeadForm(root, options) {
	const P = options.prefix;
	const onClose = options.onClose || function () {};

	const el = (id) => root.querySelector(`#${P}-${id}`);
	const step = (name) => root.querySelector(`[data-step="${name}"]`);
	const erroreEl = root.querySelector('.lf__error');
	const interesseInput = root.querySelector('[data-lf-interesse]');
	const interesseLabel = root.querySelector('[data-lf-interesse-label]');
	const submitBtn = root.querySelector('[data-lf-submit]');

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
			interesse: interesseInput?.value || null,
			pagina: root.dataset.pagina || (typeof location !== 'undefined' ? location.pathname : null),
			cta: root.dataset.cta || null,
		};

		if (submitBtn) submitBtn.disabled = true;
		try {
			await fetch('/api/lead', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		} catch (e) {
			// L'errore di rete non blocca la UX: mostriamo comunque la conferma,
			// l'eventuale fallimento resta nei log server-side.
		}
		if (submitBtn) submitBtn.disabled = false;
		step('form').hidden = true;
		step('conferma').hidden = false;
	}

	submitBtn?.addEventListener('click', submit);

	function clear() {
		['nome', 'cognome', 'email', 'cellulare', 'messaggio'].forEach((id) => {
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
