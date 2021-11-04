const { Level2Radar } = require('nexrad-level-2-data');
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');
const fs = require('fs');

const { plot, writePngToFile } = require('../src');

// list files
// const files = glob.sync('./data/KLOT/34/*');
// const files = glob.sync('./data/KLOT/381/*');
// const files = glob.sync('./data/KLOT/548/*');
// const files = glob.sync('./data/KLOT/940/*');
// const files = glob.sync('./data/KSRX/804/*');
// const files = glob.sync('./data/TORD/767/*');
const files = glob.sync('./data/KLOT/KLOT20210812_171451_V*');	// ref palette tuning
// const files = glob.sync('./data/KLOT/KLOT20210621_041151_V06');	// vel palette tuning

// const store each file's data
const chunks = [];

// parse each file
files.forEach((file) => {
	const fileBuffer = fs.readFileSync(file);
	chunks.push(new Level2Radar(fileBuffer));
});

// combine data
const radarData = Level2Radar.combineData(chunks);

// result array by elevations
const plots = [];

// default to all plots unless single is specificed
const single = process.argv.includes('single');

let sizes = [1800, 900, 800, 600, 450, 100];
let elevations = radarData.listElevations();
if (single) {
	sizes = sizes.slice(0, 1);
	// elevations where the lowest elevation is present, this is to ensure velocity is available
	const firstElevationIndex = elevations.slice(0, 1)[0];
	const lowestAngle = radarData.vcp.record.elevations[firstElevationIndex].elevation_angle;
	elevations = elevations.filter((elevation) => radarData.vcp.record.elevations[elevation].elevation_angle === lowestAngle);
}

// plot for each elevation and size
(async () => {
	await Promise.allSettled(sizes.map(async (size) => {
		await Promise.allSettled(elevations.map(async (elevation) => {
			plots[elevation] = plot(radarData, ['REF', 'VEL'], {
				elevation,
				size,
				palettize: true,
				cropTo: size / 2,
			});

			// write files to disk
			await Promise.allSettled([
				writePngToFile(`./output/REF-${elevation}-${size}.png`, plots[elevation].REF),
				writePngToFile(`./output/VEL-${elevation}-${size}.png`, plots[elevation].VEL),
			]);
		}));
	}));
})();
