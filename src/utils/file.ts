import { PngConfig } from 'canvas';
import fs from 'fs';
import { Plot } from '../types';

// write a canvas to a Png file
/**
 * Write a Canvas to the specified file
 * @param {string} fileName Path to write output to, passed to fs.createWriteStream
 * @param {Canvas} data Canvas provided by the plot() function
 * @returns Promise
 */
// eslint-disable-next-line import/prefer-default-export
export const writePngToFile = (fileName: string, data: Plot):Promise<void> => new Promise<void>((resolve, reject) => {
	// the draw function will return false if no data was found, short circuit the output here
	if (!data.canvas) {
		resolve();
		return;
	}

	// get a write stream
	const writeStream = fs.createWriteStream(fileName);

	// options
	const options:PngConfig = {};
	if (data.palette) options.palette = data.palette;

	// write to the stream
	data.canvas.createPNGStream(options).pipe(writeStream);
	writeStream.on('finish', () => resolve());
	writeStream.on('error', (e: Error) => reject(e));
});
