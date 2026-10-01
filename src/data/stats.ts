// Numeri del centro (dal sito originale): li usano la sezione contatori della
// home e la prova sociale accanto alla CTA finale, cosi' non si scrivono due volte.
export interface Stat {
	target: number;
	suffisso: string;
	titolo: string;
	sotto: string;
	/** Etichetta corta per gli spazi stretti (es. accanto alla CTA). */
	breve: string;
}

export const stats: Stat[] = [
	{ target: 5500, suffisso: '', titolo: 'Metri quadri', sotto: 'dedicati al benessere', breve: 'mq di centro' },
	{ target: 150, suffisso: '+', titolo: 'Corsi a settimana', sotto: 'tra corsi, acqua e sala pesi', breve: 'corsi a settimana' },
	{ target: 40, suffisso: '+', titolo: 'Trainers qualificati', sotto: 'sempre al tuo fianco', breve: 'trainer qualificati' },
	{ target: 2000, suffisso: '+', titolo: 'Iscritti', sotto: 'che si allenano con noi', breve: 'iscritti' },
];

// Il sito originale mostra i numeri con la virgola (5,500) invece del punto
// italiano: replichiamo lo stesso formato, non e' un refuso nostro.
export const formattaNumero = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
