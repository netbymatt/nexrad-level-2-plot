const { createCanvas } = require('@napi-rs/canvas');

const palettizeImage = (sourceCtx, palette) => {
	// get the dimensions of the image from the ctx
	const dim = {
		x: sourceCtx.canvas.width,
		y: sourceCtx.canvas.height,
	};

	// transform into indexed palette by finding the closest indexed color for each pixel
	// create a destination image that is transparent and indexed
	const indexedCanvas = createCanvas(dim.x, dim.y);
	const indexedCtx = indexedCanvas.getContext('2d');

	// get the source image data
	const sourceImageData = sourceCtx.getImageData(0, 0, dim.x, dim.y);
	// get the indexed image data (destination)
	const indexedImageData = indexedCtx.getImageData(0, 0, dim.x, dim.y);

	// loop through each pixel
	for (let i = 0; i < indexedImageData.data.length; i += 4) {
		const [r, g, b, a] = palette.closestValue(sourceImageData.data.slice(i, i + 3));
		indexedImageData.data[i] = r;
		indexedImageData.data[i + 1] = g;
		indexedImageData.data[i + 2] = b;
		indexedImageData.data[i + 3] = a;
	}

	// write the new image data
	indexedCtx.putImageData(indexedImageData, 0, 0);

	return indexedCanvas;
};

module.exports = palettizeImage;
