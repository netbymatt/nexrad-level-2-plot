// take the raw data values and turn them into indexed values in the palette
// this is the first step in palettizing and in the Radial run-length encoding process

const indexProduct = (radials, palette) => radials.map((radial) => {
	// a plain for loop avoids per-bin callback-invocation overhead here - this
	// runs up to ~radials x gates times per elevation/product
	const { moment_data: momentData } = radial;
	const indexedMoment = new Array(momentData.length);
	for (let idx = 0; idx < momentData.length; idx += 1) {
		const bin = momentData[idx];
		if (bin === null || palette.inDeadband(bin)) {
			indexedMoment[idx] = null;
		} else {
			indexedMoment[idx] = palette.findColorIndex(bin);
		}
	}
	return {
		...radial,
		moment_data: indexedMoment,
	};
});

export default indexProduct;
