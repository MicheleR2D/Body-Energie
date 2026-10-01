// Orari di apertura (dati reali del sito originale). Una sola fonte: li usano
// il footer ("Vieni a trovarci", orari estivi) e le pagine che ne avranno bisogno.
export interface FasciaOraria {
	giorni: string;
	ore: string;
}

export interface BloccoOrari {
	titolo: string;
	righe: FasciaOraria[];
}

export const orari: BloccoOrari[] = [
	{
		titolo: 'Orari Centro',
		righe: [
			{ giorni: 'Lun - Ven', ore: '5.00 - 22.00' },
			{ giorni: 'Sabato', ore: '8.00 - 18.00' },
			{ giorni: 'Domenica', ore: '8.00 - 13.30' },
		],
	},
	{
		titolo: 'Orari Termarium',
		righe: [
			{ giorni: 'Lun - Mar - Gio', ore: '10.00 - 21.00' },
			{ giorni: 'Sabato', ore: '10.00 - 17.30' },
			{ giorni: 'Domenica', ore: '10.00 - 13.00' },
		],
	},
];

export const orariEstivi: BloccoOrari[] = [
	{
		titolo: 'Centro',
		righe: [
			{ giorni: 'Lun - Ven', ore: '5.00 - 22.00' },
			{ giorni: 'Sabato', ore: '8.00 - 13.30' },
			{ giorni: 'Domenica', ore: '8.00 - 13.30' },
		],
	},
	{
		titolo: 'Termarium',
		righe: [
			{ giorni: 'Lunedì', ore: '18.00 - 21.00' },
			{ giorni: 'Giovedì', ore: '10.00 - 21.00' },
		],
	},
];
