const gulp = require('gulp');
const jsdoc2md = require('jsdoc-to-markdown');
const jsdoc = require('gulp-jsdoc3');
const fs = require('fs');
const del = require('del');

const files = [
	'src/index.js',
	'README.md',
];

const mdConfig = {
	files,
	'global-index-format': 'grouped',
};

const htmlConfig = {
	opts: {
		destination: './docs',
	},
	plugins: ['plugins/markdown'],

};

gulp.task('docs', (done) => {
	del(['API.md', 'docs/']);
	jsdoc2md.render(mdConfig).then((output) => fs.writeFileSync('API.md', output));
	gulp.src(files, { read: false })
		.pipe(jsdoc(htmlConfig, done));
});
