/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import Level2Radar from 'nexrad-level-2-data';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { glob } from 'glob';
import fs from 'node:fs';
import { plot, writePngToFile } from '../src/index.mjs';

// list files
const files = glob.sync('./data/KLOT/KLOT20210812_171451_V*');	// ref palette tuning

// const store each file's data
const chunks = [];

// parse each file
files.forEach((file) => {
	// eslint-disable-next-line n/no-sync
	const fileBuffer = fs.readFileSync(file);
	chunks.push(new Level2Radar(fileBuffer));
});

// combine data
const radarData = Level2Radar.combineData(chunks);

const size = 1800;
const iterations = 5;

// plot for each elevation and size

const start = new Date();
for (let i = 0; i < iterations; i += 1) {
	const plots = plot(radarData, ['REF', 'VEL'], {
		size,
		palettize: true,
		cropTo: size / 2,
		alpha: false,
		imageSmoothingEnabled: false,
		antialias: 'none',
	});

	// write files to disk
	const writePromises = [];
	plots.forEach((p) => {
		const { elevation } = p;
		writePromises.push(writePngToFile(`./output/REF-${elevation}-${size}.png`, p.REF));
		writePromises.push(writePngToFile(`./output/VEL-${elevation}-${size}.png`, p.VEL));
	});
	await Promise.allSettled(writePromises);

	const end = new Date();
	console.log(`Iteration: ${i + 1}/${iterations} Average time: ${(end - start) / 1000 / (i + 1)} s`);
}
