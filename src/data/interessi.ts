// Le "interest" corrispondono ai 4 form Typeform del sito originale (AbbonamentiBody,
// InfoBody, ProvaBody19) piu' le richieste generiche di informazioni per singolo corso.
export const interessi: Record<string, string> = {
	'prova-gratuita': 'Prova gratuita',
	abbonamento: 'Abbonamenti',
	informazioni: 'Informazioni generali',
	'sala-pesi': 'Sala Pesi',
	'corsi-fitness': 'Corsi Fitness',
	acqua: 'Acqua Fitness',
	'pilates-reformer': 'Pilates Reformer',
	'personal-training': 'Personal Training',
	'nuoto-bimbi': 'Nuoto Bimbi',
	'body-camp': 'Body Summer Camp',
	ciclismo: 'Squadra Ciclistica',
	termario: 'Termario',
};

export function etichettaInteresse(id: string | null | undefined): string {
	if (!id) return 'Informazioni generali';
	return interessi[id] ?? id;
}
