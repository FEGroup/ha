
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
	sass = require('gulp-ruby-sass'),
	web = require('gulp-webserver')
	traceur = require('gulp-traceur');

var do_browserify = true;

gulp.task('hint', function() {
	gulp.src('src/js/**/*.js')
		//.pipe(filter(function(file) {
		//	var fn = file.path.split('/')[file.path.split('/').length-1];
		//	return fn !== "bundle.js";
		//}))
		.pipe(hint())
		.pipe(hint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
	gulp.src('src/**/*.js')
		//.pipe(traceur())
		.pipe(concat('ha.js'))
		.pipe(gulp.dest('app/js'));
});

//gulp.task('sass', function() {
//	gulp.src('app/scss/**/*.scss')
//		.pipe(sass())
//		.pipe(gulp.dest('app/css'));
//});

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

gulp.task('scripts', ['js', 'hint', 'browserify']);

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

	//gulp.src('app/css/**/*.css').pipe(mincss()).pipe(gulp.dest('dist/css'));
});

gulp.task('watch', function() {
	gulp.watch('src/**/*.js', ['scripts']);
	gulp.watch('src/*.js', ['scripts']);
	//gulp.watch('app/scss/**/*.scss', ['sass']);

})

gulp.task('default', ['scripts', 'server', 'watch']);