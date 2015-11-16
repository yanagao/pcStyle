var gulp = require('gulp'),
    path = require('path'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    gulpIgnore = require('gulp-ignore'),
    gulpIf = require('gulp-if'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    newer = require('gulp-newer'),
    htmlmin = require('gulp-htmlmin'),
    mainBowerFiles = require('main-bower-files'),
    gulpDebug = require('gulp-debug');

var appDir = 'web';
var publicDir = 'public';
var debug = true;

var paths = {
    styles: {
        src: path.join(appDir, 'styles/**/*.scss'),
        dist: path.join(publicDir, 'assets/css/style.css'),
        includePaths: ['bower_components/bootstrap-sass/assets/stylesheets']
    },
    scripts: {
        src: path.join(appDir, 'scripts/**/*.js'),
        dist: path.join(publicDir, 'assets/js/app.js')
    },
    images: {
        src: path.join(appDir, 'images/**/*'),
        dist: path.join(publicDir, 'assets/images')
    },
    fonts: {
        src: path.join(appDir, 'fonts/**/*'),
        dist: path.join(publicDir, 'assets/fonts')
    },
    html: {
        src: path.join(appDir, '**/*.html'),
        dist: publicDir
    }
};

gulp.task('styles', function () {
    gulp.src(paths.styles.src)
        .pipe(gulpIf(debug, sourcemaps.init()))
        .pipe(sass({
            includePaths: paths.styles.includePaths
        }))
        .pipe(autoprefixer())
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(concat(path.basename(paths.styles.dist)))
        .pipe(gulpIf(debug, sourcemaps.write()))
        .pipe(gulp.dest(path.dirname(paths.styles.dist)))
});

gulp.task('scripts', function () {
    gulp.src(paths.scripts.src)
        .pipe(gulpIf(debug, sourcemaps.init()))
        .pipe(uglify())
        .pipe(concat(path.basename(paths.scripts.dist)))
        .pipe(gulpIf(debug, sourcemaps.write()))
        .pipe(gulp.dest(path.dirname(paths.scripts.dist)))
});

gulp.task('images', function () {
    gulp.src(paths.images.src)
        .pipe(newer(paths.images.dist))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.images.dist))
});

gulp.task('fonts', function () {
    gulp.src(paths.fonts.src)
        .pipe(newer(paths.fonts.dist))
        .pipe(gulp.dest(paths.fonts.dist))
});

gulp.task('html', function () {
    gulp.src(paths.html.src)
        .pipe(newer(paths.html.dist))
        .pipe(htmlmin({collapseWhitespace: true,removeComments:true}))
        .pipe(gulp.dest(paths.html.dist));
});

gulp.task('vendor', function () {
    var condition = ['**/*html5*','**/*respond*'];
    gulp.src(mainBowerFiles())
        .pipe(gulpIgnore.include(condition))
        .pipe(uglify())
        .pipe(concat('vendor_head.js'))
        .pipe(gulp.dest(path.dirname(paths.scripts.dist)));
    gulp.src(mainBowerFiles())
        .pipe(gulpIgnore.exclude(condition))
        .pipe(uglify())
        .pipe(concat('vendor_bottom.js'))
        .pipe(gulp.dest(path.dirname(paths.scripts.dist)));
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: publicDir
        }
    });
});

gulp.task('server', ['html', 'styles', 'scripts', 'fonts', 'images', 'vendor', 'browser-sync'], function () {
    gulp.watch(paths.html.src, ['html', browserSync.reload]);
    gulp.watch(paths.styles.src, ['styles', browserSync.reload]);
    gulp.watch(paths.scripts.src, ['scripts', browserSync.reload]);
    gulp.watch(paths.fonts.src, ['fonts', browserSync.reload]);
    gulp.watch(paths.images.src, ['images', browserSync.reload])
});

gulp.task('default', ['server']);
