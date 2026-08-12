import { createCanvas } from 'canvas';

const palettizeImage = (sourceCtx, palette) => {
	// get the dimensions of the image from the ctx
	const dim = {
		x: sourceCtx.canvas.width,
		y: sourceCtx.canvas.height,
	};

	// transform into indexed palette by finding the closest indexed color for each pixel
	// create a destination image that is transparent and indexed
	const indexedCanvas = createCanvas(dim.x, dim.y);
	const indexedCtx = indexedCanvas.getContext('2d', { pixelFormat: 'A8' });

	// get the source image data
	const { data: sourceData } = sourceCtx.getImageData(0, 0, dim.x, dim.y);
	// get the indexed image data (destination)
	const indexedImageData = indexedCtx.getImageData(0, 0, dim.x, dim.y);
	const { data: indexedData } = indexedImageData;

	// loop through each pixel
	// (a plain for loop indexing directly into the source data avoids allocating
	// a new typed array per pixel, which a .slice()-based approach would require)
	for (let idx = 0, srcIdx = 0; idx < indexedData.length; idx += 1, srcIdx += 4) {
		indexedData[idx] = palette.closestIndex(sourceData[srcIdx], sourceData[srcIdx + 1], sourceData[srcIdx + 2]);
	}

	// write the new image data
	indexedCtx.putImageData(indexedImageData, 0, 0);

	return indexedCanvas;
};

export default palettizeImage;
