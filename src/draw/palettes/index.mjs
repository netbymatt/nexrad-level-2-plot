// ingest a palette and provide lookup and formatting functionality
// {palette: [r1,g1,b1,a1, r2,g2,b2,a2, ...], limits: [1,2, ...]}
// rgba values are returned with the the color index in the g position with 100% opacity
// this ensures that the colors are not blended because the index should be returned in the a position
// after the entire image is drawn the index information must be shifted from g to a

import hexLookup from './hexlookup.mjs';
import {
	findDbzIndexGenerator, findDbzRbgaGenerator, downSample, inDeadband, RGBA_LOOKUP_SIZE,
} from './helpers.mjs';

class Palette {
	constructor(palette) {
		this.palette = palette.palette;
		this.limits = palette.limits;
		this.transparentIndex = palette.transparentIndex;
		this.lookupRgba = findDbzRbgaGenerator(this.limits, this.palette, palette.maxDbzIndex);
		this.lookupIndex = findDbzIndexGenerator(this.limits, this.palette, palette.maxDbzIndex);
		this.closest = {};

		// these may not exist and are overridden with default functions
		if (Object.hasOwn(palette, 'downSampleReset')) {
			this.downSampleReset = palette.downSampleReset;
		} else {
			this.downSampleReset = -Infinity;
		}
		if (typeof palette.downSample === 'function') {
			this.downSample = palette.downSample;
		} else {
			this.downSample = downSample;
		}

		if (typeof palette.inDeadband === 'function') {
			this.inDeadband = palette.inDeadband;
		} else {
			this.inDeadband = inDeadband(this.downSampleReset);
		}
	}

	findColorIndex(dbz) {
		// find the rgba value of the color from the provided dbz value
		return this.lookupIndex[Math.trunc(dbz + RGBA_LOOKUP_SIZE)];
	}

	getPalette() {
		// return the palette properly formatted for the PNG function
		const dest = new Uint8ClampedArray(256 * 4);
		this.palette.forEach((val, idx) => {
			dest[idx] = val;
		});
		return dest;
	}

	transparentColorRgba() {
		// return the rgba value of the transparent color
		const index = this.transparentIndex;
		return `rgba(${this.palette[index * 4]},${this.palette[index * 4 + 1]},${this.palette[index * 4 + 2]},${this.palette[(index * 4 + 3)] / 255})`;
	}

	// r,g,b = individual color components, passed separately to avoid allocating
	// a temporary array for every pixel (this is called once per output pixel)
	closestIndex(r, g, b) {
		// short circuit for transparent (black)
		if (r <= 2 && g <= 2 && b <= 2) return this.transparentIndex;
		// short circuit previously calculated matches
		const asHex = hexLookup[r] + hexLookup[g] + hexLookup[b];
		if (this.closest[asHex]) return this.closest[asHex];
		// initial conditions
		let closestIndex = 0;
		let closest = Infinity;
		// loop through array
		for (let i = 0; i < this.palette.length; i += 4) {
			const dist = Palette.geometricDistance(r, g, b, this.palette[i], this.palette[i + 1], this.palette[i + 2]);
			// test for closer
			if (dist < closest) {
				closest = dist;
				closestIndex = i / 4;
				if (dist === 0) break;
			}
		}
		// store closest match to speed up next iteration
		this.closest[asHex] = closestIndex;
		return closestIndex;
	}

	// geometric distance
	// square root is intentionally not taken for performance reasons
	static geometricDistance(r1, g1, b1, r2, g2, b2) {
		return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
	}
}

export default Palette;
