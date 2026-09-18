// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const isVercel = !!process.env.VERCEL;
const senzaSlashFinale = (v) => v.replace(/\/+$/, '');

const sitoProduzione = process.env.SITE_URL ? senzaSlashFinale(process.env.SITE_URL) : null;
const sitoVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const site = sitoProduzione ?? (isVercel && sitoVercel ? `https://${sitoVercel}` : 'https://www.bodyenergie.it');

if (!sitoProduzione) {
	console.warn('[body-energie] SITE_URL non impostata: build di prova su ' + site);
}

// 301 dal vecchio sito WordPress (bodyenergie.it), estratti dal plugin Redirection.
// Le voci segnate TODO puntavano a "/promo" o "referral", pagine non presenti nel backup:
// vanno riviste con il cliente prima del lancio definitivo.
const redirectWordpress = {
	'/contatti/': '/',
	'/personal-trainer-verona/': '/personal-training',
	'/classes-list/': '/',
	'/gallery/': '/',
	'/classes/': '/',
	'/news/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/about/': '/',
	'/home-backup/': '/',
	'/openpass7gg/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/aitrevolti-ristobar/': '/',
	'/estetica/': '/centro-estetico',
	'/compleanni-verona/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/corporate-wellness/': '/',
	'/orari-body-energie/': '/orari',
	'/allenamento-body-energie/': '/corsi-fitness',
	'/partners/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/iorestoacasa/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/acquista-servizi/': '/abbonamenti',
	'/carrello/': '/abbonamenti',
	'/checkout/': '/abbonamenti',
	'/acquista-servizi/small-group-personal-trainer/': '/abbonamenti',
	'/area-riservata/': '/',
	'/privacy-policy/': '/privacy-body-energie',
	'/home-backup-30-06-20/': '/',
	'/prova1/': '/',
	'/prova2/': '/',
	'/prevendita-re-opening-body-energie/': '/',
	'/nutri-energie-la-nutrizione-consapevole/': '/',
	'/acquista-servizi-new/': '/abbonamenti',
	'/condizioni-di-vendita/': '/wp-content/uploads/2025/12/Regolamento-Body-Energie.pdf',
	'/la-corsa-delle-renne-concorso-natale-2021/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/catalogo-premi-concorso-la-corsa-delle-renne/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/1-mese-in-regalo/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/1-mese-in-regalo-1/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/porte-aperte-bodyenergie-s/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/presentaci-un-tuo-amico/': '/', // TODO: destinazione originale "referral" non esiste nel backup
	'/presenta-un-amico/': '/', // TODO: destinazione originale "referral" non esiste nel backup
	'/body-lab-palestra-della-salute/': '/body-lab',
	'/porte-aperte-bodyenergie-f/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/privacy-policy-2/': '/privacy-body-energie',
	'/cookie-policy/': '/privacy-body-energie',
	'/orari-corsi-body-energie/': '/orari',
	'/regala-1-mese-ai-tuoi-amici/': '/', // TODO: destinazione originale "referral" non esiste nel backup
	'/porte-aperte-inseguiituoisogni/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/buon-compleanno/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/buon-compleanno-2/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/regala-1-settimana-di-fitness/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/fitness-piacere-puro/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/fitness-piacere-puro-2/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/estate-voglia-di-liberta/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/happy-valentines-day/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/condizioni-generali/': '/wp-content/uploads/2025/12/Regolamento-Body-Energie.pdf',
	'/open-day-13-gennaio-2025/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/newsletter-2/': '/',
	'/backup-home-aprile2025/': '/',
	'/test/': '/',
	'/open-pass/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/free-pass-body-energie/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/safeguarding-body-energie/': '/', // TODO: destinazione originale "/promo" non esiste nel backup
	'/test-form/': '/',
	'/planning/': '/wp-content/uploads/2026/04/ORARIO-CORSI-2016-sito.pdf',
	'/contributo-regione-veneto-body-energie/': '/contributo-regione-veneto/',
};

// https://astro.build/config
export default defineConfig({
	site,
	redirects: {
		...redirectWordpress,
	},
	integrations: [sitemap()],
	adapter: vercel(),
});
