// var gulp = require('gulp');
// var webpack = require('webpack-stream');
// // var watch = require('gulp-watch');
//
// // Run webpack
// gulp.task('webpack', function(){
//     return gulp.src('res/src/vue/*.vue')
//         .pipe(webpack( require('./webpack.config.js') ))
//         .pipe(gulp.dest('res/dist/vue/'));
//         // .pipe(connect.reload());
// });
//
// // Default task
// gulp.task('default', ['webpack']);


'use strict';

/**
 * @var {Gulp} gulp
 */
var gulp = require('gulp');
var plumber = require('gulp-plumber');

var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');

var vueify = require('gulp-vueify');

var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var csslint = require('gulp-csslint');
var cssnano = require('gulp-cssnano');

var htmlmin = require('gulp-htmlmin');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

var bump = require('gulp-bump');
var replace = require('gulp-replace');
var argv = require('yargs').argv;
var git = require('gulp-git');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');

var fs = require('fs');
var pkg = require('./package.json');

var paths = {
    src: 'client/src',
    srcVueJs: ['client/src/**/*.js'],
    srcVueLess: ['client/src/**/*.less'],
    srcVueCss: ['client/src/**/*.css'],
    srcVueHtml: ['client/src/**/*.html'],
    srcImg: 'client/src/**/*.{png,gif,jpg}',
    dst: 'client/dist/',
    dstVue: 'client/dist/',
    pkgConfigs: [
        'package.json',
        'bower.json',
        'composer.json',
        'chayka.json',
        '.yo-rc.json'
    ]
};

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('clean', function(){
    return gulp.src(paths.dst, {read: false})
        .pipe(clean({force: true}));
});

gulp.task('libs', function(){
    return gulp.src([
        'node_modules/vue/dist/vue.min.js',
        'node_modules/vue-resource/dist/vue-resource.min.js',
    ]).pipe(concat('vendor.js')).pipe(gulp.dest('client/dist/js/'))
});

/**
 * CSS
 */
gulp.task('less', function(){
    return gulp.src(paths.srcVueLess)
        .pipe(plumber(handleError))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(sourcemaps.init())
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dstVue));
});

gulp.task('css', function(){
    return gulp.src(paths.srcVueCss)
        .pipe(plumber(handleError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(csslint())
        .pipe(csslint.formatter())
        .pipe(sourcemaps.init())
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dstVue));
});

/**
 * JS
 */
gulp.task('js', function(){
    gulp.src(paths.srcVueJs)
        .pipe(plumber(handleError))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dstVue));
});

/**
 * Html
 */
gulp.task('html', function() {
    return gulp.src(paths.srcVueHtml)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.dstVue))
});

/**
 * Images
 */
gulp.task('img', function(){
    return gulp.src(paths.srcImg)
        .pipe(plumber(handleError))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(paths.dst));
});

/**
 * Releases
 */
gulp.task('git:tag', function(){
    var currentVersion = 'v' + pkg.version;
    git.tag(currentVersion, 'Version ' + pkg.version, function (err) {
        if (err) {
            throw err;
        }
    });
});

gulp.task('git:push', function(){
    git.push('origin', 'master', {args: '--follow-tags'}, function (err) {
        if (err) {
            throw err;
        }
    });
});

gulp.task('git:add', function() {
    return gulp.src('.')
        .pipe(git.add());
});

gulp.task('git:commit:bump', function(){
    var pkgBumped = JSON.parse(fs.readFileSync('./package.json'));
    var newVersion = pkgBumped.version;
    gulp.src('.')
        .pipe(git.commit('Bumped to version ' + newVersion));
});

gulp.task('replace:version:bump', function(){
    var pkgBumped = JSON.parse(fs.readFileSync('./package.json'));
    var newVersion = pkgBumped.version;
    gulp.src(['wpplugin-experiments.php'])
        .pipe(replace(/Version:\s*[^\s]+/, 'Version: ' + newVersion))
        .pipe(gulp.dest('.'));
});

gulp.task('release:notes', shell.task([
    'cat RELEASE-NOTES.md >> RELEASE-HISTORY.md',
    'echo "" > RELEASE-NOTES.md'
]));

gulp.task('release', function(){
    runSequence('git:tag', 'release:notes');
});

/**
 * Get a task function that bumps version
 * @param release
 * @return {Function}
 */
function bumpVersion(release){
    return function() {
        release = release || 'prerelease';
        var version = argv.setversion;
        var options = {};
        if (version) {
            options.version = version;
        } else if (release) {
            options.type = release;
        }
        gulp.src(paths.pkgConfigs)
            .pipe(bump(options))
            .pipe(gulp.dest('./'))
            .on('end', function(){
                runSequence('replace:version:bump', 'git:add', 'git:commit:bump', 'git:push');
            });

    };
}
var releaseIfNeeded = pkg.version.indexOf('-') >=0 ? [] : ['release'];
gulp.task('bump:norelease', bumpVersion());
gulp.task('bump:prerelease', releaseIfNeeded, bumpVersion('prerelease'));
gulp.task('bump:patch', releaseIfNeeded, bumpVersion('patch'));
gulp.task('bump:minor', releaseIfNeeded, bumpVersion('minor'));
gulp.task('bump:major', releaseIfNeeded, bumpVersion('major'));

/**
 * Zip delivery package
 */
gulp.task('zip', function(){
    return gulp.src([
        './**',
        './.*',
        '!.git/**',
        '!.git',
        '!.gitignore',
        '!.idea/**',
        '!.idea',
        '!./res/lib/**',
        '!./res/lib',
        '!./node_modules/**',
        '!./node_modules',
        '!./build/**',
        '!./build',
        '!./webpack.config.js',
    ]).pipe(zip(pkg.name + '.' + pkg.version + '.zip'), {

    })
        .pipe(gulp.dest('build'));
});

/**
 * Heads up, build does not include images optimization,
 * run it separately, if you need to.
 */
gulp.task('build', ['libs', 'less', 'css', 'js', 'html']);

gulp.task('watch', ['build'], function(){
    gulp.watch(paths.srcVueLess, [
        'less'
    ]);
    gulp.watch(paths.srcVueCss, [
        'css'
    ]);
    gulp.watch(paths.srcVueJs, [
        'js'
    ]);
    gulp.watch(paths.srcVueHtml, [
        'html'
    ]);
    gulp.watch(paths.srcImg, [
        'img'
    ]);
});

gulp.task('default', ['watch']);