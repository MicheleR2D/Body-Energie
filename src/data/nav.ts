// Struttura del mega-menu ricostruita dal template header di Elementor (post ID 438)
// del sito WordPress originale: non esisteva un menu WP classico, la navigazione
// era tutta dentro il Theme Builder.
export interface VoceMenu {
	label: string;
	href: string;
}

export interface ColonnaMenu {
	titolo: string;
	voci: VoceMenu[];
}

export const megaMenu: ColonnaMenu[] = [
	{
		titolo: 'Attività Adulti',
		voci: [
			{ label: 'Sala Pesi', href: '/sala-pesi' },
			{ label: 'Corsi Fitness', href: '/corsi-fitness' },
			{ label: 'Acqua Fitness', href: '/acqua' },
			{ label: 'Pilates Reformer', href: '/pilates-reformer' },
			{ label: 'Personal Training', href: '/personal-training' },
			{ label: 'Termario', href: '/termario' },
		],
	},
	{
		titolo: 'Attività Bambini',
		voci: [
			{ label: 'Nuoto Bimbi', href: '/nuoto-bimbi' },
			{ label: 'Body Summer Camp', href: '/body-camp' },
			{ label: 'Squadra Ciclistica', href: '/ciclismo' },
		],
	},
	{
		// NOTA: nel sito originale queste 5 voci non avevano una pagina "page" propria
		// (probabilmente ancore sulla pagina /body-lab/) — da verificare col cliente
		// prima del lancio e collegare alle sezioni corrette.
		titolo: 'Body Lab',
		voci: [
			{ label: 'Palestra della salute', href: '/body-lab#palestra-della-salute' },
			{ label: 'Nutrizionista', href: '/body-lab#nutrizionista' },
			{ label: 'Fisioterapia', href: '/body-lab#fisioterapia' },
			{ label: 'Posturologia', href: '/body-lab#posturologia' },
			{ label: 'Osteopatia', href: '/body-lab#osteopatia' },
		],
	},
];
