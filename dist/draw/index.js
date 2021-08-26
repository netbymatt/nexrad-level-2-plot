"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = __importDefault(require("canvas"));
const palettes_1 = __importDefault(require("./palettes"));
const ref_1 = __importDefault(require("./palettes/ref"));
const vel_1 = __importDefault(require("./palettes/vel"));
const palettize_1 = __importDefault(require("./palettize"));
const { createCanvas } = canvas_1.default;
// names of data structures keyed to product name
const dataNames = {
    REF: 'reflect',
    VEL: 'velocity',
    'SW ': 'spectrum',
    ZDR: 'zdr',
    PHI: 'phi',
    RHO: 'rho',
};
// names of data retrieval routines keyed to product name
const dataFunctions = {
    REF: 'getHighresReflectivity',
    VEL: 'getHighresVelocity',
};
// generate all palettes
const palettes = {
    REF: new palettes_1.default(ref_1.default),
    VEL: new palettes_1.default(vel_1.default),
};
// default options
const DEFAULT_OPTIONS = {
    // must be a square image
    size: 3600,
    cropTo: 3600,
    background: 'black',
    lineWidth: 2,
};
// calculation constants
const RAD45 = ((45 * Math.PI) / 180);
const RAD90 = RAD45 * 2;
const draw = (data, _options) => {
    // combine options with defaults
    const options = {
        ...DEFAULT_OPTIONS,
        ..._options,
    };
    // calculate scale
    if (options.size > DEFAULT_OPTIONS.size)
        throw new Error(`Upsampling is not supported. Provide a size <= ${DEFAULT_OPTIONS.size}`);
    if (options.size < 1)
        throw new Error('Provide options.size > 0');
    const scale = DEFAULT_OPTIONS.size / options.size;
    // calculate crop, adjust if necessary
    const cropTo = Math.min(options.size, options.cropTo);
    if (options.cropTo < 1)
        throw new Error('Provide options.cropTo > 0');
    // create the canvas and context
    const canvas = createCanvas(cropTo, cropTo);
    const ctx = canvas.getContext('2d');
    // fill background with black
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, cropTo, cropTo);
    // canvas settings
    ctx.imageSmoothingEnabled = true;
    ctx.lineWidth = options.lineWidth;
    ctx.translate(cropTo / 2, cropTo / 2);
    ctx.rotate(-Math.PI / 2);
    // get the palette
    const palette = palettes[options.product];
    // test for valid palette
    if (!palette)
        throw new Error(`No product found for product type: ${options.product}`);
    // set the elevation
    data.setElevation(options.elevation);
    // get the header data
    const headers = data.getHeader();
    // calculate resolution in radians, default to 1°
    let resolution = Math.PI / 180;
    if (data?.vcp?.record?.elevation?.s[options.elevation]?.super_res_control?.super_res?.halfDegreeAzimuth)
        resolution /= 2;
    // calculate half resolution step for additional calculations below
    const halfResolution = resolution / 2;
    // match product name to data
    const dataName = dataNames[options.product];
    const dataFunction = dataFunctions[options.product];
    // check for valid product
    if (dataName === undefined)
        throw new Error(`No data object name found for product: ${options.product}`);
    if (dataFunction === undefined)
        throw new Error(`No data function found for product: ${options.product}`);
    // check for data for this product
    if (headers[0][dataName] === undefined)
        return false;
    // loop through data
    headers.forEach((header) => {
        // get correct data
        const thisRadial = header[dataName];
        // skip if this radial isn't found
        if (thisRadial === undefined)
            return;
        // calculate plotting parameters
        const deadZone = thisRadial.first_gate / thisRadial.gate_size;
        const startAngle = header.azimuth * (Math.PI / 180) - halfResolution;
        const endAngle = startAngle + resolution;
        // track max value for downsampling(d)
        let downsampled = 0;
        let lastRemainder = 0;
        // calculate maximum bin to plot based on azimuth
        // wrap azimuth to 90° offset by -45° (% in js is remainder, the formula below make it in to modulus)
        const azWrap = (((startAngle - RAD45) % RAD90) + RAD90) % RAD90;
        // calculate a magnitude multiplier as 1/sin with 45° shift removed
        const azMagnitudeMult = 1 / Math.abs(Math.sin(azWrap + RAD45));
        const cropMaxBin = Math.ceil(Math.abs((options.cropTo / 2) * scale * azMagnitudeMult));
        // compare max calculated value with length of radial
        const maxBin = Math.min(cropMaxBin, thisRadial.moment_data.length);
        // plot each bin
        for (let idx = 0; idx < maxBin; idx += 1) {
            // get the value
            const bin = thisRadial.moment_data[idx];
            // skip null values
            if (bin !== null) {
                let thisSample;
                // test for downsampling
                if (scale !== 1) {
                    const remainder = idx % scale;
                    // test for rollover in scaling
                    if (remainder < lastRemainder) {
                        // plot this point and reset values
                        thisSample = downsampled;
                        downsampled = 0;
                    }
                    // store this sample if it meets downsample requirements
                    downsampled = palette.downSample(bin, downsampled);
                    // store for rollover tracking
                    lastRemainder = remainder;
                }
                else {
                    thisSample = bin;
                }
                // see if there's a sample to plot
                if (thisSample && !palette.inDeadband(thisSample)) {
                    ctx.beginPath();
                    ctx.strokeStyle = palette.findColorRgba(thisSample);
                    ctx.arc(0, 0, (idx + deadZone) / scale, startAngle, endAngle);
                    ctx.stroke();
                }
            }
        }
    });
    if (!options.palettize) {
        // return the palette and canvas
        return {
            canvas,
        };
    }
    // palettize image
    const palettized = palettize_1.default(canvas.getContext('2d'), palette);
    // return palettized image
    return {
        canvas: palettized,
        palette: palette.getPalette(),
    };
};
module.exports = {
    draw,
    DEFAULT_OPTIONS,
    canvas: canvas_1.default,
};
//# sourceMappingURL=index.js.map