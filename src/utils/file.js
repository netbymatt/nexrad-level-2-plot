const fs = require('fs/promises');
// write a canvas to a Png file
/**
 * Write a Canvas to the specified file
 * @param {string} fileName Path to write output to, passed to fs.createWriteStream
 * @param {Canvas} data Canvas provided by the plot() function
 * @returns Promise
 */
const writePngToFile = async (fileName, data) => {
	// the draw function will return false if no data was found, short circuit the output here
	if (!data.canvas) {
		return;
	}

	// options
	const options = {};
	if (data.palette) options.palette = data.palette;

	// write to the stream
	await fs.writeFile(fileName, await data.canvas.encode('webp', 100));
};

module.exports = {
	writePngToFile,
};
