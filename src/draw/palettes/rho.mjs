const palette = [
	255, 255, 255, 0,	// transparent
	0, 0, 0, 255,
	22, 22, 23, 255,
	45, 45, 47, 255,
	68, 67, 71, 255,
	91, 90, 95, 255,
	111, 111, 117, 255,
	134, 133, 140, 255,
	140, 139, 154, 255,
	117, 115, 152, 255,
	93, 92, 149, 255,
	68, 66, 145, 255,
	45, 43, 142, 255,
	22, 20, 140, 255,
	17, 13, 168, 255,
	12, 6, 196, 255,
	34, 28, 216, 255,
	128, 126, 214, 255,
	107, 215, 130, 255,
	110, 235, 54, 255,
	146, 206, 1, 255,
	231, 198, 0, 255,
	236, 14, 0, 255,
	186, 64, 129, 255,
	255, 255, 255, 255,

];

const maxDbzIndex = 24; // index of maximum dbz

const limits = [
	0.2000, 0.2370, 0.2739, 0.3109, 0.3478, 0.3848, 0.4217, 0.4587,
	0.4957, 0.5326, 0.5696, 0.6065, 0.6435, 0.6804, 0.7174, 0.7543,
	0.7913, 0.8283, 0.8652, 0.9022, 0.9391, 0.9761, 1.0130, 1.0500,
];

const transparentIndex = 0;

// min is the most interesting when looking at rho/cc
const downSample = (cur, prev) => {
	// no value provided, use previous
	if (cur === null) return prev;
	// previous value is null (first run), return current value
	// this is how the typical "find the highest" gets reversed
	if (prev === null) return cur;
	// return the min if we have to real values
	return Math.min(cur, prev);
};

export {
	palette,
	maxDbzIndex,
	limits,
	transparentIndex,
	downSample,
};
