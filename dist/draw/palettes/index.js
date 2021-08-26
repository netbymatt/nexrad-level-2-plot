"use strict";
// ingest a palette and provide lookup and formatting functionality
// {palette: [r1,g1,b1,a1, r2,g2,b2,a2, ...], limits: [1,2, ...]}
// rgba values are returned with the the color index in the g position with 100% opacity
// this ensures that the colors are not blended because the index should be returned in the a position
// after the entire image is drawn the index information must be shifted from g to a
Object.defineProperty(exports, "__esModule", { value: true });
const rgbaLookupSize = 200;
class Palette {
    palette;
    limits;
    transparentIndex;
    lookupRgba;
    closest;
    downSampleReset;
    downSample;
    inDeadband;
    constructor(palette) {
        this.palette = palette.palette;
        this.limits = palette.limits;
        this.transparentIndex = palette.transparentIndex ?? 0;
        this.lookupRgba = findDbzRbgaGenerator(this.limits, this.palette, palette.maxDbzIndex);
        this.closest = {};
        this.downSampleReset = palette.downSampleReset ?? -Infinity;
        if (typeof palette.downSample === 'function') {
            this.downSample = palette.downSample;
        }
        else {
            this.downSample = downSample;
        }
        if (typeof palette.inDeadband === 'function') {
            this.inDeadband = palette.inDeadband;
        }
        else {
            this.inDeadband = inDeadband(this.downSampleReset);
        }
    }
    findColorRgba(dbz) {
        // find the rgba value of the color from the provided dbz value
        return this.lookupRgba[Math.trunc(dbz + rgbaLookupSize)];
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
    // match = [r,g,b[,a]]
    closestIndex(match) {
        // short circuit for transparent (black)
        if (match[0] <= 2 && match[1] <= 2 && match[2] <= 2)
            return this.transparentIndex;
        // short circuit previously calculated matches
        const asHex = match[0].toString(16).padStart(2, '0') + match[1].toString(16).padStart(2, '0') + match[2].toString(16).padStart(2, '0');
        if (this.closest[asHex])
            return this.closest[asHex];
        // initial conditions
        let closestIndex = 0;
        let closest = Infinity;
        // loop through array
        for (let i = 0; i < this.palette.length; i += 4) {
            const dist = Palette.geometricDistance(match, this.palette.slice(i, i + match.length));
            // test for closer
            if (dist < closest) {
                closest = dist;
                closestIndex = i / 4;
                if (dist === 0)
                    break;
            }
        }
        // store closest match to speed up next iteration
        this.closest[asHex] = closestIndex;
        return closestIndex;
    }
    // geometric distance
    static geometricDistance(a, b) {
        return Array.from(a).reduce((acc, val, idx) => acc + (val - b[idx]) ** 2, 0);
    }
}
exports.default = Palette;
// create a lookup table of colors for faster processing
const findDbzRbgaGenerator = (limits, palette, maxDbzIndex = 14) => {
    const lookupRgba = [];
    for (let i = -rgbaLookupSize; i <= rgbaLookupSize; i += 1) {
        let index = limits.findIndex((limit) => i < limit);
        // a value of -1 means it is off the end of the scale, set to highest value
        if (index === -1)
            index = maxDbzIndex;
        lookupRgba.push(`rgba(${palette[index * 4]},${palette[index * 4 + 1]},${palette[index * 4 + 2]},${palette[(index * 4 + 3)] / 255})`);
    }
    return lookupRgba;
};
const downSample = (cur, prev) => (cur === null ? prev : Math.max(cur, prev));
const inDeadband = (reset) => (a) => (a === null || a === reset || a === undefined);
//# sourceMappingURL=index.js.map