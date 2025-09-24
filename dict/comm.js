const lands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
const landsZHS = ['平原', '海岛', '沼泽', '山脉', '树林', '荒野'];
const colors = {
	white: { tag: 'w', color: '#fffbd5' },
	blue: { tag: 'u', color: '#aae0fa' },
	black: { tag: 'b', color: '#cbc2bf' },
	red: { tag: 'r', color: '#f9aa8f' },
	green: { tag: 'g', color: '#9bd3ae' }
};
const rarity = {
	common: '#000',
	uncommon: '#6b7280',
	rare: '#a16207',
	mythic: '#c2410c',
	special: '#5b21b6'
};
const setList = [
	{
		label: 'WOE',
		value: 'Wilds of Eldraine',
		sta: 'w'
	},
	{
		label: 'LCI',
		value: 'The Lost Caverns of Ixalan',
		sta: 'w'
	},
	{
		label: 'MKM',
		value: 'Murders at Karlov Manor',
		sta: 'w'
	},
	{
		label: 'BIG',
		value: 'The Big Score',
		sta: 'w'
	},
	{
		label: 'OTJ',
		value: 'Outlaws of Thunder Junction',
		sta: 'w'
	},
	{
		label: 'BLB',
		value: 'Bloomburrow',
		sta: 'w'
	},
	{
		label: 'DSK',
		value: 'Duskmourn: House of Horror',
		sta: 'w'
	},
	{
		label: 'FDN',
		value: 'Foundations',
		sta: 'n'
	},
	{
		label: 'DFT',
		value: 'Aetherdrift',
		sta: 'n'
	},
	{
		label: 'TDM',
		value: 'Tarkir: Dragonstorm',
		sta: 'n'
	},
	{
		label: 'FIN',
		value: 'Final Fantasy',
		sta: 'n'
	},
	{
		label: 'EOE',
		value: 'Edge of Eternities',
		sta: 'n'
	},
	{
		label: 'SPM',
		value: 'Marvel Spider-Man',
		sta: 'n'
	},
	{
		label: 'TLA',
		value: 'Avatar: The Last Airbender',
		sta: 'n'
	}
];
export { lands, landsZHS, colors, setList };
