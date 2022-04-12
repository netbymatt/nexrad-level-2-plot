const { draw, canvas } = require('./draw');
const { writePngToFile } = require('./utils/file');
/**
 *
 * @typedef PlottedCanvases Requested plots. Each PlottedCanvas may return false if the plot was not requested or if the data was unavailable for the plot.
 * @property {number} elevation Elevation number
 * @property {PlottedCanvas} [REF] Reflectivity
 * @property {PlottedCanvas} [VEL] Velocity
 */
/**
 * @typedef PlottedCanvas Canvas and additional metadata
 * @property {Canvas} canvas [canvas](https://www.npmjs.com/package/canvas) contains the plotted data and functions for outputtting various image formats.
 * @property {Uint8ClampedArray} palette Array that can be used to create palettized images from the Canvas library.
 */
/**
 * Plot level 2 data
 *
 * @class plot
 * @param {Level2Data} data Output from the [nexrad-level-2-data](https://github.com/netbymatt/nexrad-level-2-data) library
 * @param {(string|string[])} products Individual strings as shown in supported products to specify the products to be plotted.
 * @param {object} options Plotting options
 * @param {number} [options.size=3600] 1 to 3600. 1 to 3600. Size of the x and y axis in pixels. The image must be square so only a single integer is needed.
 * @param {number} [options.cropTo=3600] 1 to 3600. After scaling and downsampling as described above crop the resulting plot to the size specified. Internally, the image is actually drawn at the cropped size to save on processing time.
 * @param {string} [options.background=#000000] Background color of the image. This can be transparent by using #RGBA notation. See [ctx.fillStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle) for more information.
 * @param {number} [options.lineWidth=2] The raster image is created by drawing several arcs at the locations and colors specified in the data file. When scaling down you may get a better looking image by adjusting this value to something large than the default.
 * @param {(boolean|object)} [options.palettize] After drawing the image convert the image from RGBA to a palettized image. When true the same palette as the product is used. Additional options are described in [palettizing](#palettizing). This can significantly reduce the size of the resulting image with minimal loss of clarity.
 * @param {(undefined|number|number[])} [options.elevations=undefined] The specific elevations to plot. If undefined (default) all available elevations will be plotted. If an integer is provided a single elevation will be plotted with all the selected ```products```. If an array of integers are provided each ```products``` in each elevation will be plotted. Note that when a product and elevation combination do not exist the returned object will have false in the missing location. This is common where elevation 1 will have reflectivity data and elevation 2 (altough at the same angle as elevation 1) will contain velocity data.
 * @param {boolean} [options.usePreferredWaveforms = true] Waveform types of 1, 2, 3, 4 and 5 are produced by the radar. Type 1 is typically exclusive to reflectivity, Type 2 is typically exclusive to velocity however it also produces reflectivity data. Types 3, 4 and 5 all produce both velocity and reflectivity. When set to true type 1 waveforms will not plot velocity data, and type 2 waveforms will not plot reflectivity data. If you must see all information set this to false.
 * @returns {PlottedCanvases[]} Plotted canvases in the order they are requested by the input options.elevations
 */
const plot = (data, products, options) => {
	// store result
	const result = [];

	let requestedProducts;
	// make product list into an array
	if (products && Array.isArray(products)) {
		requestedProducts = products;
	} else if (typeof products === 'string') {
		requestedProducts = [products];
	} else {
		// default to all products
		requestedProducts = ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'];
	}

	// get the available elevations
	const availableElevations = data.listElevations();
	if (availableElevations.length === 0) throw new Error('No elevations availabe');

	// handle options.elevations defaults
	let elevations = options?.elevations;
	if (!elevations) elevations = availableElevations;
	if (typeof elevations === 'number') elevations = [elevations];

	elevations.forEach((elevation) => {
		const elevationResult = { elevation };
		requestedProducts.forEach((product) => {
			// parse and store result
			elevationResult[product] = draw(data, {
				...options,
				elevation,
				product,
			});
		});
		result.push(elevationResult);
	});

	return result;
};

module.exports = {
	plot,
	writePngToFile,
	canvas,
};
