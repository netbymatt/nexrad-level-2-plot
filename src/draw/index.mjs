import canvasObj from 'canvas';

import Palette from './palettes/index.mjs';

import palettizeImage from './palettize.mjs';

// data pre-processing
import filterProduct from './preprocess/filterproduct.mjs';
import downSample from './preprocess/downsample.mjs';
import indexProduct from './preprocess/indexproduct.mjs';
import rrle from './preprocess/rrle.mjs';

import * as ref from './palettes/ref.mjs';
import * as vel from './palettes/vel.mjs';
import * as rho from './palettes/rho.mjs';

const { createCanvas } = canvasObj;

// names of data structures keyed to product name
const dataNames = {
	REF: 'reflect',
	VEL: 'velocity',
	'SW ': 'spectrum',	// intentional space to fill 3-character requirement
	ZDR: 'zdr',
	PHI: 'phi',
	RHO: 'rho',	// correlation coefficient
};

// names of data retrieval routines keyed to product name
const dataFunctions = {
	REF: 'getHighresReflectivity',
	VEL: 'getHighresVelocity',
	RHO: 'getHighresCorrelation',
};

// generate all palettes

const palettes = {
	REF: new Palette(ref),
	VEL: new Palette(vel),
	RHO: new Palette(rho),
};

const preferredWaveformUsage = {
	1: ['REF', 'SW ', 'ZDR', 'PHI', 'RHO'],
	2: ['VEL'],
	3: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
	4: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
	5: ['REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO'],
};

// default options
const DEFAULT_OPTIONS = {
	// must be a square image
	size: 3600,
	cropTo: 3600,
	background: 'black',
	lineWidth: 2,
	usePreferredWaveforms: true,
	alpha: true,
	imageSmoothingEnabled: true,
	antialias: 'default',
};

