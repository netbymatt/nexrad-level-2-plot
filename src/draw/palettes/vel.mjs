const palette = [
	// 0: green/outbound
	215, 255, 225, 255,
	179, 243, 188, 255,
	143, 230, 150, 255,
	108, 218, 113, 255,
	72, 205, 75, 255,
	36, 193, 38, 255,
	0, 180, 0, 255,
	10, 168, 10, 255,
	20, 157, 20, 255,
	30, 145, 30, 255,
	40, 133, 40, 255,

	// 11: nearly zero
	50, 122, 50, 255,
	128, 50, 50, 255,

	// 13: red/inbound
	147, 40, 40, 255,
	165, 30, 30, 255,
	183, 20, 20, 255,
	202, 10, 10, 255,

	220, 0, 0, 255,
	226, 36, 38, 255,
	232, 72, 75, 255,
	238, 108, 113, 255,
	243, 143, 150, 255,
	249, 179, 188, 255,
	255, 215, 225, 255,

	// 24: transparent
	255, 255, 255, 0,
];

const downSample = (cur, prev) => {
	// no data, use previous value
	if (cur === null) return prev;
	// test for magnitude change, prev may be null but Math.abs(null) === 0 so this is valid
	if (Math.abs(cur) >= Math.abs(prev)) return cur;
	return prev;
};

const limits = [-99, -90, -80, -70, -60, -50, -40, -30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 99,
].map((limit) => limit * (50 / 99));

const downSampleReset = null;

const maxDbzIndex = 12; // index of maximum dbz

const transparentIndex = 24;

export {
	palette,
	downSample,
	limits,
	downSampleReset,
	maxDbzIndex,
	transparentIndex,
};
