import { Canvas } from 'canvas';

export interface Plot {
	canvas: Canvas,
	palette?: Uint8ClampedArray,
}

export interface PaletteData {
	palette: number[],
	limits: number[],
	transparentIndex?: number,
	downSampleReset?: number|null,
	downSample?: (cur:number, prev:number) => number,
	inDeadband?: () => boolean,
	maxDbzIndex: number;
}

export interface DrawOptions {
	size: number,
	cropTo: number,
	background: string,
	lineWidth: number,
	product: string,
	elevation: number,
	palettize?: boolean,
}