const draw = (data, _options) => {
	// combine options with defaults
	const options = {
		...DEFAULT_OPTIONS,
		..._options,
	};

	// check preferred waveforms
	const elevationInfo = data?.vcp?.record?.elevations?.[options?.elevation];
	// elevation info is not available in chunks mode, so preferred waveforms cannot be processed
	if (elevationInfo) {
		const preferredProducts = preferredWaveformUsage[elevationInfo.waveform_type];
		if (options.usePreferredWaveforms && !preferredProducts.includes(options.product)) return false;
	}

	// calculate scale
	if (options.size > DEFAULT_OPTIONS.size) throw new Error(`Upsampling is not supported. Provide a size <= ${DEFAULT_OPTIONS.size}`);
	if (options.size < 1) throw new Error('Provide options.size > 0');
	const scale = DEFAULT_OPTIONS.size / options.size;

	// wsr88d uses a gate size of 0.25km, tdwr uses a gate size of 0.15km or 0.30km
	// this calculation scales the plot accordingly to the nominal 0.25km so all generated plots are at the same scale
	const rawGateSize = data?.data?.[options.elevation]?.[0]?.record?.reflect?.gate_size ?? 0.25;
	const gateSizeScaling = rawGateSize / 0.25;

	// calculate crop, adjust if necessary
	const cropTo = Math.min(options.size, options.cropTo);
	if (options.cropTo < 1) throw new Error('Provide options.cropTo > 0');

	// create the canvas and context
	const canvas = createCanvas(cropTo, cropTo);
	const ctx = canvas.getContext('2d', { alpha: options.alpha });
	ctx.antialias = options.antialias;
	ctx.imageSmoothingEnabled = options.imageSmoothingEnabled;

	// fill background with black
	ctx.fillStyle = options.background;
	ctx.fillRect(0, 0, cropTo, cropTo);

	// canvas settings
	// ctx.imageSmoothingEnabled = true;
	ctx.lineWidth = options.lineWidth / gateSizeScaling;
	ctx.translate(cropTo / 2, cropTo / 2);
	ctx.rotate(-Math.PI / 2);

	// get the palette
	const palette = palettes[options.product];
	// test for valid palette
	if (!palette) throw new Error(`No product found for product type: ${options.product}`);

	// set the elevation
	data.setElevation(options.elevation);
	// get the header data
	const headers = data.getHeader();

	// calculate resolution in radians, default to 1°
	let resolution = Math.PI / 180;
	if (data?.vcp?.record?.elevations?.[options.elevation]?.super_res_control?.super_res?.halfDegreeAzimuth) resolution /= 2;
	// calculate half resolution step for additional calculations below
	const halfResolution = resolution / 2;

	// match product name to data
	const dataName = dataNames[options.product];
	const dataFunction = dataFunctions[options.product];

	// check for valid product
	if (dataName === undefined) throw new Error(`No data object name found for product: ${options.product}`);
	if (dataFunction === undefined) throw new Error(`No data function found for product: ${options.product}`);

	// check for data for this product
	if (headers[0][dataName] === undefined) return false;

	// pre-processing
	const filteredProduct = filterProduct(headers, dataName);
	const downSampledProduct = downSample(filteredProduct, scale, resolution, options, palette);
	const indexedProduct = indexProduct(downSampledProduct, palette);
	const rrlEncoded = rrle(indexedProduct, resolution);

	// loop through data
	// bins are drawn in the same order as before (radials in azimuth order, then
	// range bins outward) but a stroke() + beginPath() pair is only expensive to
	// issue once per arc, and most of that cost is fixed overhead independent of
	// arc size. so instead of stroking every single bin individually, consecutive
	// bins that share the same color are accumulated into one path and painted
	// with a single stroke() call. this never reorders anything relative to the
	// original drawing sequence, it just defers the stroke() until the color is
	// about to change (or the data runs out), so the result is unaffected other
	// than by output speed.
	let openStrokeStyle = null;
	const flushStroke = () => {
		if (openStrokeStyle === null) return;
		ctx.stroke();
	};

	rrlEncoded.forEach((radial) => {
		// calculate plotting parameters
		const deadZone = radial.first_gate / radial.gate_size / scale;

		// 10% is added to the arc to ensure that each arc bleeds into the next just slightly to avoid radial empty spaces at further distances
		const startAngle = radial.azimuth * (Math.PI / 180) - halfResolution * 1.1;
		const endAngle = radial.azimuth * (Math.PI / 180) + halfResolution * 1.1;

		// plot each bin
		// (a plain for loop avoids per-bin callback-invocation overhead - this runs
		// up to ~radials x gates times per elevation/product)
		const { moment_data: momentData } = radial;
		for (let idx = 0; idx < momentData.length; idx += 1) {
			const bin = momentData[idx];
			if (bin !== null) {
				// different methods for rrle encoded or not
				let color;
				let arcEndAngle;
				if (bin.count) {
					// rrle encoded
					color = palette.lookupRgba[bin.value];
					arcEndAngle = endAngle + resolution * (bin.count - 1);
				} else {
					// plain data
					color = palette.lookupRgba[bin];
					arcEndAngle = endAngle;
				}

				// paint and close out the prior path whenever the color changes, since a
				// single stroke() call can only use one strokeStyle
				if (color !== openStrokeStyle) {
					flushStroke();
					ctx.beginPath();
					ctx.strokeStyle = color;
					openStrokeStyle = color;
				}

				const radius = (idx + deadZone) * gateSizeScaling;
				// moveTo to the arc's start point first so this arc becomes its own
				// subpath rather than getting connected to the previous arc by a
				// straight line (canvas connects consecutive arc() calls otherwise)
				ctx.moveTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
				ctx.arc(0, 0, radius, startAngle, arcEndAngle);
			}
		}
	});
	// paint whatever is left in the final open path
	flushStroke();

	if (!options.palettize) {
	// return the palette and canvas
		return {
			canvas,
		};
	}

	// palettize image
	const palettized = palettizeImage(ctx, palette);

	// return palettized image
	return {
		canvas: palettized,
		palette: palette.getPalette(),
	};
};

const canvas = canvasObj;

export {
	draw,
	DEFAULT_OPTIONS,
	canvas,
};
