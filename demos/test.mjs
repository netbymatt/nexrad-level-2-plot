/* eslint-disable no-console */
import Level2Radar from 'nexrad-level-2-data';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { glob } from 'glob';
import fs from 'node:fs';

import { plot, writePngToFile } from '../src/index.mjs';

// list files
// const files = glob.sync('./data/KLOT/34/*');
// const files = glob.sync('./data/KLOT/381/*');
// const files = glob.sync('./data/KLOT/548/*');
const files = await glob.sync('./data/KLOT/940/*');
// const files = glob.sync('./data/KSRX/804/*');
// const files = glob.sync('./data/TORD/168/*');
// const files = glob.sync('./data/KLOT/KLOT20210812_171451_V*');	// ref palette tuning
// const files = glob.sync('./data/KLOT/KLOT20210621_041151_V06');	// vel palette tuning

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

// default to all plots unless single is specificed
const single = process.argv.includes('single');

let sizes = [1800];
let elevations = radarData.listElevations();
if (single) {
	sizes = sizes.slice(0, 1);
	// elevations where the lowest elevation is present, this is to ensure velocity is available
	const firstElevationIndex = elevations.slice(0, 1)[0];
	const lowestAngle = radarData.vcp.record.elevations[firstElevationIndex].elevation_angle;
	elevations = elevations.filter((elevation) => radarData.vcp.record.elevations[elevation].elevation_angle === lowestAngle);
}

// plot for each elevation and size
console.time('processing');
await Promise.allSettled(sizes.map(async (size) => {
	const plots = plot(radarData, ['REF', 'VEL'], {
		elevations,
		size,
		palettize: true,
		cropTo: size / 2,
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
}));
console.timeEnd('processing');
