// Dati strutturati (schema.org) per Google: scheda dell'attivita' con indirizzo,
// contatti e orari del Centro. Parte dagli stessi dati del footer (site.ts, orari.ts),
// cosi' non ci sono due versioni da tenere allineate.
import { site, social } from '../data/site';

export function schedaAttivita(origin: string, immagine: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SportsActivityLocation',
		'@id': `${origin}/#attivita`,
		name: site.name,
		legalName: site.legalName,
		url: `${origin}/`,
		image: immagine,
		logo: `${origin}/images/logo-body-energie-chiaro.png`,
		telephone: '+39 045 630 4337',
		email: site.email,
		vatID: `IT${site.vat}`,
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Via Adamello, 1',
			postalCode: '37069',
			addressLocality: 'Villafranca di Verona',
			addressRegion: 'VR',
			addressCountry: 'IT',
		},
		// Orari ordinari del Centro (quelli estivi cambiano e stanno nel footer).
		openingHoursSpecification: [
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '05:00', closes: '22:00' },
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '08:00', closes: '18:00' },
			{ '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '08:00', closes: '13:30' },
		],
		sameAs: social.map((s) => s.href),
	};
}
