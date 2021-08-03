const { draw } = require('./draw');
const { writePngToFile } = require('./utils/file');

const plot = (data, _products, options) => {
	// store result
	const result = {};

	let products;
	// make product list into an array
	if (_products && Array.isArray(_products)) {
		products = _products;
	} else if (typeof _products === 'string') {
		products = [_products];
	} else {
		// default to all products
		products = ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'];
	}

	// get the available elevations
	const elevations = data.listElevations();
	if (elevations.length === 0) throw new Error('No elevations availabe');

	products.forEach((product) => {
		// parse and store result
		result[product] = draw(data, {
			...options,
			product,
		});
	});
	return result;
};

module.exports = {
	plot,
	writePngToFile,
};
