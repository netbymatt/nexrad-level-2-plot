const { Level2Radar } = require('nexrad-level-2-data');
const glob = require('glob');
const fs = require('fs');

const { plot, writePngToFile } = require('./src');

// list files
const files = glob.sync('./data/TORD/767/*');

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

// plot for each elevation
(async () => {
	await Promise.allSettled(radarData.listElevations().map(async (elevation) => {
		plots[elevation] = plot(radarData, ['REF', 'VEL'], {
			elevation,
		});

		// write files to disk
		await Promise.allSettled([
			writePngToFile(`./output/REF-${elevation}.png`, plots[elevation].REF),
			writePngToFile(`./output/VEL-${elevation}.png`, plots[elevation].VEL),
		]);
	}));
	console.log(plots);
	console.log();
})();
