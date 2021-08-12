const palette = [
	255, 255, 255, 0,	// transparent
	0, 128, 128, 128,
	1, 80, 128, 128,
	0, 0, 128, 128,
	0, 255, 0, 255,
	0, 200, 0, 255,
	0, 144, 0, 255,
	255, 255, 0, 255,
	231, 192, 0, 255,
	255, 144, 0, 255,
	255, 0, 0, 255,
	214, 0, 0, 255,
	192, 0, 0, 255,
	255, 0, 255, 255,
	153, 85, 201, 255,

	// additional halfway to black values for cleaner picture
	0, 64, 64, 64,
	1, 40, 64, 64,
	0, 0, 64, 64,
	0, 128, 0, 128,
	0, 100, 0, 128,
	0, 72, 0, 128,
	128, 128, 0, 128,
	116, 96, 0, 128,
	128, 72, 0, 128,
	128, 0, 0, 128,
	107, 0, 0, 128,
	96, 0, 0, 128,
	128, 0, 128, 128,
	77, 43, 101, 128,
];

const maxDbzIndex = 14; // index of maximum dbz

const limits = 	[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];

const transparentIndex = 0;

module.exports = {
	palette,
	maxDbzIndex,
	limits,
	transparentIndex,
};
