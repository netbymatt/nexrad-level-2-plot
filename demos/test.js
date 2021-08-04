const { Level2Radar } = require('nexrad-level-2-data');
const glob = require('glob');
const fs = require('fs');

const { plot, writePngToFile } = require('../src');

// list files
const files = glob.sync('./data/KLOT/34/*');
// const files = glob.sync('./data/KLOT/34/*');
// const files = glob.sync('./data/KLOT/381/*');
// const files = glob.sync('./data/KLOT/548/*');
// const files = glob.sync('./data/KLOT/940/*');
// const files = glob.sync('./data/KSRX/804/*');
// const files = glob.sync('./data/TORD/767/*');

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

// plot for each elevation and size
(async () => {
	await Promise.allSettled([1800, 900, 450, 100].map(async (size) => {
		await Promise.allSettled(radarData.listElevations().map(async (elevation) => {
			plots[elevation] = plot(radarData, ['REF', 'VEL'], {
				elevation,
				size,
			});

			// write files to disk
			await Promise.allSettled([
				writePngToFile(`./output/REF-${elevation}-${size}.png`, plots[elevation].REF),
				writePngToFile(`./output/VEL-${elevation}-${size}.png`, plots[elevation].VEL),
			]);
		}));
		console.log(plots);
		console.log();
	}));
})();
