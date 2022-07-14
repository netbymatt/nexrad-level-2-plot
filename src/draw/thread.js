const { Level2Radar } = require('nexrad-level-2-data');
const { workerData } = require('piscina');
const { draw } = require('./index');

module.exports = (options) => {
	const level2Radar = Level2Radar(workerData);
	const plot = draw(level2Radar, options);
	return plot;
};
