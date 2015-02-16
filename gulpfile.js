
var gulp = require('gulp'),
	hint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	mincss = require('gulp-cssmin'),
	rimraf = require('gulp-rimraf'),
	clean = require('gulp-clean'),
	filter = require('gulp-filter'),
	browserify = require('gulp-browserify'),
	imSoStylish = require('jshint-stylish'),
	web = require('gulp-webserver'),
	order = require('gulp-order'),
	traceur = require('gulp-traceur');

var do_browserify = true;

gulp.task('js', function() {
	gulp.src('src/**/*.js')
		.pipe(hint())
		.pipe(hint.reporter('jshint-stylish'))
		.pipe(order([
			'ha.js',
			'ha.json.js',
			'ha.object.js',
			'ha.entity.js',
			'ha.view.js',
			'ha.controller.js',
			'ha.xhr.js'
		], {base: 'src/'}))
		.pipe(concat('ha.js', {newLine: '\r\n\r\n'}))
		.pipe(gulp.dest('app/js'));
});

if(do_browserify) // there's a better way to do this
{
	gulp.task('browserify', function() {
			gulp.src('app/js/app.js')
				.pipe(browserify())
				.pipe(rename('bundle.js'))
				.pipe(gulp.dest('app/js'));
	});
} else {
	gulp.task('browserify', function() {});
}

gulp.task('scripts', ['js', 'browserify']);

gulp.task('server', function() {
	gulp.src('app').pipe(web({livereload:true, open:true}));
});

gulp.task('clean', function() {
	gulp.src('dist/**/*.*', {read:false}).pipe(clean({force: true}));
});

gulp.task('build', ['clean', 'scripts'], function() {
	gulp.src('app/**')
		.pipe(filter(function(file) {
			var ext = file.path.split('.')[1];
			return ext !== "js" && ext !== "css" && ext !== "scss";
		}))
		.pipe(gulp.dest('dist'));

	if(do_browserify)
		gulp.src('app/js/bundle.js').pipe(uglify()).pipe(gulp.dest('dist/js'));
	else
		gulp.src('app/js/**/*.js').pipe(uglify()).pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
	gulp.watch('src/*.js', ['scripts']);
})

gulp.task('default', ['server', 'watch']);